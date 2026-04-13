from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import schedule
import time
import threading
from ..models.user import User
from ..models.task import Task

smart_automation_bp = Blueprint("smart_automation", __name__)

# Automation rules storage (in production, use database)
AUTOMATION_RULES = {}
WORKFLOW_RULES = {}

# Background scheduler
scheduler_thread = None
scheduler_running = False

class AutomationEngine:
    def __init__(self):
        self.rules = []
        self.workflow_rules = []
        
    def add_rule(self, rule):
        self.rules.append(rule)
        
    def add_workflow_rule(self, rule):
        self.workflow_rules.append(rule)
        
    def check_task_status_automation(self):
        """Check and update task statuses based on deadlines"""
        try:
            current_time = datetime.utcnow()
            tasks = Task.get_all_tasks()
            
            for task in tasks:
                if task.due_date and task.status != 'completed':
                    due_date = datetime.fromisoformat(task.due_date.replace('Z', '+00:00'))
                    
                    # Mark as overdue if deadline passed
                    if due_date < current_time and task.status != 'overdue':
                        task.status = 'overdue'
                        task.save()
                        
                        # Trigger workflow rules
                        self.trigger_workflows('task_overdue', task)
                        
                    # Send reminder for tasks due soon
                    elif due_date - current_time <= timedelta(hours=24) and task.status != 'overdue':
                        self.trigger_workflows('task_due_soon', task)
                        
        except Exception as e:
            print(f"Error in automation check: {e}")
            
    def trigger_workflows(self, event, task):
        """Trigger workflow rules based on events"""
        for rule in self.workflow_rules:
            if rule['trigger'] == event:
                self.execute_workflow_action(rule, task)
                
    def execute_workflow_action(self, rule, task):
        """Execute workflow action"""
        action = rule['action']
        
        if action['type'] == 'notify':
            self.send_notification(action['target'], task, action['message'])
        elif action['type'] == 'update_status':
            self.update_task_status(task, action['status'])
        elif action['type'] == 'assign':
            self.assign_task(task, action['assignee'])
        elif action['type'] == 'email':
            self.send_email(action['recipient'], task, action['subject'], action['body'])
            
    def send_notification(self, target, task, message):
        """Send notification (mock implementation)"""
        print(f"Notification to {target}: {message} - Task: {task.title}")
        
    def update_task_status(self, task, status):
        """Update task status"""
        task.status = status
        task.save()
        
    def assign_task(self, task, assignee):
        """Assign task to user"""
        task.assignee = assignee
        task.save()
        
    def send_email(self, recipient, task, subject, body):
        """Send email (mock implementation)"""
        print(f"Email to {recipient}: {subject} - Task: {task.title}")

# Global automation engine
automation_engine = AutomationEngine()

def run_scheduler():
    """Run the background scheduler"""
    global scheduler_running
    scheduler_running = True
    
    while scheduler_running:
        schedule.run_pending()
        time.sleep(60)  # Check every minute

# Schedule automation checks
schedule.every(5).minutes.do(automation_engine.check_task_status_automation)

@smart_automation_bp.route("/automation/rules", methods=["GET"])
@jwt_required()
def get_automation_rules():
    """Get automation rules for the user"""
    user_id = get_jwt_identity()
    
    try:
        user_rules = [rule for rule in AUTOMATION_RULES.values() if rule.get('user_id') == user_id]
        return jsonify({
            "rules": user_rules,
            "total": len(user_rules)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@smart_automation_bp.route("/automation/rules", methods=["POST"])
@jwt_required()
def create_automation_rule():
    """Create a new automation rule"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        rule = {
            "id": f"rule_{len(AUTOMATION_RULES) + 1}",
            "user_id": user_id,
            "name": data.get("name"),
            "description": data.get("description"),
            "trigger": data.get("trigger"),
            "conditions": data.get("conditions", {}),
            "actions": data.get("actions", []),
            "enabled": data.get("enabled", True),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        AUTOMATION_RULES[rule["id"]] = rule
        automation_engine.add_rule(rule)
        
        return jsonify({
            "success": True,
            "rule": rule
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@smart_automation_bp.route("/automation/rules/<rule_id>", methods=["PUT"])
@jwt_required()
def update_automation_rule(rule_id):
    """Update an automation rule"""
    user_id = get_jwt_identity()
    
    try:
        if rule_id not in AUTOMATION_RULES:
            return jsonify({"error": "Rule not found"}), 404
            
        rule = AUTOMATION_RULES[rule_id]
        if rule.get('user_id') != user_id:
            return jsonify({"error": "Unauthorized"}), 403
            
        data = request.get_json()
        rule.update({
            **data,
            "updated_at": datetime.utcnow().isoformat()
        })
        
        return jsonify({
            "success": True,
            "rule": rule
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@smart_automation_bp.route("/automation/rules/<rule_id>", methods=["DELETE"])
@jwt_required()
def delete_automation_rule(rule_id):
    """Delete an automation rule"""
    user_id = get_jwt_identity()
    
    try:
        if rule_id not in AUTOMATION_RULES:
            return jsonify({"error": "Rule not found"}), 404
            
        rule = AUTOMATION_RULES[rule_id]
        if rule.get('user_id') != user_id:
            return jsonify({"error": "Unauthorized"}), 403
            
        del AUTOMATION_RULES[rule_id]
        
        return jsonify({
            "success": True,
            "message": "Rule deleted successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@smart_automation_bp.route("/automation/workflow-rules", methods=["GET"])
@jwt_required()
def get_workflow_rules():
    """Get workflow rules for the user"""
    user_id = get_jwt_identity()
    
    try:
        user_rules = [rule for rule in WORKFLOW_RULES.values() if rule.get('user_id') == user_id]
        return jsonify({
            "rules": user_rules,
            "total": len(user_rules)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@smart_automation_bp.route("/automation/workflow-rules", methods=["POST"])
@jwt_required()
def create_workflow_rule():
    """Create a new workflow rule"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        rule = {
            "id": f"workflow_{len(WORKFLOW_RULES) + 1}",
            "user_id": user_id,
            "name": data.get("name"),
            "description": data.get("description"),
            "trigger": data.get("trigger"),
            "conditions": data.get("conditions", {}),
            "action": data.get("action"),
            "enabled": data.get("enabled", True),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        WORKFLOW_RULES[rule["id"]] = rule
        automation_engine.add_workflow_rule(rule)
        
        return jsonify({
            "success": True,
            "rule": rule
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@smart_automation_bp.route("/automation/workflow-rules/<rule_id>", methods=["PUT"])
@jwt_required()
def update_workflow_rule(rule_id):
    """Update a workflow rule"""
    user_id = get_jwt_identity()
    
    try:
        if rule_id not in WORKFLOW_RULES:
            return jsonify({"error": "Rule not found"}), 404
            
        rule = WORKFLOW_RULES[rule_id]
        if rule.get('user_id') != user_id:
            return jsonify({"error": "Unauthorized"}), 403
            
        data = request.get_json()
        rule.update({
            **data,
            "updated_at": datetime.utcnow().isoformat()
        })
        
        return jsonify({
            "success": True,
            "rule": rule
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@smart_automation_bp.route("/automation/workflow-rules/<rule_id>", methods=["DELETE"])
@jwt_required()
def delete_workflow_rule(rule_id):
    """Delete a workflow rule"""
    user_id = get_jwt_identity()
    
    try:
        if rule_id not in WORKFLOW_RULES:
            return jsonify({"error": "Rule not found"}), 404
            
        rule = WORKFLOW_RULES[rule_id]
        if rule.get('user_id') != user_id:
            return jsonify({"error": "Unauthorized"}), 403
            
        del WORKFLOW_RULES[rule_id]
        
        return jsonify({
            "success": True,
            "message": "Workflow rule deleted successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@smart_automation_bp.route("/automation/status", methods=["GET"])
@jwt_required()
def get_automation_status():
    """Get automation system status"""
    try:
        return jsonify({
            "scheduler_running": scheduler_running,
            "total_automation_rules": len(AUTOMATION_RULES),
            "total_workflow_rules": len(WORKFLOW_RULES),
            "last_check": datetime.utcnow().isoformat(),
            "next_check": (datetime.utcnow() + timedelta(minutes=5)).isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@smart_automation_bp.route("/automation/trigger-manual", methods=["POST"])
@jwt_required()
def trigger_manual_automation():
    """Manually trigger automation check"""
    user_id = get_jwt_identity()
    
    try:
        # Check if user has permission
        automation_engine.check_task_status_automation()
        
        return jsonify({
            "success": True,
            "message": "Automation check triggered successfully",
            "timestamp": datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@smart_automation_bp.route("/automation/history", methods=["GET"])
@jwt_required()
def get_automation_history():
    """Get automation execution history"""
    user_id = get_jwt_identity()
    
    try:
        # Mock history data
        history = [
            {
                "id": "hist_1",
                "rule_name": "Auto Mark Overdue",
                "trigger": "task_overdue",
                "action": "update_status",
                "target": "Task #123",
                "timestamp": datetime.utcnow().isoformat(),
                "status": "success"
            },
            {
                "id": "hist_2", 
                "rule_name": "Notify Admin",
                "trigger": "task_completed",
                "action": "notify",
                "target": "admin@example.com",
                "timestamp": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                "status": "success"
            }
        ]
        
        return jsonify({
            "history": history,
            "total": len(history)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Initialize default automation rules
def init_default_rules():
    """Initialize default automation rules"""
    
    # Auto mark overdue rule
    overdue_rule = {
        "id": "default_overdue",
        "user_id": None,  # System rule
        "name": "Auto Mark Overdue",
        "description": "Automatically mark tasks as overdue when deadline passes",
        "trigger": "deadline_passed",
        "conditions": {},
        "actions": [
            {"type": "update_status", "status": "overdue"},
            {"type": "notify", "target": "assignee", "message": "Task is now overdue"}
        ],
        "enabled": True,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    AUTOMATION_RULES[overdue_rule["id"]] = overdue_rule
    automation_engine.add_rule(overdue_rule)
    
    # Notify admin on completion rule
    completion_rule = {
        "id": "default_completion_notify",
        "user_id": None,  # System rule
        "name": "Notify Admin on Completion",
        "description": "Notify admin when high-priority tasks are completed",
        "trigger": "task_completed",
        "conditions": {"priority": "high"},
        "action": {
            "type": "notify",
            "target": "admin",
            "message": "High-priority task completed"
        },
        "enabled": True,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    WORKFLOW_RULES[completion_rule["id"]] = completion_rule
    automation_engine.add_workflow_rule(completion_rule)

# Start scheduler thread
def start_scheduler():
    global scheduler_thread
    if scheduler_thread is None or not scheduler_thread.is_alive():
        scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
        scheduler_thread.start()

# Initialize on import
init_default_rules()
start_scheduler()
