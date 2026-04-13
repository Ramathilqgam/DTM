from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta, date
import calendar
from dateutil.relativedelta import relativedelta
from ..models.user import User
from ..models.task import Task

calendar_view_bp = Blueprint("calendar_view", __name__)

# Calendar view types
CALENDAR_VIEWS = {
    "month": {
        "name": "Month View",
        "description": "Traditional month calendar view",
        "icon": "calendar_month"
    },
    "week": {
        "name": "Week View",
        "description": "Detailed week view with time slots",
        "icon": "view_week"
    },
    "day": {
        "name": "Day View",
        "description": "Detailed single day view",
        "icon": "view_day"
    },
    "agenda": {
        "name": "Agenda View",
        "description": "List of upcoming events",
        "icon": "agenda"
    }
}

# Task event types
EVENT_TYPES = {
    "task": {
        "name": "Task",
        "description": "Regular task event",
        "color": "#2196F3",
        "icon": "assignment"
    },
    "meeting": {
        "name": "Meeting",
        "description": "Meeting or appointment",
        "color": "#4CAF50",
        "icon": "groups"
    },
    "deadline": {
        "name": "Deadline",
        "description": "Task deadline",
        "color": "#F44336",
        "icon": "alarm"
    },
    "reminder": {
        "name": "Reminder",
        "description": "Task reminder",
        "color": "#FF9800",
        "icon": "notifications"
    },
    "recurring": {
        "name": "Recurring",
        "description": "Recurring task instance",
        "color": "#9C27B0",
        "icon": "repeat"
    }
}

@calendar_view_bp.route("/calendar/events", methods=["GET"])
@jwt_required()
def get_calendar_events():
    """Get calendar events for specified date range"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    try:
        # Get query parameters
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        view_type = request.args.get("view", "month")
        
        if not start_date or not end_date:
            return jsonify({"error": "Start date and end date required"}), 400
        
        start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        # Get calendar events
        events = get_user_calendar_events(user_id, start_dt, end_dt, view_type)
        
        # Get calendar statistics
        stats = get_calendar_statistics(user_id, start_dt, end_dt)
        
        return jsonify({
            "events": events,
            "statistics": stats,
            "view_type": view_type,
            "date_range": {
                "start_date": start_date,
                "end_date": end_date
            },
            "available_views": CALENDAR_VIEWS,
            "event_types": EVENT_TYPES
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@calendar_view_bp.route("/calendar/events", methods=["POST"])
@jwt_required()
def create_calendar_event():
    """Create a new calendar event"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    required_fields = ["title", "start_date", "end_date", "event_type"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        event = {
            "id": f"event_{datetime.now().timestamp()}",
            "user_id": user_id,
            "title": data["title"],
            "description": data.get("description", ""),
            "start_date": data["start_date"],
            "end_date": data["end_date"],
            "event_type": data["event_type"],
            "all_day": data.get("all_day", False),
            "location": data.get("location", ""),
            "attendees": data.get("attendees", []),
            "priority": data.get("priority", "medium"),
            "status": data.get("status", "scheduled"),
            "recurrence": data.get("recurrence"),
            "reminders": data.get("reminders", []),
            "tags": data.get("tags", []),
            "task_id": data.get("task_id"),  # Link to existing task
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Validate event dates
        if not validate_event_dates(event):
            return jsonify({"error": "Invalid event dates"}), 400
        
        # Save event
        save_calendar_event(event)
        
        # Link to task if specified
        if event.get("task_id"):
            link_event_to_task(event["id"], event["task_id"])
        
        return jsonify({
            "success": True,
            "event": event,
            "message": "Calendar event created successfully"
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@calendar_view_bp.route("/calendar/events/<event_id>", methods=["PUT"])
@jwt_required()
def update_calendar_event(event_id):
    """Update an existing calendar event"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        # Get existing event
        event = get_calendar_event_by_id(event_id, user_id)
        
        if not event:
            return jsonify({"error": "Event not found"}), 404
        
        # Update event fields
        updatable_fields = [
            "title", "description", "start_date", "end_date", "event_type",
            "all_day", "location", "attendees", "priority", "status",
            "recurrence", "reminders", "tags"
        ]
        
        for field in updatable_fields:
            if field in data:
                event[field] = data[field]
        
        # Validate updated dates
        if not validate_event_dates(event):
            return jsonify({"error": "Invalid event dates"}), 400
        
        event["updated_at"] = datetime.utcnow().isoformat()
        
        # Save updated event
        save_calendar_event(event)
        
        return jsonify({
            "success": True,
            "event": event,
            "message": "Event updated successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@calendar_view_bp.route("/calendar/events/<event_id>", methods=["DELETE"])
@jwt_required()
def delete_calendar_event(event_id):
    """Delete a calendar event"""
    user_id = get_jwt_identity()
    
    try:
        # Verify event belongs to user
        event = get_calendar_event_by_id(event_id, user_id)
        
        if not event:
            return jsonify({"error": "Event not found"}), 404
        
        # Delete event
        delete_calendar_event_by_id(event_id)
        
        # Unlink from task if linked
        if event.get("task_id"):
            unlink_event_from_task(event_id, event["task_id"])
        
        return jsonify({
            "success": True,
            "message": "Event deleted successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@calendar_view_bp.route("/calendar/events/<event_id>/move", methods=["POST"])
@jwt_required()
def move_calendar_event(event_id):
    """Move event to new date/time"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        new_start_date = data.get("start_date")
        new_end_date = data.get("end_date")
        
        if not new_start_date or not new_end_date:
            return jsonify({"error": "New start and end dates required"}), 400
        
        # Get existing event
        event = get_calendar_event_by_id(event_id, user_id)
        
        if not event:
            return jsonify({"error": "Event not found"}), 404
        
        # Calculate duration difference
        original_duration = datetime.fromisoformat(event["end_date"]) - datetime.fromisoformat(event["start_date"])
        new_start_dt = datetime.fromisoformat(new_start_date.replace('Z', '+00:00'))
        new_end_dt = new_start_dt + original_duration
        
        # Update event dates
        event["start_date"] = new_start_date
        event["end_date"] = new_end_dt.isoformat()
        event["updated_at"] = datetime.utcnow().isoformat()
        
        # Save updated event
        save_calendar_event(event)
        
        return jsonify({
            "success": True,
            "event": event,
            "message": "Event moved successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@calendar_view_bp.route("/calendar/events/<event_id>/resize", methods=["POST"])
@jwt_required()
def resize_calendar_event(event_id):
    """Resize event duration"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        new_end_date = data.get("end_date")
        
        if not new_end_date:
            return jsonify({"error": "New end date required"}), 400
        
        # Get existing event
        event = get_calendar_event_by_id(event_id, user_id)
        
        if not event:
            return jsonify({"error": "Event not found"}), 404
        
        # Validate new end date
        new_end_dt = datetime.fromisoformat(new_end_date.replace('Z', '+00:00'))
        start_dt = datetime.fromisoformat(event["start_date"].replace('Z', '+00:00'))
        
        if new_end_dt <= start_dt:
            return jsonify({"error": "End date must be after start date"}), 400
        
        # Update event
        event["end_date"] = new_end_date
        event["updated_at"] = datetime.utcnow().isoformat()
        
        # Save updated event
        save_calendar_event(event)
        
        return jsonify({
            "success": True,
            "event": event,
            "message": "Event resized successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@calendar_view_bp.route("/calendar/schedule", methods=["GET"])
@jwt_required()
def get_schedule_availability():
    """Get user's schedule availability for scheduling"""
    user_id = get_jwt_identity()
    
    try:
        # Get query parameters
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        
        if not start_date or not end_date:
            return jsonify({"error": "Start date and end date required"}), 400
        
        start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        # Get availability
        availability = get_user_availability(user_id, start_dt, end_dt)
        
        # Get busy slots
        busy_slots = get_user_busy_slots(user_id, start_dt, end_dt)
        
        return jsonify({
            "availability": availability,
            "busy_slots": busy_slots,
            "suggestions": generate_scheduling_suggestions(user_id, start_dt, end_dt)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@calendar_view_bp.route("/calendar/sync", methods=["POST"])
@jwt_required()
def sync_calendar_with_tasks():
    """Sync calendar with existing tasks"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        sync_type = data.get("sync_type", "upcoming")  # upcoming, all, date_range
        date_range = data.get("date_range")
        
        # Get tasks to sync
        tasks = get_tasks_for_sync(user_id, sync_type, date_range)
        
        # Create calendar events for tasks
        synced_events = []
        for task in tasks:
            if not task_has_calendar_event(task["id"]):
                event = create_event_from_task(task)
                save_calendar_event(event)
                synced_events.append(event)
        
        return jsonify({
            "success": True,
            "synced_events": synced_events,
            "total_synced": len(synced_events),
            "message": f"Synced {len(synced_events)} tasks to calendar"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@calendar_view_bp.route("/calendar/templates", methods=["GET"])
@jwt_required()
def get_calendar_templates():
    """Get calendar event templates"""
    try:
        templates = get_event_templates()
        
        return jsonify({
            "templates": templates,
            "categories": list(set(template["category"] for template in templates))
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@calendar_view_bp.route("/calendar/export", methods=["GET"])
@jwt_required()
def export_calendar():
    """Export calendar in various formats"""
    user_id = get_jwt_identity()
    
    try:
        export_format = request.args.get("format", "ics")
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        
        if not start_date or not end_date:
            return jsonify({"error": "Start date and end date required"}), 400
        
        start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        if export_format == "ics":
            ics_data = generate_ics_export(user_id, start_dt, end_dt)
            return ics_data, 200, {
                "Content-Type": "text/calendar",
                "Content-Disposition": f"attachment; filename=calendar_{datetime.now().strftime('%Y%m%d')}.ics"
            }
        elif export_format == "json":
            events = get_user_calendar_events(user_id, start_dt, end_dt, "month")
            return jsonify(events), 200
        else:
            return jsonify({"error": "Unsupported export format"}), 400
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# In-memory storage for calendar events (for testing)
CALENDAR_EVENTS_DB = {}

# Helper functions for calendar view
def get_user_calendar_events(user_id, start_date, end_date, view_type):
    """Get user's calendar events (in-memory implementation with fallback to mock data)"""
    # Get events from in-memory storage
    user_events = []
    for event_id, event in CALENDAR_EVENTS_DB.items():
        if event["user_id"] == user_id:
            event_start = datetime.fromisoformat(event["start_date"].replace('Z', '+00:00'))
            if start_date <= event_start <= end_date:
                user_events.append(event)
    
    # If no events in memory, return mock data
    if not user_events:
        events = []
        current_date = start_date
        
        while current_date <= end_date:
            # Generate some mock events
            if current_date.weekday() < 5:  # Weekdays
                # Morning task
                events.append({
                    "id": f"event_{current_date.strftime('%Y%m%d')}_1",
                    "title": "Team Standup",
                    "description": "Daily team standup meeting",
                    "start_date": current_date.replace(hour=9, minute=0).isoformat(),
                    "end_date": current_date.replace(hour=9, minute=30).isoformat(),
                    "event_type": "meeting",
                    "all_day": False,
                    "location": "Conference Room A",
                    "priority": "medium",
                    "status": "scheduled",
                    "tags": ["meeting", "daily"]
                })
                
                # Afternoon task
                if current_date.weekday() == 2:  # Wednesday
                    events.append({
                        "id": f"event_{current_date.strftime('%Y%m%d')}_2",
                        "title": "Project Review",
                        "description": "Weekly project review meeting",
                        "start_date": current_date.replace(hour=14, minute=0).isoformat(),
                        "end_date": current_date.replace(hour=16, minute=0).isoformat(),
                        "event_type": "meeting",
                        "all_day": False,
                        "location": "Main Office",
                        "priority": "high",
                        "status": "scheduled",
                        "tags": ["meeting", "review"]
                    })
                
                # Deadline
                if current_date.day == 15:  # Mid-month deadline
                    events.append({
                        "id": f"event_{current_date.strftime('%Y%m%d')}_3",
                        "title": "Report Submission",
                        "description": "Monthly report due",
                        "start_date": current_date.replace(hour=17, minute=0).isoformat(),
                        "end_date": current_date.replace(hour=17, minute=0).isoformat(),
                        "event_type": "deadline",
                        "all_day": False,
                        "priority": "high",
                        "status": "pending",
                        "tags": ["deadline", "report"]
                    })
            
            current_date += timedelta(days=1)
        
        return events
    
    return user_events

def get_calendar_statistics(user_id, start_date, end_date):
    """Get calendar statistics"""
    events = get_user_calendar_events(user_id, start_date, end_date, "month")
    
    return {
        "total_events": len(events),
        "by_type": {
            event_type: len([e for e in events if e["event_type"] == event_type])
            for event_type in EVENT_TYPES.keys()
        },
        "by_priority": {
            priority: len([e for e in events if e["priority"] == priority])
            for priority in ["high", "medium", "low"]
        },
        "by_status": {
            status: len([e for e in events if e["status"] == status])
            for status in ["scheduled", "completed", "cancelled", "pending"]
        },
        "upcoming_events": len([e for e in events if datetime.fromisoformat(e["start_date"]) > datetime.utcnow()]),
        "past_events": len([e for e in events if datetime.fromisoformat(e["end_date"]) < datetime.utcnow()]),
        "today_events": len([e for e in events if datetime.fromisoformat(e["start_date"]).date() == datetime.utcnow().date()])
    }

def validate_event_dates(event):
    """Validate event date configuration"""
    try:
        # Handle different date formats from frontend
        start_date_str = event["start_date"]
        end_date_str = event["end_date"]
        
        print(f"Validating dates: start={start_date_str}, end={end_date_str}")
        
        # Parse datetime-local format (2026-04-08T09:00)
        if 'T' in start_date_str:
            start_dt = datetime.fromisoformat(start_date_str)
        else:
            start_dt = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
            
        if 'T' in end_date_str:
            end_dt = datetime.fromisoformat(end_date_str)
        else:
            end_dt = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
        
        print(f"Parsed dates: start={start_dt}, end={end_dt}")
        
        if end_dt <= start_dt:
            print("Validation failed: end date is before or equal to start date")
            return False
        
        # Check for reasonable duration (max 24 hours unless all_day)
        if not event.get("all_day", False):
            duration = end_dt - start_dt
            print(f"Duration: {duration}")
            if duration > timedelta(hours=24):
                print("Validation failed: duration exceeds 24 hours")
                return False
        
        print("Date validation passed")
        return True
    except Exception as e:
        print(f"Date validation error: {e}")
        return False

def save_calendar_event(event):
    """Save calendar event (in-memory implementation for testing)"""
    CALENDAR_EVENTS_DB[event["id"]] = event
    print(f"Calendar event saved: {event['title']} with ID: {event['id']}")
    print(f"Total events in DB: {len(CALENDAR_EVENTS_DB)}")

def get_calendar_event_by_id(event_id, user_id):
    """Get calendar event by ID (in-memory implementation)"""
    # Check in-memory database first
    if event_id in CALENDAR_EVENTS_DB:
        event = CALENDAR_EVENTS_DB[event_id]
        if event["user_id"] == user_id:
            return event
    
    # Fallback to mock data
    return {
        "id": event_id,
        "user_id": user_id,
        "title": "Sample Event",
        "start_date": datetime.utcnow().isoformat(),
        "end_date": (datetime.utcnow() + timedelta(hours=1)).isoformat(),
        "event_type": "task",
        "all_day": False
    }

def delete_calendar_event_by_id(event_id):
    """Delete calendar event by ID (in-memory implementation for testing)"""
    if event_id in CALENDAR_EVENTS_DB:
        event = CALENDAR_EVENTS_DB[event_id]
        del CALENDAR_EVENTS_DB[event_id]
        print(f"Calendar event deleted: {event['title']} with ID: {event_id}")
        print(f"Total events in DB: {len(CALENDAR_EVENTS_DB)}")
        return True
    return False

def link_event_to_task(event_id, task_id):
    """Link calendar event to task (mock implementation)"""
    # In real implementation, would create relationship in database
    pass

def unlink_event_from_task(event_id, task_id):
    """Unlink calendar event from task (mock implementation)"""
    # In real implementation, would remove relationship in database
    pass

def get_user_availability(user_id, start_date, end_date):
    """Get user's availability (mock implementation)"""
    # Mock availability data
    availability = []
    current_date = start_date
    
    while current_date <= end_date:
        if current_date.weekday() < 5:  # Weekdays
            availability.append({
                "date": current_date.date().isoformat(),
                "available_hours": [
                    {"start": "09:00", "end": "12:00"},
                    {"start": "13:00", "end": "17:00"}
                ]
            })
        else:  # Weekends
            availability.append({
                "date": current_date.date().isoformat(),
                "available_hours": [
                    {"start": "10:00", "end": "14:00"}
                ]
            })
        
        current_date += timedelta(days=1)
    
    return availability

def get_user_busy_slots(user_id, start_date, end_date):
    """Get user's busy time slots"""
    events = get_user_calendar_events(user_id, start_date, end_date, "month")
    
    busy_slots = []
    for event in events:
        if event["status"] != "cancelled":
            busy_slots.append({
                "start": event["start_date"],
                "end": event["end_date"],
                "title": event["title"],
                "event_type": event["event_type"]
            })
    
    return busy_slots

def generate_scheduling_suggestions(user_id, start_date, end_date):
    """Generate scheduling suggestions"""
    busy_slots = get_user_busy_slots(user_id, start_date, end_date)
    
    suggestions = [
        {
            "type": "best_time",
            "title": "Peak Productivity Time",
            "description": "Schedule important tasks between 9-11 AM for best focus",
            "confidence": 0.85
        },
        {
            "type": "meeting_optimal",
            "title": "Meeting Times",
            "description": "Tuesday-Thursday afternoons have fewer conflicts",
            "confidence": 0.78
        },
        {
            "type": "break_reminder",
            "title": "Break Schedule",
            "description": "Consider scheduling breaks between 12-1 PM",
            "confidence": 0.92
        }
    ]
    
    return suggestions

def get_tasks_for_sync(user_id, sync_type, date_range):
    """Get tasks for calendar sync"""
    # Mock implementation
    return [
        {
            "id": "task_1",
            "title": "Complete project proposal",
            "due_date": (datetime.utcnow() + timedelta(days=3)).isoformat(),
            "priority": "high",
            "estimated_duration": 120
        },
        {
            "id": "task_2",
            "title": "Review documentation",
            "due_date": (datetime.utcnow() + timedelta(days=7)).isoformat(),
            "priority": "medium",
            "estimated_duration": 60
        }
    ]

def task_has_calendar_event(task_id):
    """Check if task already has calendar event"""
    # Mock implementation
    return False

def create_event_from_task(task):
    """Create calendar event from task"""
    due_date = datetime.fromisoformat(task["due_date"].replace('Z', '+00:00'))
    
    return {
        "id": f"event_task_{task['id']}",
        "user_id": task.get("user_id"),
        "title": task["title"],
        "description": f"Task deadline: {task['title']}",
        "start_date": due_date.isoformat(),
        "end_date": due_date.isoformat(),
        "event_type": "deadline",
        "all_day": False,
        "priority": task["priority"],
        "status": "scheduled",
        "task_id": task["id"],
        "tags": ["task", "deadline"],
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }

def get_event_templates():
    """Get calendar event templates"""
    return [
        {
            "id": "template_1",
            "name": "Daily Standup",
            "description": "Daily team standup meeting",
            "category": "meeting",
            "duration": 30,
            "default_time": "09:00",
            "recurrence": "daily",
            "tags": ["meeting", "daily", "team"]
        },
        {
            "id": "template_2",
            "name": "Weekly Review",
            "description": "Weekly project review",
            "category": "meeting",
            "duration": 60,
            "default_time": "14:00",
            "recurrence": "weekly",
            "tags": ["meeting", "review", "weekly"]
        },
        {
            "id": "template_3",
            "name": "Focus Time",
            "description": "Deep work session",
            "category": "work",
            "duration": 90,
            "default_time": "10:00",
            "recurrence": None,
            "tags": ["work", "focus", "deep"]
        },
        {
            "id": "template_4",
            "name": "Lunch Break",
            "description": "Daily lunch break",
            "category": "personal",
            "duration": 60,
            "default_time": "12:00",
            "recurrence": "daily",
            "tags": ["personal", "break", "lunch"]
        }
    ]

def generate_ics_export(user_id, start_date, end_date):
    """Generate ICS calendar export"""
    events = get_user_calendar_events(user_id, start_date, end_date, "month")
    
    # Generate ICS format
    ics_lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//DTMS//Calendar//EN",
        "CALSCALE:GREGORIAN"
    ]
    
    for event in events:
        start_dt = datetime.fromisoformat(event["start_date"].replace('Z', '+00:00'))
        end_dt = datetime.fromisoformat(event["end_date"].replace('Z', '+00:00'))
        
        ics_lines.extend([
            "BEGIN:VEVENT",
            f"UID:{event['id']}@dtms.com",
            f"DTSTART:{start_dt.strftime('%Y%m%dT%H%M%SZ')}",
            f"DTEND:{end_dt.strftime('%Y%m%dT%H%M%SZ')}",
            f"SUMMARY:{event['title']}",
            f"DESCRIPTION:{event.get('description', '')}",
            "END:VEVENT"
        ])
    
    ics_lines.append("END:VCALENDAR")
    
    return "\r\n".join(ics_lines)
