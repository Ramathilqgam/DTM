from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import calendar
from dateutil.relativedelta import relativedelta
from ..models.user import User
from ..models.task import Task

recurring_tasks_bp = Blueprint("recurring_tasks", __name__)

# Recurrence patterns
RECURRENCE_PATTERNS = {
    "daily": {
        "name": "Daily",
        "description": "Repeats every day",
        "icon": "today",
        "color": "#2196F3"
    },
    "weekly": {
        "name": "Weekly",
        "description": "Repeats every week",
        "icon": "date_range",
        "color": "#4CAF50"
    },
    "bi_weekly": {
        "name": "Bi-Weekly",
        "description": "Repeats every two weeks",
        "icon": "calendar_month",
        "color": "#8BC34A"
    },
    "monthly": {
        "name": "Monthly",
        "description": "Repeats every month",
        "icon": "calendar_today",
        "color": "#FF9800"
    },
    "quarterly": {
        "name": "Quarterly",
        "description": "Repeats every three months",
        "icon": "event_note",
        "color": "#FF5722"
    },
    "yearly": {
        "name": "Yearly",
        "description": "Repeats every year",
        "icon": "event",
        "color": "#9C27B0"
    },
    "custom": {
        "name": "Custom",
        "description": "Custom recurrence pattern",
        "icon": "settings",
        "color": "#607D8B"
    }
}

# Week days for weekly patterns
WEEK_DAYS = {
    0: "Monday",
    1: "Tuesday", 
    2: "Wednesday",
    3: "Thursday",
    4: "Friday",
    5: "Saturday",
    6: "Sunday"
}

@recurring_tasks_bp.route("/recurring-tasks", methods=["GET"])
@jwt_required()
def get_recurring_tasks():
    """Get user's recurring tasks"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    try:
        # Get user's recurring tasks (mock implementation)
        recurring_tasks = get_user_recurring_tasks(user_id)
        
        # Get upcoming instances
        upcoming = get_upcoming_instances(user_id)
        
        # Get statistics
        stats = get_recurring_task_stats(user_id)
        
        return jsonify({
            "recurring_tasks": recurring_tasks,
            "upcoming_instances": upcoming,
            "stats": stats,
            "patterns": RECURRENCE_PATTERNS,
            "week_days": WEEK_DAYS
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@recurring_tasks_bp.route("/recurring-tasks", methods=["POST"])
@jwt_required()
def create_recurring_task():
    """Create a new recurring task"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    required_fields = ["title", "recurrence_pattern", "start_date"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        recurring_task = {
            "id": f"recurring_{datetime.now().timestamp()}",
            "user_id": user_id,
            "title": data["title"],
            "description": data.get("description", ""),
            "recurrence_pattern": data["recurrence_pattern"],
            "start_date": data["start_date"],
            "end_date": data.get("end_date"),
            "max_occurrences": data.get("max_occurrences"),
            "week_days": data.get("week_days", []),  # For weekly patterns
            "day_of_month": data.get("day_of_month"),  # For monthly patterns
            "custom_interval": data.get("custom_interval", 1),  # For custom patterns
            "priority": data.get("priority", "medium"),
            "category": data.get("category", "general"),
            "estimated_duration": data.get("estimated_duration"),
            "tags": data.get("tags", []),
            "enabled": data.get("enabled", True),
            "created_at": datetime.utcnow().isoformat(),
            "next_occurrence": calculate_next_occurrence(data),
            "occurrence_count": 0,
            "last_generated": None
        }
        
        # Validate recurrence pattern
        if not validate_recurrence_pattern(recurring_task):
            return jsonify({"error": "Invalid recurrence pattern"}), 400
        
        # Save recurring task (mock implementation)
        save_recurring_task(recurring_task)
        
        # Generate first instance if enabled
        if recurring_task["enabled"]:
            generate_next_instance(recurring_task)
        
        return jsonify({
            "success": True,
            "recurring_task": recurring_task,
            "message": "Recurring task created successfully"
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@recurring_tasks_bp.route("/recurring-tasks/<task_id>", methods=["PUT"])
@jwt_required()
def update_recurring_task(task_id):
    """Update an existing recurring task"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        # Get existing recurring task
        recurring_task = get_recurring_task_by_id(task_id, user_id)
        
        if not recurring_task:
            return jsonify({"error": "Recurring task not found"}), 404
        
        # Update fields
        updatable_fields = [
            "title", "description", "recurrence_pattern", "start_date", "end_date",
            "max_occurrences", "week_days", "day_of_month", "custom_interval",
            "priority", "category", "estimated_duration", "tags", "enabled"
        ]
        
        for field in updatable_fields:
            if field in data:
                recurring_task[field] = data[field]
        
        # Recalculate next occurrence if schedule changed
        if any(field in data for field in ["recurrence_pattern", "start_date", "week_days", "day_of_month"]):
            if not validate_recurrence_pattern(recurring_task):
                return jsonify({"error": "Invalid recurrence pattern"}), 400
            recurring_task["next_occurrence"] = calculate_next_occurrence(recurring_task)
        
        recurring_task["updated_at"] = datetime.utcnow().isoformat()
        
        # Save updated recurring task
        save_recurring_task(recurring_task)
        
        return jsonify({
            "success": True,
            "recurring_task": recurring_task,
            "message": "Recurring task updated successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@recurring_tasks_bp.route("/recurring-tasks/<task_id>", methods=["DELETE"])
@jwt_required()
def delete_recurring_task(task_id):
    """Delete a recurring task"""
    user_id = get_jwt_identity()
    
    try:
        # Verify recurring task belongs to user
        recurring_task = get_recurring_task_by_id(task_id, user_id)
        
        if not recurring_task:
            return jsonify({"error": "Recurring task not found"}), 404
        
        # Delete recurring task
        delete_recurring_task_by_id(task_id)
        
        return jsonify({
            "success": True,
            "message": "Recurring task deleted successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@recurring_tasks_bp.route("/recurring-tasks/<task_id>/instances", methods=["GET"])
@jwt_required()
def get_task_instances(task_id):
    """Get instances of a specific recurring task"""
    user_id = get_jwt_identity()
    
    try:
        # Verify recurring task belongs to user
        recurring_task = get_recurring_task_by_id(task_id, user_id)
        
        if not recurring_task:
            return jsonify({"error": "Recurring task not found"}), 404
        
        # Get instances
        instances = get_task_instances_by_recurring_id(task_id)
        
        return jsonify({
            "recurring_task": recurring_task,
            "instances": instances,
            "total_instances": len(instances)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@recurring_tasks_bp.route("/recurring-tasks/<task_id>/skip-next", methods=["POST"])
@jwt_required()
def skip_next_occurrence(task_id):
    """Skip the next occurrence of a recurring task"""
    user_id = get_jwt_identity()
    
    try:
        recurring_task = get_recurring_task_by_id(task_id, user_id)
        
        if not recurring_task:
            return jsonify({"error": "Recurring task not found"}), 404
        
        # Calculate and update next occurrence
        next_occurrence = calculate_next_occurrence_after(recurring_task["next_occurrence"], recurring_task)
        recurring_task["next_occurrence"] = next_occurrence
        recurring_task["updated_at"] = datetime.utcnow().isoformat()
        
        # Save updated recurring task
        save_recurring_task(recurring_task)
        
        return jsonify({
            "success": True,
            "next_occurrence": next_occurrence,
            "message": "Next occurrence skipped successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@recurring_tasks_bp.route("/recurring-tasks/<task_id>/complete", methods=["POST"])
@jwt_required()
def complete_recurring_task_instance(task_id):
    """Complete an instance and generate next one"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        instance_id = data.get("instance_id")
        
        # Mark instance as completed
        if instance_id:
            mark_instance_completed(instance_id, user_id)
        
        # Get recurring task
        recurring_task = get_recurring_task_by_id(task_id, user_id)
        
        if not recurring_task:
            return jsonify({"error": "Recurring task not found"}), 404
        
        # Generate next instance
        if recurring_task["enabled"]:
            next_instance = generate_next_instance(recurring_task)
            
            return jsonify({
                "success": True,
                "next_instance": next_instance,
                "message": "Instance completed and next one generated"
            }), 200
        else:
            return jsonify({
                "success": True,
                "message": "Instance completed (recurring task disabled)"
            }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@recurring_tasks_bp.route("/recurring-tasks/generate-all", methods=["POST"])
@jwt_required()
def generate_all_pending():
    """Generate all pending recurring task instances"""
    user_id = get_jwt_identity()
    
    try:
        # Get all enabled recurring tasks
        recurring_tasks = get_user_recurring_tasks(user_id)
        enabled_tasks = [task for task in recurring_tasks if task["enabled"]]
        
        generated_instances = []
        
        for task in enabled_tasks:
            if should_generate_instance(task):
                instance = generate_next_instance(task)
                if instance:
                    generated_instances.append(instance)
        
        return jsonify({
            "success": True,
            "generated_instances": generated_instances,
            "count": len(generated_instances),
            "message": f"Generated {len(generated_instances)} instances"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@recurring_tasks_bp.route("/recurring-tasks/calendar", methods=["GET"])
@jwt_required()
def get_calendar_view():
    """Get recurring tasks in calendar format"""
    user_id = get_jwt_identity()
    
    try:
        # Get query parameters
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        
        if not start_date or not end_date:
            return jsonify({"error": "Start date and end date required"}), 400
        
        # Get calendar data
        calendar_data = get_recurring_tasks_calendar(user_id, start_date, end_date)
        
        return jsonify(calendar_data), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@recurring_tasks_bp.route("/recurring-tasks/templates", methods=["GET"])
@jwt_required()
def get_task_templates():
    """Get predefined recurring task templates"""
    try:
        templates = get_recurring_task_templates()
        
        return jsonify({
            "templates": templates,
            "categories": list(set(template["category"] for template in templates))
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Helper functions for recurring tasks
def get_user_recurring_tasks(user_id):
    """Get user's recurring tasks (mock implementation)"""
    # Mock recurring task data
    return [
        {
            "id": "recurring_1",
            "title": "Daily Standup Meeting",
            "description": "Team daily standup meeting",
            "recurrence_pattern": "daily",
            "start_date": "2024-01-01",
            "end_date": None,
            "max_occurrences": None,
            "week_days": [],
            "day_of_month": None,
            "custom_interval": 1,
            "priority": "high",
            "category": "meetings",
            "estimated_duration": 30,
            "tags": ["meeting", "team"],
            "enabled": True,
            "created_at": "2024-01-01T00:00:00Z",
            "next_occurrence": (datetime.now() + timedelta(days=1)).replace(hour=9, minute=0).isoformat(),
            "occurrence_count": 45,
            "last_generated": (datetime.now() - timedelta(days=1)).isoformat()
        },
        {
            "id": "recurring_2",
            "title": "Weekly Report",
            "description": "Prepare and submit weekly progress report",
            "recurrence_pattern": "weekly",
            "start_date": "2024-01-01",
            "end_date": None,
            "max_occurrences": None,
            "week_days": [4],  # Thursday
            "day_of_month": None,
            "custom_interval": 1,
            "priority": "medium",
            "category": "reporting",
            "estimated_duration": 60,
            "tags": ["report", "weekly"],
            "enabled": True,
            "created_at": "2024-01-01T00:00:00Z",
            "next_occurrence": get_next_weekday(datetime.now(), 4).replace(hour=16, minute=0).isoformat(),
            "occurrence_count": 12,
            "last_generated": (datetime.now() - timedelta(days=7)).isoformat()
        },
        {
            "id": "recurring_3",
            "title": "Monthly Review",
            "description": "Monthly performance and goal review",
            "recurrence_pattern": "monthly",
            "start_date": "2024-01-01",
            "end_date": None,
            "max_occurrences": None,
            "week_days": [],
            "day_of_month": 1,  # First day of month
            "custom_interval": 1,
            "priority": "medium",
            "category": "review",
            "estimated_duration": 90,
            "tags": ["review", "monthly"],
            "enabled": True,
            "created_at": "2024-01-01T00:00:00Z",
            "next_occurrence": get_next_month_day(datetime.now(), 1).replace(hour=10, minute=0).isoformat(),
            "occurrence_count": 3,
            "last_generated": (datetime.now() - timedelta(days=30)).isoformat()
        }
    ]

def get_upcoming_instances(user_id):
    """Get upcoming instances of recurring tasks"""
    # Mock upcoming instances
    return [
        {
            "id": "instance_1",
            "recurring_task_id": "recurring_1",
            "title": "Daily Standup Meeting",
            "scheduled_date": (datetime.now() + timedelta(days=1)).replace(hour=9, minute=0).isoformat(),
            "status": "pending",
            "generated_at": datetime.utcnow().isoformat()
        },
        {
            "id": "instance_2",
            "recurring_task_id": "recurring_2",
            "title": "Weekly Report",
            "scheduled_date": get_next_weekday(datetime.now(), 4).replace(hour=16, minute=0).isoformat(),
            "status": "pending",
            "generated_at": datetime.utcnow().isoformat()
        }
    ]

def get_recurring_task_stats(user_id):
    """Get statistics for recurring tasks"""
    recurring_tasks = get_user_recurring_tasks(user_id)
    
    return {
        "total_recurring_tasks": len(recurring_tasks),
        "active_tasks": len([task for task in recurring_tasks if task["enabled"]]),
        "paused_tasks": len([task for task in recurring_tasks if not task["enabled"]]),
        "total_instances_generated": sum(task["occurrence_count"] for task in recurring_tasks),
        "by_pattern": {
            pattern: len([task for task in recurring_tasks if task["recurrence_pattern"] == pattern])
            for pattern in RECURRENCE_PATTERNS.keys()
        },
        "by_priority": {
            priority: len([task for task in recurring_tasks if task["priority"] == priority])
            for priority in ["high", "medium", "low"]
        },
        "next_7_days": len(get_upcoming_instances(user_id))
    }

def validate_recurrence_pattern(recurring_task):
    """Validate recurrence pattern configuration"""
    pattern = recurring_task["recurrence_pattern"]
    
    if pattern == "weekly" and not recurring_task.get("week_days"):
        return False
    
    if pattern == "monthly" and not recurring_task.get("day_of_month"):
        return False
    
    if pattern == "custom" and not recurring_task.get("custom_interval"):
        return False
    
    return True

def calculate_next_occurrence(recurring_task):
    """Calculate the next occurrence of a recurring task"""
    pattern = recurring_task["recurrence_pattern"]
    start_date = datetime.fromisoformat(recurring_task["start_date"])
    
    if pattern == "daily":
        return calculate_daily_occurrence(start_date, recurring_task)
    elif pattern == "weekly":
        return calculate_weekly_occurrence(start_date, recurring_task)
    elif pattern == "bi_weekly":
        return calculate_bi_weekly_occurrence(start_date, recurring_task)
    elif pattern == "monthly":
        return calculate_monthly_occurrence(start_date, recurring_task)
    elif pattern == "quarterly":
        return calculate_quarterly_occurrence(start_date, recurring_task)
    elif pattern == "yearly":
        return calculate_yearly_occurrence(start_date, recurring_task)
    elif pattern == "custom":
        return calculate_custom_occurrence(start_date, recurring_task)
    else:
        return start_date.isoformat()

def calculate_daily_occurrence(start_date, recurring_task):
    """Calculate next daily occurrence"""
    now = datetime.now()
    if now.time() < start_date.time():
        return now.replace(hour=start_date.hour, minute=start_date.minute, second=0, microsecond=0).isoformat()
    else:
        return (now + timedelta(days=1)).replace(hour=start_date.hour, minute=start_date.minute, second=0, microsecond=0).isoformat()

def calculate_weekly_occurrence(start_date, recurring_task):
    """Calculate next weekly occurrence"""
    week_days = recurring_task.get("week_days", [])
    now = datetime.now()
    
    for day_offset in range(7):
        next_date = now + timedelta(days=day_offset)
        if next_date.weekday() in week_days:
            return next_date.replace(hour=start_date.hour, minute=start_date.minute, second=0, microsecond=0).isoformat()
    
    # If no matching day found this week, go to next week
    for day_offset in range(7, 14):
        next_date = now + timedelta(days=day_offset)
        if next_date.weekday() in week_days:
            return next_date.replace(hour=start_date.hour, minute=start_date.minute, second=0, microsecond=0).isoformat()
    
    return (now + timedelta(days=7)).replace(hour=start_date.hour, minute=start_date.minute, second=0, microsecond=0).isoformat()

def calculate_bi_weekly_occurrence(start_date, recurring_task):
    """Calculate next bi-weekly occurrence"""
    now = datetime.now()
    weeks_since_start = (now - start_date).days // 7
    
    if weeks_since_start % 2 == 0:
        return now.replace(hour=start_date.hour, minute=start_date.minute, second=0, microsecond=0).isoformat()
    else:
        return (now + timedelta(days=7)).replace(hour=start_date.hour, minute=start_date.minute, second=0, microsecond=0).isoformat()

def calculate_monthly_occurrence(start_date, recurring_task):
    """Calculate next monthly occurrence"""
    day_of_month = recurring_task.get("day_of_month", start_date.day)
    now = datetime.now()
    
    # If this month's day hasn't passed yet
    if now.day <= day_of_month:
        next_date = now.replace(day=day_of_month)
    else:
        # Go to next month
        next_date = now + relativedelta(months=1)
        next_date = next_date.replace(day=min(day_of_month, calendar.monthrange(next_date.year, next_date.month)[1]))
    
    return next_date.replace(hour=start_date.hour, minute=start_date.minute, second=0, microsecond=0).isoformat()

def calculate_quarterly_occurrence(start_date, recurring_task):
    """Calculate next quarterly occurrence"""
    now = datetime.now()
    start_month = start_date.month
    
    # Find next quarter
    current_quarter = (now.month - 1) // 3 + 1
    start_quarter = (start_month - 1) // 3 + 1
    
    if current_quarter >= start_quarter:
        # Next year's first quarter
        next_quarter = 1
        next_year = now.year + 1
    else:
        # This year's next quarter
        next_quarter = current_quarter + 1
        next_year = now.year
    
    next_month = (next_quarter - 1) * 3 + 1
    next_date = datetime(next_year, next_month, start_date.day)
    
    return next_date.replace(hour=start_date.hour, minute=start_date.minute, second=0, microsecond=0).isoformat()

def calculate_yearly_occurrence(start_date, recurring_task):
    """Calculate next yearly occurrence"""
    now = datetime.now()
    start_month = start_date.month
    start_day = start_date.day
    
    if now.month < start_month or (now.month == start_month and now.day <= start_day):
        next_date = now.replace(month=start_month, day=start_day)
    else:
        next_date = now.replace(year=now.year + 1, month=start_month, day=start_day)
    
    return next_date.replace(hour=start_date.hour, minute=start_date.minute, second=0, microsecond=0).isoformat()

def calculate_custom_occurrence(start_date, recurring_task):
    """Calculate next custom occurrence"""
    interval = recurring_task.get("custom_interval", 1)
    now = datetime.now()
    
    # Default to daily with custom interval
    next_date = now + timedelta(days=interval)
    
    return next_date.replace(hour=start_date.hour, minute=start_date.minute, second=0, microsecond=0).isoformat()

def calculate_next_occurrence_after(current_occurrence, recurring_task):
    """Calculate occurrence after a specific date"""
    current = datetime.fromisoformat(current_occurrence.replace('Z', '+00:00'))
    pattern = recurring_task["recurrence_pattern"]
    
    if pattern == "daily":
        return (current + timedelta(days=1)).isoformat()
    elif pattern == "weekly":
        return (current + timedelta(weeks=1)).isoformat()
    elif pattern == "bi_weekly":
        return (current + timedelta(weeks=2)).isoformat()
    elif pattern == "monthly":
        return (current + relativedelta(months=1)).isoformat()
    elif pattern == "quarterly":
        return (current + relativedelta(months=3)).isoformat()
    elif pattern == "yearly":
        return (current + relativedelta(years=1)).isoformat()
    else:
        return (current + timedelta(days=1)).isoformat()

def save_recurring_task(recurring_task):
    """Save recurring task (mock implementation)"""
    # In real implementation, would save to database
    pass

def get_recurring_task_by_id(task_id, user_id):
    """Get recurring task by ID (mock implementation)"""
    tasks = get_user_recurring_tasks(user_id)
    for task in tasks:
        if task["id"] == task_id:
            return task
    return None

def delete_recurring_task_by_id(task_id):
    """Delete recurring task by ID (mock implementation)"""
    # In real implementation, would delete from database
    pass

def get_task_instances_by_recurring_id(recurring_id):
    """Get instances of a recurring task (mock implementation)"""
    # Mock instances data
    return [
        {
            "id": "instance_1",
            "recurring_task_id": recurring_id,
            "title": "Generated Instance",
            "scheduled_date": (datetime.now() - timedelta(days=7)).isoformat(),
            "completed_date": (datetime.now() - timedelta(days=7)).isoformat(),
            "status": "completed"
        },
        {
            "id": "instance_2",
            "recurring_task_id": recurring_id,
            "title": "Generated Instance",
            "scheduled_date": (datetime.now()).isoformat(),
            "status": "pending"
        }
    ]

def mark_instance_completed(instance_id, user_id):
    """Mark instance as completed (mock implementation)"""
    # In real implementation, would update database
    return True

def should_generate_instance(recurring_task):
    """Check if a new instance should be generated"""
    if not recurring_task["enabled"]:
        return False
    
    next_occurrence = datetime.fromisoformat(recurring_task["next_occurrence"].replace('Z', '+00:00'))
    now = datetime.now()
    
    # Check if next occurrence is in the past or very near future
    return next_occurrence <= (now + timedelta(hours=1))

def generate_next_instance(recurring_task):
    """Generate the next instance of a recurring task"""
    if not should_generate_instance(recurring_task):
        return None
    
    # Create instance
    instance = {
        "id": f"instance_{datetime.now().timestamp()}",
        "recurring_task_id": recurring_task["id"],
        "title": recurring_task["title"],
        "description": recurring_task["description"],
        "scheduled_date": recurring_task["next_occurrence"],
        "priority": recurring_task["priority"],
        "category": recurring_task["category"],
        "estimated_duration": recurring_task["estimated_duration"],
        "tags": recurring_task["tags"],
        "status": "pending",
        "generated_at": datetime.utcnow().isoformat()
    }
    
    # Update recurring task
    recurring_task["occurrence_count"] += 1
    recurring_task["last_generated"] = datetime.utcnow().isoformat()
    recurring_task["next_occurrence"] = calculate_next_occurrence_after(recurring_task["next_occurrence"], recurring_task)
    
    # Check for end conditions
    if recurring_task.get("max_occurrences") and recurring_task["occurrence_count"] >= recurring_task["max_occurrences"]:
        recurring_task["enabled"] = False
    
    if recurring_task.get("end_date"):
        end_date = datetime.fromisoformat(recurring_task["end_date"])
        next_date = datetime.fromisoformat(recurring_task["next_occurrence"])
        if next_date > end_date:
            recurring_task["enabled"] = False
    
    # Save updated recurring task
    save_recurring_task(recurring_task)
    
    return instance

def get_recurring_tasks_calendar(user_id, start_date, end_date):
    """Get recurring tasks in calendar format"""
    # Mock calendar data
    return {
        "events": [
            {
                "id": "recurring_1",
                "title": "Daily Standup",
                "start": "2024-01-15T09:00:00",
                "end": "2024-01-15T09:30:00",
                "recurrence": "daily",
                "color": "#2196F3"
            },
            {
                "id": "recurring_2", 
                "title": "Weekly Report",
                "start": "2024-01-18T16:00:00",
                "end": "2024-01-18T17:00:00",
                "recurrence": "weekly",
                "color": "#4CAF50"
            }
        ],
        "total_events": 2
    }

def get_recurring_task_templates():
    """Get predefined recurring task templates"""
    return [
        {
            "id": "template_1",
            "name": "Daily Standup",
            "description": "Daily team standup meeting",
            "recurrence_pattern": "daily",
            "priority": "high",
            "category": "meetings",
            "estimated_duration": 15,
            "tags": ["meeting", "daily", "team"]
        },
        {
            "id": "template_2",
            "name": "Weekly Review",
            "description": "Weekly progress and goal review",
            "recurrence_pattern": "weekly",
            "week_days": [4],  # Thursday
            "priority": "medium",
            "category": "review",
            "estimated_duration": 60,
            "tags": ["review", "weekly", "planning"]
        },
        {
            "id": "template_3",
            "name": "Monthly Report",
            "description": "Monthly performance and metrics report",
            "recurrence_pattern": "monthly",
            "day_of_month": 1,
            "priority": "medium",
            "category": "reporting",
            "estimated_duration": 120,
            "tags": ["report", "monthly", "metrics"]
        },
        {
            "id": "template_4",
            "name": "Quarterly Planning",
            "description": "Quarterly goal setting and planning",
            "recurrence_pattern": "quarterly",
            "priority": "high",
            "category": "planning",
            "estimated_duration": 180,
            "tags": ["planning", "quarterly", "strategy"]
        }
    ]

def get_next_weekday(date, weekday):
    """Get the next occurrence of a specific weekday"""
    days_ahead = weekday - date.weekday()
    if days_ahead <= 0:
        days_ahead += 7
    return date + timedelta(days=days_ahead)

def get_next_month_day(date, day):
    """Get the next occurrence of a specific day of month"""
    if date.day <= day:
        # This month
        try:
            return date.replace(day=day)
        except ValueError:
            # Day doesn't exist in this month
            return date + relativedelta(months=1, day=day)
    else:
        # Next month
        return date + relativedelta(months=1, day=day)
