from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import requests
import json
from jinja2 import Template
from ..models.user import User
from ..models.task import Task

slack_discord_bp = Blueprint("slack_discord", __name__)

# Integration configurations storage (in production, use database)
INTEGRATION_CONFIGS = {}
MESSAGE_TEMPLATES = {}
ALERT_LOGS = {}
WEBHOOK_LOGS = {}

# Default message templates
DEFAULT_TEMPLATES = {
    'slack': {
        'task_assigned': {
            'text': 'New Task Assigned: {{task.title}}',
            'blocks': [
                {
                    'type': 'header',
                    'text': {
                        'type': 'plain_text',
                        'text': 'New Task Assigned'
                    }
                },
                {
                    'type': 'section',
                    'fields': [
                        {
                            'type': 'mrkdwn',
                            'text': '*Task:* {{task.title}}'
                        },
                        {
                            'type': 'mrkdwn',
                            'text': '*Priority:* {{task.priority}}'
                        },
                        {
                            'type': 'mrkdwn',
                            'text': '*Assignee:* {{task.assignee}}'
                        },
                        {
                            'type': 'mrkdwn',
                            'text': '*Due Date:* {{task.due_date or "Not set"}}'
                        }
                    ]
                },
                {
                    'type': 'section',
                    'text': {
                        'type': 'mrkdwn',
                        'text': '*Description:*\n{{task.description or "No description"}}'
                    }
                },
                {
                    'type': 'actions',
                    'elements': [
                        {
                            'type': 'button',
                            'text': {
                                'type': 'plain_text',
                                'text': 'View Task'
                            },
                            'url': 'https://your-dtms-app.com/tasks/{{task.id}}'
                        }
                    ]
                }
            ]
        },
        'task_completed': {
            'text': 'Task Completed: {{task.title}}',
            'blocks': [
                {
                    'type': 'header',
                    'text': {
                        'type': 'plain_text',
                        'text': 'Task Completed'
                    }
                },
                {
                    'type': 'section',
                    'fields': [
                        {
                            'type': 'mrkdwn',
                            'text': '*Task:* {{task.title}}'
                        },
                        {
                            'type': 'mrkdwn',
                            'text': '*Completed by:* {{task.assignee}}'
                        },
                        {
                            'type': 'mrkdwn',
                            'text': '*Priority:* {{task.priority}}'
                        },
                        {
                            'type': 'mrkdwn',
                            'text': '*Completion Date:* {{completion_date}}'
                        }
                    ]
                }
            ]
        },
        'task_overdue': {
            'text': 'Task Overdue: {{task.title}}',
            'color': 'danger',
            'blocks': [
                {
                    'type': 'header',
                    'text': {
                        'type': 'plain_text',
                        'text': 'Task Overdue Alert'
                    }
                },
                {
                    'type': 'section',
                    'fields': [
                        {
                            'type': 'mrkdwn',
                            'text': '*Task:* {{task.title}}'
                        },
                        {
                            'type': 'mrkdwn',
                            'text': '*Priority:* {{task.priority}}'
                        },
                        {
                            'type': 'mrkdwn',
                            'text': '*Due Date:* {{task.due_date}}'
                        },
                        {
                            'type': 'mrkdwn',
                            'text': '*Status:* {{task.status}}'
                        }
                    ]
                }
            ]
        },
        'daily_digest': {
            'text': 'Daily Task Digest - {{date}}',
            'blocks': [
                {
                    'type': 'header',
                    'text': {
                        'type': 'plain_text',
                        'text': 'Daily Task Digest'
                    }
                },
                {
                    'type': 'section',
                    'text': {
                        'type': 'mrkdwn',
                        'text': '*Date:* {{date}}'
                    }
                }
            ]
        }
    },
    'discord': {
        'task_assigned': {
            'title': 'New Task Assigned',
            'description': '{{task.title}}',
            'color': 5814783,  # Blue
            'fields': [
                {
                    'name': 'Priority',
                    'value': '{{task.priority}}',
                    'inline': True
                },
                {
                    'name': 'Assignee',
                    'value': '{{task.assignee}}',
                    'inline': True
                },
                {
                    'name': 'Due Date',
                    'value': '{{task.due_date or "Not set"}}',
                    'inline': True
                },
                {
                    'name': 'Description',
                    'value': '{{task.description or "No description"}}',
                    'inline': False
                }
            ],
            'footer': {
                'text': 'DTMS Task Management'
            },
            'timestamp': '{{timestamp}}'
        },
        'task_completed': {
            'title': 'Task Completed',
            'description': '{{task.title}}',
            'color': 3066993,  # Green
            'fields': [
                {
                    'name': 'Completed by',
                    'value': '{{task.assignee}}',
                    'inline': True
                },
                {
                    'name': 'Priority',
                    'value': '{{task.priority}}',
                    'inline': True
                },
                {
                    'name': 'Completion Date',
                    'value': '{{completion_date}}',
                    'inline': True
                }
            ],
            'footer': {
                'text': 'DTMS Task Management'
            },
            'timestamp': '{{timestamp}}'
        },
        'task_overdue': {
            'title': 'Task Overdue Alert',
            'description': '{{task.title}}',
            'color': 15158332,  # Red
            'fields': [
                {
                    'name': 'Priority',
                    'value': '{{task.priority}}',
                    'inline': True
                },
                {
                    'name': 'Due Date',
                    'value': '{{task.due_date}}',
                    'inline': True
                },
                {
                    'name': 'Status',
                    'value': '{{task.status}}',
                    'inline': True
                }
            ],
            'footer': {
                'text': 'DTMS Task Management'
            },
            'timestamp': '{{timestamp}}'
        },
        'daily_digest': {
            'title': 'Daily Task Digest',
            'description': 'Task summary for {{date}}',
            'color': 10181038,  # Purple
            'footer': {
                'text': 'DTMS Task Management'
            },
            'timestamp': '{{timestamp}}'
        }
    }
}

# Initialize default templates
MESSAGE_TEMPLATES.update(DEFAULT_TEMPLATES)

@slack_discord_bp.route("/integrations/config", methods=["GET"])
@jwt_required()
def get_integration_config():
    """Get integration configuration for the user"""
    user_id = get_jwt_identity()
    
    try:
        config = INTEGRATION_CONFIGS.get(user_id, {
            "slack": {
                "webhook_url": "",
                "channel": "#general",
                "enabled": False
            },
            "discord": {
                "webhook_url": "",
                "channel": "general",
                "enabled": False
            }
        })
        
        # Don't send webhook URLs to frontend
        safe_config = {
            "slack": {
                **config["slack"],
                "has_webhook": bool(config["slack"]["webhook_url"])
            },
            "discord": {
                **config["discord"],
                "has_webhook": bool(config["discord"]["webhook_url"])
            }
        }
        
        return jsonify(safe_config), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@slack_discord_bp.route("/integrations/config", methods=["POST"])
@jwt_required()
def save_integration_config():
    """Save integration configuration"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        platform = data.get("platform")  # 'slack' or 'discord'
        platform_config = data.get("config", {})
        
        if user_id not in INTEGRATION_CONFIGS:
            INTEGRATION_CONFIGS[user_id] = {
                "slack": {"webhook_url": "", "channel": "#general", "enabled": False},
                "discord": {"webhook_url": "", "channel": "general", "enabled": False}
            }
        
        INTEGRATION_CONFIGS[user_id][platform] = {
            **INTEGRATION_CONFIGS[user_id][platform],
            **platform_config,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        return jsonify({
            "success": True,
            "message": f"{platform.capitalize()} configuration saved successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@slack_discord_bp.route("/integrations/test", methods=["POST"])
@jwt_required()
def test_integration():
    """Test integration configuration"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        platform = data.get("platform")
        config = INTEGRATION_CONFIGS.get(user_id, {}).get(platform)
        
        if not config or not config.get("webhook_url"):
            return jsonify({"error": f"{platform.capitalize()} not configured"}), 400
        
        # Send test message
        test_message = {
            "text": f"Test message from DTMS - {platform.capitalize()} Integration",
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*Test Message*\nThis is a test to verify your {platform} integration is working correctly."
                    }
                }
            ]
        }
        
        result = send_webhook_message(platform, config["webhook_url"], test_message)
        
        if result['success']:
            return jsonify({
                "success": True,
                "message": f"Test message sent to {platform.capitalize()} successfully"
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": result['error']
            }), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@slack_discord_bp.route("/integrations/send", methods=["POST"])
@jwt_required()
def send_message():
    """Send message to Slack or Discord"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        platform = data.get("platform")
        config = INTEGRATION_CONFIGS.get(user_id, {}).get(platform)
        
        if not config or not config.get("enabled") or not config.get("webhook_url"):
            return jsonify({"error": f"{platform.capitalize()} not configured or disabled"}), 400
        
        message = data.get("message", {})
        
        # Add channel for Slack
        if platform == "slack" and config.get("channel"):
            message["channel"] = config["channel"]
        
        result = send_webhook_message(platform, config["webhook_url"], message)
        
        if result['success']:
            # Log message
            log_message(user_id, platform, message, "sent")
            
            return jsonify({
                "success": True,
                "message": f"Message sent to {platform.capitalize()} successfully"
            }), 200
        else:
            # Log error
            log_message(user_id, platform, message, "failed", result['error'])
            
            return jsonify({
                "success": False,
                "error": result['error']
            }), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@slack_discord_bp.route("/integrations/send-template", methods=["POST"])
@jwt_required()
def send_template_message():
    """Send message using template"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        platform = data.get("platform")
        template_name = data.get("template_name")
        context = data.get("context", {})
        
        config = INTEGRATION_CONFIGS.get(user_id, {}).get(platform)
        if not config or not config.get("enabled") or not config.get("webhook_url"):
            return jsonify({"error": f"{platform.capitalize()} not configured or disabled"}), 400
        
        # Get template
        template = MESSAGE_TEMPLATES.get(platform, {}).get(template_name)
        if not template:
            return jsonify({"error": "Template not found"}), 404
        
        # Render template
        rendered_message = render_template(template, context)
        
        # Add channel for Slack
        if platform == "slack" and config.get("channel"):
            rendered_message["channel"] = config["channel"]
        
        # Send message
        result = send_webhook_message(platform, config["webhook_url"], rendered_message)
        
        if result['success']:
            # Log message
            log_message(user_id, platform, rendered_message, "sent", template=template_name)
            
            return jsonify({
                "success": True,
                "message": f"Template message sent to {platform.capitalize()} successfully"
            }), 200
        else:
            # Log error
            log_message(user_id, platform, rendered_message, "failed", result['error'], template=template_name)
            
            return jsonify({
                "success": False,
                "error": result['error']
            }), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@slack_discord_bp.route("/integrations/templates", methods=["GET"])
@jwt_required()
def get_message_templates():
    """Get available message templates"""
    try:
        templates = {}
        for platform, platform_templates in MESSAGE_TEMPLATES.items():
            templates[platform] = list(platform_templates.keys())
        
        return jsonify({
            "templates": templates
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@slack_discord_bp.route("/integrations/templates/<platform>/<template_name>", methods=["GET"])
@jwt_required()
def get_message_template(platform, template_name):
    """Get specific message template"""
    try:
        template = MESSAGE_TEMPLATES.get(platform, {}).get(template_name)
        if not template:
            return jsonify({"error": "Template not found"}), 404
        
        return jsonify({
            "template": template
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@slack_discord_bp.route("/integrations/automation-rules", methods=["GET"])
@jwt_required()
def get_automation_rules():
    """Get automation rules for integrations"""
    user_id = get_jwt_identity()
    
    try:
        # Mock automation rules (in production, get from database)
        rules = [
            {
                "id": "rule_1",
                "name": "Task Assignment Alert",
                "platform": "slack",
                "trigger": "task_assigned",
                "template": "task_assigned",
                "enabled": True,
                "conditions": {"priority": ["high", "medium"]},
                "channel": "#tasks"
            },
            {
                "id": "rule_2",
                "name": "Overdue Task Alert",
                "platform": "discord",
                "trigger": "task_overdue",
                "template": "task_overdue",
                "enabled": True,
                "conditions": {"priority": ["high"]},
                "channel": "#alerts"
            },
            {
                "id": "rule_3",
                "name": "Daily Digest",
                "platform": "slack",
                "trigger": "daily_schedule",
                "template": "daily_digest",
                "enabled": False,
                "conditions": {},
                "channel": "#daily-summary"
            }
        ]
        
        return jsonify({
            "rules": rules
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@slack_discord_bp.route("/integrations/automation-rules/<rule_id>", methods=["PUT"])
@jwt_required()
def update_automation_rule(rule_id):
    """Update automation rule"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        # Update rule (in production, update in database)
        rule = {
            "id": rule_id,
            "name": data.get("name"),
            "platform": data.get("platform"),
            "trigger": data.get("trigger"),
            "template": data.get("template"),
            "enabled": data.get("enabled"),
            "conditions": data.get("conditions", {}),
            "channel": data.get("channel"),
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

@slack_discord_bp.route("/integrations/logs", methods=["GET"])
@jwt_required()
def get_message_logs():
    """Get message logs"""
    user_id = get_jwt_identity()
    
    try:
        # Get logs for user (in production, get from database)
        logs = [
            {
                "id": "log_1",
                "platform": "slack",
                "channel": "#tasks",
                "message": "New Task Assigned: Implement User Dashboard",
                "status": "sent",
                "sent_at": datetime.utcnow().isoformat(),
                "template": "task_assigned"
            },
            {
                "id": "log_2",
                "platform": "discord",
                "channel": "alerts",
                "message": "Task Overdue Alert: Fix Login Bug",
                "status": "failed",
                "sent_at": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                "error": "Webhook URL invalid",
                "template": "task_overdue"
            }
        ]
        
        return jsonify({
            "logs": logs,
            "total": len(logs)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@slack_discord_bp.route("/integrations/stats", methods=["GET"])
@jwt_required()
def get_integration_stats():
    """Get integration statistics"""
    user_id = get_jwt_identity()
    
    try:
        # Mock stats (in production, calculate from database)
        stats = {
            "slack": {
                "total_sent": 25,
                "total_failed": 2,
                "success_rate": 92.59,
                "last_sent": datetime.utcnow().isoformat(),
                "templates_used": {
                    "task_assigned": 15,
                    "task_completed": 8,
                    "task_overdue": 2
                }
            },
            "discord": {
                "total_sent": 18,
                "total_failed": 1,
                "success_rate": 94.74,
                "last_sent": (datetime.utcnow() - timedelta(minutes=30)).isoformat(),
                "templates_used": {
                    "task_assigned": 10,
                    "task_completed": 6,
                    "task_overdue": 2
                }
            },
            "daily_stats": [
                {"date": "2024-01-01", "slack_sent": 8, "discord_sent": 5},
                {"date": "2024-01-02", "slack_sent": 12, "discord_sent": 7},
                {"date": "2024-01-03", "slack_sent": 10, "discord_sent": 6},
                {"date": "2024-01-04", "slack_sent": 15, "discord_sent": 8}
            ]
        }
        
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Helper functions
def send_webhook_message(platform, webhook_url, message):
    """Send webhook message to Slack or Discord"""
    try:
        headers = {'Content-Type': 'application/json'}
        
        # Format message for platform
        if platform == 'discord':
            # Discord expects different format
            discord_message = {
                'content': message.get('text', ''),
                'embeds': []
            }
            
            # Convert Slack blocks to Discord embeds if needed
            if 'blocks' in message:
                embed = {
                    'title': message.get('text', ''),
                    'description': '',
                    'color': 5814783,  # Default blue
                    'timestamp': datetime.utcnow().isoformat()
                }
                
                # Extract content from blocks
                for block in message.get('blocks', []):
                    if block.get('type') == 'section':
                        if 'text' in block:
                            embed['description'] += block['text'].get('text', '') + '\n'
                        elif 'fields' in block:
                            for field in block['fields']:
                                embed['description'] += f"**{field['text'].get('text', '')}**\n"
                
                discord_message['embeds'].append(embed)
                message = discord_message
        
        # Send request
        response = requests.post(webhook_url, json=message, headers=headers, timeout=10)
        
        if response.status_code == 200:
            return {'success': True}
        else:
            return {'success': False, 'error': f'HTTP {response.status_code}: {response.text}'}
            
    except requests.exceptions.RequestException as e:
        return {'success': False, 'error': str(e)}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def render_template(template, context):
    """Render template with context"""
    context['timestamp'] = datetime.utcnow().isoformat()
    
    # Handle different template formats
    if isinstance(template, dict):
        rendered = {}
        for key, value in template.items():
            if isinstance(value, str):
                rendered[key] = render_template_string(value, context)
            elif isinstance(value, dict):
                rendered[key] = render_template(value, context)
            elif isinstance(value, list):
                rendered[key] = [render_template(item, context) if isinstance(item, dict) else item for item in value]
            else:
                rendered[key] = value
        return rendered
    else:
        return render_template_string(template, context)

def render_template_string(template_string, context):
    """Render template string with context"""
    try:
        template = Template(template_string)
        return template.render(**context)
    except Exception:
        return template_string  # Return original if template fails

def log_message(user_id, platform, message, status, error=None, template=None):
    """Log message activity"""
    log_id = f"msg_{len(ALERT_LOGS) + 1}"
    
    log_entry = {
        "id": log_id,
        "user_id": user_id,
        "platform": platform,
        "message": message.get('text', str(message)),
        "status": status,
        "sent_at": datetime.utcnow().isoformat(),
        "template": template
    }
    
    if error:
        log_entry["error"] = error
    
    ALERT_LOGS[log_id] = log_entry

# Trigger integration automation (called by other modules)
def trigger_integration_automation(trigger, context, platform=None):
    """Trigger integration automation based on trigger"""
    try:
        # Find matching automation rules
        matching_rules = []
        for rule_id, rule in INTEGRATION_AUTOMATION_RULES.items():
            if rule['trigger'] == trigger and rule['enabled']:
                if platform is None or rule['platform'] == platform:
                    matching_rules.append(rule)
        
        # Send messages for matching rules
        results = {}
        for rule in matching_rules:
            rule_platform = rule['platform']
            
            # Get all user configs for this platform
            for user_id, config in INTEGRATION_CONFIGS.items():
                user_config = config.get(rule_platform)
                if user_config and user_config.get('enabled') and user_config.get('webhook_url'):
                    # Get template
                    template = MESSAGE_TEMPLATES.get(rule_platform, {}).get(rule['template'])
                    if template:
                        # Render template
                        rendered_message = render_template(template, context)
                        
                        # Add channel for Slack
                        if rule_platform == "slack":
                            rendered_message["channel"] = rule.get('channel', user_config.get('channel', '#general'))
                        
                        # Send message
                        result = send_webhook_message(rule_platform, user_config['webhook_url'], rendered_message)
                        
                        # Log message
                        log_message(user_id, rule_platform, rendered_message, 
                                  "sent" if result['success'] else "failed",
                                  None if result['success'] else result['error'],
                                  rule['template'])
                        
                        # Track results
                        if rule_platform not in results:
                            results[rule_platform] = {'sent': 0, 'failed': 0}
                        
                        if result['success']:
                            results[rule_platform]['sent'] += 1
                        else:
                            results[rule_platform]['failed'] += 1
        
        return {'success': True, 'results': results}
        
    except Exception as e:
        return {'success': False, 'error': str(e)}
