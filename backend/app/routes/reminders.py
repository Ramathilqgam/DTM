from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import random
from ..models.user import User
from ..models.task import Task

reminders_bp = Blueprint("reminders", __name__)

# Reminder types and configurations
REMINDER_TYPES = {
    "deadline": {
        "name": "Deadline Reminder",
        "description": "Remind before task deadline",
        "default_times": ["1_day_before", "1_hour_before", "15_minutes_before"],
        "icon": "event",
        "color": "#F44336"
    },
    "daily_check": {
        "name": "Daily Check",
        "description": "Daily task review reminder",
        "default_times": ["09:00", "14:00", "18:00"],
        "icon": "today",
        "color": "#2196F3"
    },
    "weekly_review": {
        "name": "Weekly Review",
        "description": "Weekly progress review",
        "default_times": ["monday_09:00"],
        "icon": "date_range",
        "color": "#4CAF50"
    },
    "priority_task": {
        "name": "Priority Task",
        "description": "High priority task reminder",
        "default_times": ["2_hours_before", "30_minutes_before"],
        "icon": "priority_high",
        "color": "#FF9800"
    },
    "habit_building": {
        "name": "Habit Building",
        "description": "Build consistent work habits",
        "default_times": ["08:00", "12:00", "17:00"],
        "icon": "trending_up",
        "color": "#9C27B0"
    },
    "break_reminder": {
        "name": "Break Reminder",
        "description": "Take regular breaks",
        "default_times": ["every_2_hours", "every_90_minutes"],
        "icon": "self_improvement",
        "color": "#00BCD4"
    }
}

# Notification channels
NOTIFICATION_CHANNELS = {
    "in_app": {
        "name": "In-App",
        "enabled": True,
        "config": {}
    },
    "email": {
        "name": "Email",
        "enabled": False,
        "config": {"address": "", "frequency": "immediate"}
    },
    "push": {
        "name": "Push Notification",
        "enabled": False,
        "config": {"device_token": ""}
    },
    "sms": {
        "name": "SMS",
        "enabled": False,
        "config": {"phone_number": ""}
    }
}

@reminders_bp.route("/reminders", methods=["GET"])
@jwt_required()
def get_reminders():
    """Get user's reminders and notification settings"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    try:
        # Get user's reminders (mock implementation)
        user_reminders = get_user_reminders(user_id)
        
        # Get notification preferences
        preferences = get_notification_preferences(user_id)
        
        # Get upcoming reminders
        upcoming = get_upcoming_reminders(user_id)
        
        return jsonify({
            "reminders": user_reminders,
            "preferences": preferences,
            "upcoming": upcoming,
            "available_types": REMINDER_TYPES,
            "channels": NOTIFICATION_CHANNELS,
            "stats": get_reminder_stats(user_id)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reminders_bp.route("/reminders", methods=["POST"])
@jwt_required()
def create_reminder():
    """Create a new reminder"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    required_fields = ["type", "title", "schedule"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        reminder = {
            "id": f"reminder_{datetime.now().timestamp()}",
            "user_id": user_id,
            "type": data["type"],
            "title": data["title"],
            "description": data.get("description", ""),
            "schedule": data["schedule"],
            "channels": data.get("channels", ["in_app"]),
            "enabled": data.get("enabled", True),
            "created_at": datetime.utcnow().isoformat(),
            "next_trigger": calculate_next_trigger(data["schedule"]),
            "task_id": data.get("task_id"),
            "repeat_pattern": data.get("repeat_pattern", "once")
        }
        
        # Save reminder (mock implementation)
        save_reminder(reminder)
        
        return jsonify({
            "success": True,
            "reminder": reminder,
            "message": "Reminder created successfully"
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reminders_bp.route("/reminders/<reminder_id>", methods=["PUT"])
@jwt_required()
def update_reminder(reminder_id):
    """Update an existing reminder"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        # Get existing reminder
        reminder = get_reminder_by_id(reminder_id, user_id)
        
        if not reminder:
            return jsonify({"error": "Reminder not found"}), 404
        
        # Update reminder fields
        updatable_fields = ["title", "description", "schedule", "channels", "enabled", "repeat_pattern"]
        for field in updatable_fields:
            if field in data:
                reminder[field] = data[field]
        
        # Recalculate next trigger if schedule changed
        if "schedule" in data:
            reminder["next_trigger"] = calculate_next_trigger(data["schedule"])
        
        reminder["updated_at"] = datetime.utcnow().isoformat()
        
        # Save updated reminder
        save_reminder(reminder)
        
        return jsonify({
            "success": True,
            "reminder": reminder,
            "message": "Reminder updated successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reminders_bp.route("/reminders/<reminder_id>", methods=["DELETE"])
@jwt_required()
def delete_reminder(reminder_id):
    """Delete a reminder"""
    user_id = get_jwt_identity()
    
    try:
        # Verify reminder belongs to user
        reminder = get_reminder_by_id(reminder_id, user_id)
        
        if not reminder:
            return jsonify({"error": "Reminder not found"}), 404
        
        # Delete reminder
        delete_reminder_by_id(reminder_id)
        
        return jsonify({
            "success": True,
            "message": "Reminder deleted successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reminders_bp.route("/smart-suggestions", methods=["GET"])
@jwt_required()
def get_smart_suggestions():
    """Get AI-powered reminder suggestions"""
    user_id = get_jwt_identity()
    
    try:
        # Get user's tasks and patterns
        tasks = Task.find_visible_to_user(user_id)
        user_patterns = analyze_user_patterns(user_id)
        
        # Generate smart suggestions
        suggestions = generate_smart_reminder_suggestions(tasks, user_patterns)
        
        return jsonify({
            "suggestions": suggestions,
            "confidence_scores": calculate_suggestion_confidence(suggestions),
            "generated_at": datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reminders_bp.route("/notifications", methods=["GET"])
@jwt_required()
def get_notifications():
    """Get user's notifications"""
    user_id = get_jwt_identity()
    
    try:
        # Get query parameters
        limit = request.args.get("limit", 20, type=int)
        unread_only = request.args.get("unread_only", "false").lower() == "true"
        
        # Get notifications
        notifications = get_user_notifications(user_id, limit, unread_only)
        
        return jsonify({
            "notifications": notifications,
            "unread_count": count_unread_notifications(user_id),
            "total_count": count_total_notifications(user_id)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reminders_bp.route("/notifications/<notification_id>/read", methods=["POST"])
@jwt_required()
def mark_notification_read(notification_id):
    """Mark notification as read"""
    user_id = get_jwt_identity()
    
    try:
        success = mark_notification_as_read(notification_id, user_id)
        
        if not success:
            return jsonify({"error": "Notification not found"}), 404
        
        return jsonify({
            "success": True,
            "message": "Notification marked as read"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reminders_bp.route("/notifications/mark-all-read", methods=["POST"])
@jwt_required()
def mark_all_notifications_read():
    """Mark all notifications as read"""
    user_id = get_jwt_identity()
    
    try:
        count = mark_all_notifications_as_read(user_id)
        
        return jsonify({
            "success": True,
            "marked_count": count,
            "message": f"Marked {count} notifications as read"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reminders_bp.route("/preferences", methods=["GET"])
@jwt_required()
def get_preferences():
    """Get notification preferences"""
    user_id = get_jwt_identity()
    
    try:
        preferences = get_notification_preferences(user_id)
        return jsonify(preferences), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reminders_bp.route("/preferences", methods=["PUT"])
@jwt_required()
def update_preferences():
    """Update notification preferences"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        # Update preferences
        preferences = update_notification_preferences(user_id, data)
        
        return jsonify({
            "success": True,
            "preferences": preferences,
            "message": "Preferences updated successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reminders_bp.route("/test-notification", methods=["POST"])
@jwt_required()
def test_notification():
    """Send a test notification"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        channel = data.get("channel", "in_app")
        message = data.get("message", "This is a test notification")
        
        # Send test notification
        notification_id = send_notification(user_id, {
            "type": "test",
            "title": "Test Notification",
            "message": message,
            "channels": [channel],
            "priority": "low"
        })
        
        return jsonify({
            "success": True,
            "notification_id": notification_id,
            "message": f"Test notification sent via {channel}"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Helper functions for reminders and notifications
def get_user_reminders(user_id):
    """Get user's reminders (mock implementation)"""
    # Mock reminder data
    return [
        {
            "id": "reminder_1",
            "type": "deadline",
            "title": "Project Proposal Deadline",
            "description": "Complete project proposal before deadline",
            "schedule": "1_day_before",
            "channels": ["in_app", "email"],
            "enabled": True,
            "next_trigger": (datetime.now() + timedelta(days=1)).isoformat(),
            "task_id": "task_1",
            "repeat_pattern": "once",
            "created_at": (datetime.now() - timedelta(days=5)).isoformat()
        },
        {
            "id": "reminder_2",
            "type": "daily_check",
            "title": "Daily Task Review",
            "description": "Review and plan daily tasks",
            "schedule": "09:00",
            "channels": ["in_app"],
            "enabled": True,
            "next_trigger": (datetime.now().replace(hour=9, minute=0, second=0) + timedelta(days=1)).isoformat(),
            "repeat_pattern": "daily",
            "created_at": (datetime.now() - timedelta(days=10)).isoformat()
        },
        {
            "id": "reminder_3",
            "type": "break_reminder",
            "title": "Take a Break",
            "description": "Time for a short break to recharge",
            "schedule": "every_2_hours",
            "channels": ["in_app"],
            "enabled": True,
            "next_trigger": (datetime.now() + timedelta(hours=2)).isoformat(),
            "repeat_pattern": "hourly",
            "created_at": (datetime.now() - timedelta(days=2)).isoformat()
        }
    ]

def get_notification_preferences(user_id):
    """Get user's notification preferences"""
    return {
        "channels": {
            "in_app": {"enabled": True, "sound": True, "vibration": False},
            "email": {"enabled": True, "address": "user@example.com", "frequency": "daily"},
            "push": {"enabled": False, "device_token": ""},
            "sms": {"enabled": False, "phone_number": ""}
        },
        "quiet_hours": {
            "enabled": True,
            "start": "22:00",
            "end": "08:00",
            "timezone": "UTC"
        },
        "frequency_limits": {
            "max_per_hour": 10,
            "max_per_day": 50,
            "cooldown_minutes": 5
        },
        "types": {
            "deadline": {"enabled": True, "priority": "high"},
            "daily_check": {"enabled": True, "priority": "medium"},
            "weekly_review": {"enabled": True, "priority": "low"},
            "priority_task": {"enabled": True, "priority": "high"},
            "habit_building": {"enabled": False, "priority": "medium"},
            "break_reminder": {"enabled": True, "priority": "low"}
        }
    }

def get_upcoming_reminders(user_id):
    """Get upcoming reminders for next 24 hours"""
    now = datetime.now()
    tomorrow = now + timedelta(days=1)
    
    reminders = get_user_reminders(user_id)
    upcoming = []
    
    for reminder in reminders:
        if reminder["enabled"] and reminder["next_trigger"]:
            next_trigger = datetime.fromisoformat(reminder["next_trigger"].replace('Z', '+00:00'))
            if now <= next_trigger <= tomorrow:
                upcoming.append({
                    **reminder,
                    "time_until": (next_trigger - now).total_seconds() / 3600  # hours
                })
    
    return sorted(upcoming, key=lambda x: x["time_until"])

def get_reminder_stats(user_id):
    """Get reminder statistics"""
    reminders = get_user_reminders(user_id)
    
    return {
        "total_reminders": len(reminders),
        "active_reminders": len([r for r in reminders if r["enabled"]]),
        "disabled_reminders": len([r for r in reminders if not r["enabled"]]),
        "by_type": {
            r_type: len([r for r in reminders if r["type"] == r_type])
            for r_type in REMINDER_TYPES.keys()
        },
        "next_24_hours": len(get_upcoming_reminders(user_id))
    }

def calculate_next_trigger(schedule):
    """Calculate when reminder should next trigger"""
    now = datetime.now()
    
    if schedule == "1_day_before":
        return (now + timedelta(days=1)).isoformat()
    elif schedule == "1_hour_before":
        return (now + timedelta(hours=1)).isoformat()
    elif schedule == "15_minutes_before":
        return (now + timedelta(minutes=15)).isoformat()
    elif schedule == "09:00":
        next_day = now + timedelta(days=1)
        return next_day.replace(hour=9, minute=0, second=0).isoformat()
    elif schedule == "14:00":
        next_day = now + timedelta(days=1)
        return next_day.replace(hour=14, minute=0, second=0).isoformat()
    elif schedule == "18:00":
        next_day = now + timedelta(days=1)
        return next_day.replace(hour=18, minute=0, second=0).isoformat()
    elif schedule == "every_2_hours":
        return (now + timedelta(hours=2)).isoformat()
    elif schedule == "every_90_minutes":
        return (now + timedelta(minutes=90)).isoformat()
    else:
        return (now + timedelta(hours=1)).isoformat()

def save_reminder(reminder):
    """Save reminder (mock implementation)"""
    # In real implementation, would save to database
    pass

def get_reminder_by_id(reminder_id, user_id):
    """Get reminder by ID (mock implementation)"""
    reminders = get_user_reminders(user_id)
    for reminder in reminders:
        if reminder["id"] == reminder_id:
            return reminder
    return None

def delete_reminder_by_id(reminder_id):
    """Delete reminder by ID (mock implementation)"""
    # In real implementation, would delete from database
    pass

def analyze_user_patterns(user_id):
    """Analyze user's task completion patterns"""
    # Mock implementation - would analyze actual user data
    return {
        "most_productive_hours": [9, 10, 14, 15],
        "average_task_completion_time": 2.5,
        "preferred_reminder_frequency": "daily",
        "deadline_compliance_rate": 0.85,
        "break_frequency": "every_2_hours"
    }

def generate_smart_reminder_suggestions(tasks, patterns):
    """Generate AI-powered reminder suggestions"""
    suggestions = []
    
    # Suggest deadline reminders for tasks with deadlines
    tasks_with_deadlines = [t for t in tasks if t.get("deadline")]
    if len(tasks_with_deadlines) > 3:
        suggestions.append({
            "type": "deadline",
            "title": "Deadline Management",
            "description": "Set up reminders for your upcoming deadlines",
            "reason": "You have multiple tasks with deadlines",
            "confidence": 0.9,
            "recommended_schedule": ["1_day_before", "1_hour_before"],
            "affected_tasks": len(tasks_with_deadlines)
        })
    
    # Suggest daily check reminders based on productivity patterns
    if patterns.get("most_productive_hours"):
        suggestions.append({
            "type": "daily_check",
            "title": "Optimal Daily Planning",
            "description": "Schedule daily task review during your peak hours",
            "reason": f"You're most productive at {patterns['most_productive_hours'][0]}:00",
            "confidence": 0.85,
            "recommended_schedule": [f"{patterns['most_productive_hours'][0]}:00"],
            "affected_tasks": len(tasks)
        })
    
    # Suggest break reminders
    if patterns.get("average_task_completion_time", 0) > 2:
        suggestions.append({
            "type": "break_reminder",
            "title": "Regular Break Schedule",
            "description": "Take breaks to maintain productivity",
            "reason": "Your tasks take longer than 2 hours on average",
            "confidence": 0.8,
            "recommended_schedule": ["every_2_hours"],
            "affected_tasks": "all"
        })
    
    return suggestions

def calculate_suggestion_confidence(suggestions):
    """Calculate confidence scores for suggestions"""
    return {
        suggestion["id"]: suggestion["confidence"]
        for suggestion in suggestions
    }

def get_user_notifications(user_id, limit=20, unread_only=False):
    """Get user's notifications"""
    # Mock notification data
    notifications = [
        {
            "id": "notif_1",
            "type": "reminder",
            "title": "Task Due Soon",
            "message": "Project proposal is due tomorrow",
            "read": False,
            "created_at": (datetime.now() - timedelta(hours=2)).isoformat(),
            "priority": "high",
            "channels": ["in_app"]
        },
        {
            "id": "notif_2",
            "type": "achievement",
            "title": "Achievement Unlocked",
            "message": "You've completed 10 tasks this week!",
            "read": True,
            "created_at": (datetime.now() - timedelta(days=1)).isoformat(),
            "priority": "medium",
            "channels": ["in_app"]
        },
        {
            "id": "notif_3",
            "type": "system",
            "title": "System Update",
            "message": "New features available in your dashboard",
            "read": False,
            "created_at": (datetime.now() - timedelta(hours=6)).isoformat(),
            "priority": "low",
            "channels": ["in_app"]
        }
    ]
    
    if unread_only:
        notifications = [n for n in notifications if not n["read"]]
    
    return notifications[:limit]

def count_unread_notifications(user_id):
    """Count unread notifications"""
    notifications = get_user_notifications(user_id, unread_only=True)
    return len(notifications)

def count_total_notifications(user_id):
    """Count total notifications"""
    notifications = get_user_notifications(user_id)
    return len(notifications)

def mark_notification_as_read(notification_id, user_id):
    """Mark notification as read"""
    # Mock implementation - would update database
    return True

def mark_all_notifications_as_read(user_id):
    """Mark all notifications as read"""
    # Mock implementation - would update database
    return 3

def update_notification_preferences(user_id, data):
    """Update notification preferences"""
    # Mock implementation - would update database
    preferences = get_notification_preferences(user_id)
    
    # Update preferences with new data
    if "channels" in data:
        preferences["channels"].update(data["channels"])
    if "quiet_hours" in data:
        preferences["quiet_hours"].update(data["quiet_hours"])
    if "frequency_limits" in data:
        preferences["frequency_limits"].update(data["frequency_limits"])
    if "types" in data:
        preferences["types"].update(data["types"])
    
    return preferences

def send_notification(user_id, notification_data):
    """Send notification to user"""
    # Mock implementation - would send actual notification
    notification_id = f"notif_{datetime.now().timestamp()}"
    
    # Store notification
    notification = {
        "id": notification_id,
        "user_id": user_id,
        **notification_data,
        "created_at": datetime.utcnow().isoformat(),
        "read": False
    }
    
    return notification_id
