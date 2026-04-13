from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import ssl
from jinja2 import Template
from ..models.user import User
from ..models.task import Task

email_integration_bp = Blueprint("email_integration", __name__)

# Email configuration storage (in production, use database)
EMAIL_CONFIGS = {}
EMAIL_TEMPLATES = {}
EMAIL_LOGS = {}

# Default email templates
DEFAULT_TEMPLATES = {
    'task_assigned': {
        'subject': 'New Task Assigned: {{task.title}}',
        'html': '''
        <html>
        <body>
            <h2>New Task Assigned</h2>
            <p>Hello {{user.name}},</p>
            <p>You have been assigned a new task:</p>
            <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0;">
                <h3>{{task.title}}</h3>
                <p><strong>Description:</strong> {{task.description or 'No description'}}</p>
                <p><strong>Priority:</strong> {{task.priority}}</p>
                <p><strong>Due Date:</strong> {{task.due_date or 'Not set'}}</p>
                <p><strong>Status:</strong> {{task.status}}</p>
            </div>
            <p>Please log in to view and manage this task.</p>
            <p>Best regards,<br>DTMS Team</p>
        </body>
        </html>
        ''',
        'text': '''
        New Task Assigned
        
        Hello {{user.name}},
        
        You have been assigned a new task:
        
        Title: {{task.title}}
        Description: {{task.description or 'No description'}}
        Priority: {{task.priority}}
        Due Date: {{task.due_date or 'Not set'}}
        Status: {{task.status}}
        
        Please log in to view and manage this task.
        
        Best regards,
        DTMS Team
        '''
    },
    'task_completed': {
        'subject': 'Task Completed: {{task.title}}',
        'html': '''
        <html>
        <body>
            <h2>Task Completed</h2>
            <p>Hello {{user.name}},</p>
            <p>The following task has been completed:</p>
            <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0;">
                <h3>{{task.title}}</h3>
                <p><strong>Description:</strong> {{task.description or 'No description'}}</p>
                <p><strong>Priority:</strong> {{task.priority}}</p>
                <p><strong>Completed by:</strong> {{task.assignee}}</p>
                <p><strong>Completion Date:</strong> {{completion_date}}</p>
            </div>
            <p>Congratulations on completing this task!</p>
            <p>Best regards,<br>DTMS Team</p>
        </body>
        </html>
        ''',
        'text': '''
        Task Completed
        
        Hello {{user.name}},
        
        The following task has been completed:
        
        Title: {{task.title}}
        Description: {{task.description or 'No description'}}
        Priority: {{task.priority}}
        Completed by: {{task.assignee}}
        Completion Date: {{completion_date}}
        
        Congratulations on completing this task!
        
        Best regards,
        DTMS Team
        '''
    },
    'task_overdue': {
        'subject': 'Task Overdue: {{task.title}}',
        'html': '''
        <html>
        <body>
            <h2>Task Overdue Alert</h2>
            <p>Hello {{user.name}},</p>
            <p>The following task is now overdue:</p>
            <div style="border: 1px solid #ff6b6b; padding: 15px; margin: 10px 0; background-color: #ffe6e6;">
                <h3>{{task.title}}</h3>
                <p><strong>Description:</strong> {{task.description or 'No description'}}</p>
                <p><strong>Priority:</strong> {{task.priority}}</p>
                <p><strong>Due Date:</strong> {{task.due_date}}</p>
                <p><strong>Status:</strong> {{task.status}}</p>
            </div>
            <p>Please take action on this overdue task.</p>
            <p>Best regards,<br>DTMS Team</p>
        </body>
        </html>
        ''',
        'text': '''
        Task Overdue Alert
        
        Hello {{user.name}},
        
        The following task is now overdue:
        
        Title: {{task.title}}
        Description: {{task.description or 'No description'}}
        Priority: {{task.priority}}
        Due Date: {{task.due_date}}
        Status: {{task.status}}
        
        Please take action on this overdue task.
        
        Best regards,
        DTMS Team
        '''
    },
    'daily_digest': {
        'subject': 'Daily Task Digest - {{date}}',
        'html': '''
        <html>
        <body>
            <h2>Daily Task Digest</h2>
            <p>Hello {{user.name}},</p>
            <p>Here's your task summary for {{date}}:</p>
            
            <h3>Tasks Due Today</h3>
            {% for task in tasks_due_today %}
            <div style="border: 1px solid #ddd; padding: 10px; margin: 5px 0;">
                <strong>{{task.title}}</strong> - {{task.priority}} priority
            </div>
            {% endfor %}
            
            <h3>Overdue Tasks</h3>
            {% for task in overdue_tasks %}
            <div style="border: 1px solid #ff6b6b; padding: 10px; margin: 5px 0; background-color: #ffe6e6;">
                <strong>{{task.title}}</strong> - Due: {{task.due_date}}
            </div>
            {% endfor %}
            
            <h3>Completed Today</h3>
            {% for task in completed_today %}
            <div style="border: 1px solid #51cf66; padding: 10px; margin: 5px 0; background-color: #e6ffe6;">
                <strong>{{task.title}}</strong> - Completed
            </div>
            {% endfor %}
            
            <p>Have a productive day!</p>
            <p>Best regards,<br>DTMS Team</p>
        </body>
        </html>
        ''',
        'text': '''
        Daily Task Digest
        
        Hello {{user.name}},
        
        Here's your task summary for {{date}}:
        
        Tasks Due Today:
        {% for task in tasks_due_today %}
        - {{task.title}} ({{task.priority}} priority)
        {% endfor %}
        
        Overdue Tasks:
        {% for task in overdue_tasks %}
        - {{task.title}} (Due: {{task.due_date}})
        {% endfor %}
        
        Completed Today:
        {% for task in completed_today %}
        - {{task.title}}
        {% endfor %}
        
        Have a productive day!
        
        Best regards,
        DTMS Team
        '''
    }
}

# Initialize default templates
EMAIL_TEMPLATES.update(DEFAULT_TEMPLATES)

@email_integration_bp.route("/email/config", methods=["GET"])
@jwt_required()
def get_email_config():
    """Get email configuration for the user"""
    user_id = get_jwt_identity()
    
    try:
        config = EMAIL_CONFIGS.get(user_id, {
            "smtp_server": "",
            "smtp_port": 587,
            "username": "",
            "password": "",
            "use_tls": True,
            "use_ssl": False,
            "from_email": "",
            "from_name": "DTMS",
            "enabled": False
        })
        
        # Don't send password to frontend
        safe_config = {k: v for k, v in config.items() if k != 'password'}
        safe_config['has_password'] = bool(config.get('password'))
        
        return jsonify(safe_config), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@email_integration_bp.route("/email/config", methods=["POST"])
@jwt_required()
def save_email_config():
    """Save email configuration"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        config = {
            "smtp_server": data.get("smtp_server"),
            "smtp_port": int(data.get("smtp_port", 587)),
            "username": data.get("username"),
            "password": data.get("password"),
            "use_tls": data.get("use_tls", True),
            "use_ssl": data.get("use_ssl", False),
            "from_email": data.get("from_email"),
            "from_name": data.get("from_name", "DTMS"),
            "enabled": data.get("enabled", False),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        EMAIL_CONFIGS[user_id] = config
        
        return jsonify({
            "success": True,
            "message": "Email configuration saved successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@email_integration_bp.route("/email/test", methods=["POST"])
@jwt_required()
def test_email_config():
    """Test email configuration"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        config = EMAIL_CONFIGS.get(user_id)
        if not config:
            return jsonify({"error": "Email configuration not found"}), 404
        
        # Send test email
        result = send_email(
            config,
            data.get("to_email"),
            "Test Email from DTMS",
            "This is a test email to verify your email configuration.",
            "<html><body><h2>Test Email</h2><p>This is a test email to verify your email configuration.</p></body></html>"
        )
        
        if result['success']:
            return jsonify({
                "success": True,
                "message": "Test email sent successfully"
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": result['error']
            }), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@email_integration_bp.route("/email/send", methods=["POST"])
@jwt_required()
def send_email_notification():
    """Send email notification"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        config = EMAIL_CONFIGS.get(user_id)
        if not config or not config.get('enabled'):
            return jsonify({"error": "Email not configured or disabled"}), 400
        
        result = send_email(
            config,
            data.get("to_email"),
            data.get("subject"),
            data.get("text_body"),
            data.get("html_body")
        )
        
        if result['success']:
            # Log email
            log_email(user_id, data.get("to_email"), data.get("subject"), "sent")
            
            return jsonify({
                "success": True,
                "message": "Email sent successfully"
            }), 200
        else:
            # Log error
            log_email(user_id, data.get("to_email"), data.get("subject"), "failed", result['error'])
            
            return jsonify({
                "success": False,
                "error": result['error']
            }), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@email_integration_bp.route("/email/templates", methods=["GET"])
@jwt_required()
def get_email_templates():
    """Get available email templates"""
    try:
        templates = {k: {'subject': v['subject']} for k, v in EMAIL_TEMPLATES.items()}
        return jsonify({
            "templates": templates
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@email_integration_bp.route("/email/templates/<template_name>", methods=["GET"])
@jwt_required()
def get_email_template(template_name):
    """Get specific email template"""
    try:
        template = EMAIL_TEMPLATES.get(template_name)
        if not template:
            return jsonify({"error": "Template not found"}), 404
        
        return jsonify({
            "template": template
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@email_integration_bp.route("/email/templates/<template_name>", methods=["PUT"])
@jwt_required()
def update_email_template(template_name):
    """Update email template"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        template = {
            'subject': data.get('subject'),
            'html': data.get('html'),
            'text': data.get('text'),
            'updated_by': user_id,
            'updated_at': datetime.utcnow().isoformat()
        }
        
        EMAIL_TEMPLATES[template_name] = template
        
        return jsonify({
            "success": True,
            "message": "Template updated successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@email_integration_bp.route("/email/send-template", methods=["POST"])
@jwt_required()
def send_template_email():
    """Send email using template"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        config = EMAIL_CONFIGS.get(user_id)
        if not config or not config.get('enabled'):
            return jsonify({"error": "Email not configured or disabled"}), 400
        
        template_name = data.get('template_name')
        template = EMAIL_TEMPLATES.get(template_name)
        if not template:
            return jsonify({"error": "Template not found"}), 404
        
        # Render template
        context = data.get('context', {})
        subject = render_template(template['subject'], context)
        html_body = render_template(template['html'], context)
        text_body = render_template(template['text'], context)
        
        # Send email
        result = send_email(
            config,
            data.get("to_email"),
            subject,
            text_body,
            html_body
        )
        
        if result['success']:
            # Log email
            log_email(user_id, data.get("to_email"), subject, "sent", template=template_name)
            
            return jsonify({
                "success": True,
                "message": "Template email sent successfully"
            }), 200
        else:
            # Log error
            log_email(user_id, data.get("to_email"), subject, "failed", result['error'], template=template_name)
            
            return jsonify({
                "success": False,
                "error": result['error']
            }), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@email_integration_bp.route("/email/automation-rules", methods=["GET"])
@jwt_required()
def get_email_automation_rules():
    """Get email automation rules"""
    user_id = get_jwt_identity()
    
    try:
        # Mock automation rules (in production, get from database)
        rules = [
            {
                "id": "rule_1",
                "name": "Task Assignment Notification",
                "trigger": "task_assigned",
                "template": "task_assigned",
                "enabled": True,
                "conditions": {"priority": ["high", "medium"]},
                "recipients": ["assignee", "manager"]
            },
            {
                "id": "rule_2",
                "name": "Overdue Task Alert",
                "trigger": "task_overdue",
                "template": "task_overdue",
                "enabled": True,
                "conditions": {"priority": ["high"]},
                "recipients": ["assignee", "manager"]
            },
            {
                "id": "rule_3",
                "name": "Daily Digest",
                "trigger": "daily_schedule",
                "template": "daily_digest",
                "enabled": False,
                "conditions": {},
                "recipients": ["user"]
            }
        ]
        
        return jsonify({
            "rules": rules
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@email_integration_bp.route("/email/automation-rules/<rule_id>", methods=["PUT"])
@jwt_required()
def update_email_automation_rule(rule_id):
    """Update email automation rule"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        # Update rule (in production, update in database)
        rule = {
            "id": rule_id,
            "name": data.get("name"),
            "trigger": data.get("trigger"),
            "template": data.get("template"),
            "enabled": data.get("enabled"),
            "conditions": data.get("conditions", {}),
            "recipients": data.get("recipients"),
            "updated_by": user_id,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        return jsonify({
            "success": True,
            "rule": rule,
            "message": "Automation rule updated successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@email_integration_bp.route("/email/logs", methods=["GET"])
@jwt_required()
def get_email_logs():
    """Get email logs"""
    user_id = get_jwt_identity()
    
    try:
        # Get logs for user (in production, get from database)
        logs = [
            {
                "id": "log_1",
                "to_email": "user@example.com",
                "subject": "Task Assigned: New Feature Development",
                "status": "sent",
                "sent_at": datetime.utcnow().isoformat(),
                "template": "task_assigned"
            },
            {
                "id": "log_2",
                "to_email": "manager@example.com",
                "subject": "Task Overdue: Bug Fix",
                "status": "failed",
                "sent_at": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                "error": "SMTP connection failed",
                "template": "task_overdue"
            }
        ]
        
        return jsonify({
            "logs": logs,
            "total": len(logs)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@email_integration_bp.route("/email/stats", methods=["GET"])
@jwt_required()
def get_email_stats():
    """Get email statistics"""
    user_id = get_jwt_identity()
    
    try:
        # Mock stats (in production, calculate from database)
        stats = {
            "total_sent": 45,
            "total_failed": 3,
            "success_rate": 93.75,
            "last_sent": datetime.utcnow().isoformat(),
            "templates_used": {
                "task_assigned": 25,
                "task_completed": 15,
                "task_overdue": 5,
                "daily_digest": 0
            },
            "daily_stats": [
                {"date": "2024-01-01", "sent": 8, "failed": 0},
                {"date": "2024-01-02", "sent": 12, "failed": 1},
                {"date": "2024-01-03", "sent": 10, "failed": 0},
                {"date": "2024-01-04", "sent": 15, "failed": 2}
            ]
        }
        
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Helper functions
def send_email(config, to_email, subject, text_body, html_body=None):
    """Send email using SMTP"""
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{config['from_name']} <{config['from_email']}>"
        msg['To'] = to_email
        
        # Add body
        if text_body:
            msg.attach(MIMEText(text_body, 'plain'))
        if html_body:
            msg.attach(MIMEText(html_body, 'html'))
        
        # Connect to SMTP server
        if config['use_ssl']:
            context = ssl.create_default_context()
            server = smtplib.SMTP_SSL(config['smtp_server'], config['smtp_port'], context=context)
        else:
            server = smtplib.SMTP(config['smtp_server'], config['smtp_port'])
            if config['use_tls']:
                context = ssl.create_default_context()
                server.starttls(context=context)
        
        # Login and send
        server.login(config['username'], config['password'])
        server.send_message(msg)
        server.quit()
        
        return {'success': True}
        
    except Exception as e:
        return {'success': False, 'error': str(e)}

def render_template(template_string, context):
    """Render template with context"""
    template = Template(template_string)
    return template.render(**context)

def log_email(user_id, to_email, subject, status, error=None, template=None):
    """Log email activity"""
    log_id = f"email_{len(EMAIL_LOGS) + 1}"
    
    log_entry = {
        "id": log_id,
        "user_id": user_id,
        "to_email": to_email,
        "subject": subject,
        "status": status,
        "sent_at": datetime.utcnow().isoformat(),
        "template": template
    }
    
    if error:
        log_entry["error"] = error
    
    EMAIL_LOGS[log_id] = log_entry

# Trigger email automation (called by other modules)
def trigger_email_automation(trigger, context, recipients):
    """Trigger email automation based on trigger"""
    try:
        # Find matching automation rules
        matching_rules = []
        for rule_id, rule in EMAIL_AUTOMATION_RULES.items():
            if rule['trigger'] == trigger and rule['enabled']:
                matching_rules.append(rule)
        
        # Send emails for matching rules
        for rule in matching_rules:
            template = EMAIL_TEMPLATES.get(rule['template'])
            if template:
                for recipient in recipients:
                    # Get email config for user
                    config = EMAIL_CONFIGS.get(recipient)
                    if config and config.get('enabled'):
                        # Render template
                        subject = render_template(template['subject'], context)
                        html_body = render_template(template['html'], context)
                        text_body = render_template(template['text'], context)
                        
                        # Send email
                        result = send_email(config, recipient, subject, text_body, html_body)
                        
                        # Log email
                        log_email(recipient, recipient, subject, 
                                "sent" if result['success'] else "failed",
                                None if result['success'] else result['error'],
                                rule['template'])
        
        return {'success': True, 'emails_sent': len(matching_rules)}
        
    except Exception as e:
        return {'success': False, 'error': str(e)}
