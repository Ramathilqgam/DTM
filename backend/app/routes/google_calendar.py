from flask import Blueprint, request, jsonify, redirect, url_for
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import google.oauth2.credentials
import google_auth_oauthlib.flow
import googleapiclient.discovery
import googleapiclient.errors
from ..models.user import User
from ..models.task import Task

google_calendar_bp = Blueprint("google_calendar", __name__)

# Google Calendar API configuration
GOOGLE_CLIENT_CONFIG = {
    "web": {
        "client_id": "your-google-client-id",
        "project_id": "your-project-id",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_secret": "your-google-client-secret",
        "redirect_uris": ["http://localhost:3000/auth/google/callback"]
    }
}

SCOPES = ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events']
API_SERVICE_NAME = 'calendar'
API_VERSION = 'v3'

# Store user credentials (in production, use database)
USER_CREDENTIALS = {}

def create_credentials_flow():
    """Create OAuth flow for Google Calendar"""
    flow = google_auth_oauthlib.flow.Flow.from_client_config(
        GOOGLE_CLIENT_CONFIG,
        scopes=SCOPES
    )
    flow.redirect_uri = url_for('google_calendar.oauth2callback', _external=True)
    return flow

@google_calendar_bp.route("/google-calendar/auth", methods=["GET"])
@jwt_required()
def authorize_google_calendar():
    """Initiate Google Calendar authorization"""
    user_id = get_jwt_identity()
    
    try:
        flow = create_credentials_flow()
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )
        
        # Store state in session (in production, use proper session management)
        return jsonify({
            "authorization_url": authorization_url,
            "state": state
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@google_calendar_bp.route("/google-calendar/callback", methods=["GET"])
def oauth2callback():
    """Handle OAuth2 callback from Google"""
    try:
        flow = create_credentials_flow()
        flow.fetch_token(authorization_response=request.url)
        
        credentials = flow.credentials
        user_id = request.args.get('state')  # In production, validate state
        
        # Store credentials
        USER_CREDENTIALS[user_id] = credentials
        
        return jsonify({
            "success": True,
            "message": "Google Calendar connected successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@google_calendar_bp.route("/google-calendar/status", methods=["GET"])
@jwt_required()
def get_calendar_status():
    """Get Google Calendar connection status"""
    user_id = get_jwt_identity()
    
    try:
        credentials = USER_CREDENTIALS.get(user_id)
        
        if not credentials or not credentials.valid:
            return jsonify({
                "connected": False,
                "message": "Not connected to Google Calendar"
            }), 200
        
        # Test connection by getting calendar list
        service = build_calendar_service(credentials)
        calendar_list = service.calendarList().list().execute()
        
        return jsonify({
            "connected": True,
            "calendars": calendar_list.get('items', []),
            "primary_calendar": calendar_list.get('items', [{}])[0].get('id'),
            "last_sync": datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@google_calendar_bp.route("/google-calendar/sync", methods=["POST"])
@jwt_required()
def sync_calendar():
    """Sync tasks with Google Calendar"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    sync_type = data.get('sync_type', 'bidirectional')  # 'to_calendar', 'from_calendar', 'bidirectional'
    date_range = data.get('date_range', {})  # {'start_date': '2024-01-01', 'end_date': '2024-12-31'}
    
    try:
        credentials = USER_CREDENTIALS.get(user_id)
        if not credentials or not credentials.valid:
            return jsonify({"error": "Not connected to Google Calendar"}), 400
        
        service = build_calendar_service(credentials)
        
        # Get user tasks
        tasks = Task.get_user_tasks(user_id)
        
        sync_results = {
            "tasks_synced": 0,
            "events_created": 0,
            "events_updated": 0,
            "conflicts": 0,
            "errors": []
        }
        
        if sync_type in ['to_calendar', 'bidirectional']:
            # Sync tasks to calendar
            for task in tasks:
                if task.due_date:
                    result = sync_task_to_calendar(service, task, sync_results)
                    if result['success']:
                        sync_results['events_created'] += 1
                    else:
                        sync_results['errors'].append(result['error'])
        
        if sync_type in ['from_calendar', 'bidirectional']:
            # Sync calendar events to tasks
            result = sync_calendar_to_tasks(service, user_id, date_range, sync_results)
            sync_results['tasks_synced'] = result['tasks_synced']
            sync_results['conflicts'] = result['conflicts']
        
        return jsonify({
            "success": True,
            "sync_results": sync_results,
            "timestamp": datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@google_calendar_bp.route("/google-calendar/events", methods=["GET"])
@jwt_required()
def get_calendar_events():
    """Get events from Google Calendar"""
    user_id = get_jwt_identity()
    
    # Parse query parameters
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    calendar_id = request.args.get('calendar_id', 'primary')
    
    try:
        credentials = USER_CREDENTIALS.get(user_id)
        if not credentials or not credentials.valid:
            return jsonify({"error": "Not connected to Google Calendar"}), 400
        
        service = build_calendar_service(credentials)
        
        # Set time range
        time_min = None
        time_max = None
        if start_date:
            time_min = datetime.fromisoformat(start_date).isoformat() + 'Z'
        if end_date:
            time_max = datetime.fromisoformat(end_date).isoformat() + 'Z'
        
        # Get events
        events_result = service.events().list(
            calendarId=calendar_id,
            timeMin=time_min,
            timeMax=time_max,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        events = events_result.get('items', [])
        
        return jsonify({
            "events": events,
            "total": len(events),
            "calendar_id": calendar_id
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@google_calendar_bp.route("/google-calendar/events", methods=["POST"])
@jwt_required()
def create_calendar_event():
    """Create an event in Google Calendar"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        credentials = USER_CREDENTIALS.get(user_id)
        if not credentials or not credentials.valid:
            return jsonify({"error": "Not connected to Google Calendar"}), 400
        
        service = build_calendar_service(credentials)
        
        # Create event
        event = {
            'summary': data.get('summary'),
            'description': data.get('description', ''),
            'start': {
                'dateTime': data.get('start_datetime'),
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': data.get('end_datetime'),
                'timeZone': 'UTC',
            },
            'reminders': {
                'useDefault': False,
                'overrides': data.get('reminders', [
                    {'method': 'email', 'minutes': 24 * 60},
                    {'method': 'popup', 'minutes': 10},
                ]),
            },
        }
        
        if data.get('attendees'):
            event['attendees'] = data['attendees']
        
        created_event = service.events().insert(
            calendarId='primary',
            body=event
        ).execute()
        
        return jsonify({
            "success": True,
            "event": created_event,
            "message": "Event created successfully"
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@google_calendar_bp.route("/google-calendar/events/<event_id>", methods=["PUT"])
@jwt_required()
def update_calendar_event(event_id):
    """Update an event in Google Calendar"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        credentials = USER_CREDENTIALS.get(user_id)
        if not credentials or not credentials.valid:
            return jsonify({"error": "Not connected to Google Calendar"}), 400
        
        service = build_calendar_service(credentials)
        
        # Get existing event
        existing_event = service.events().get(
            calendarId='primary',
            eventId=event_id
        ).execute()
        
        # Update event
        event = {
            'summary': data.get('summary', existing_event.get('summary')),
            'description': data.get('description', existing_event.get('description')),
            'start': data.get('start', existing_event.get('start')),
            'end': data.get('end', existing_event.get('end')),
        }
        
        updated_event = service.events().update(
            calendarId='primary',
            eventId=event_id,
            body=event
        ).execute()
        
        return jsonify({
            "success": True,
            "event": updated_event,
            "message": "Event updated successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@google_calendar_bp.route("/google-calendar/events/<event_id>", methods=["DELETE"])
@jwt_required()
def delete_calendar_event(event_id):
    """Delete an event from Google Calendar"""
    user_id = get_jwt_identity()
    
    try:
        credentials = USER_CREDENTIALS.get(user_id)
        if not credentials or not credentials.valid:
            return jsonify({"error": "Not connected to Google Calendar"}), 400
        
        service = build_calendar_service(credentials)
        
        service.events().delete(
            calendarId='primary',
            eventId=event_id
        ).execute()
        
        return jsonify({
            "success": True,
            "message": "Event deleted successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@google_calendar_bp.route("/google-calendar/disconnect", methods=["POST"])
@jwt_required()
def disconnect_calendar():
    """Disconnect Google Calendar"""
    user_id = get_jwt_identity()
    
    try:
        if user_id in USER_CREDENTIALS:
            del USER_CREDENTIALS[user_id]
        
        return jsonify({
            "success": True,
            "message": "Google Calendar disconnected successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@google_calendar_bp.route("/google-calendar/sync-settings", methods=["GET"])
@jwt_required()
def get_sync_settings():
    """Get sync settings for Google Calendar"""
    user_id = get_jwt_identity()
    
    try:
        # Mock sync settings (in production, get from database)
        settings = {
            "auto_sync": True,
            "sync_frequency": "hourly",  # 'realtime', 'hourly', 'daily'
            "sync_direction": "bidirectional",  # 'to_calendar', 'from_calendar', 'bidirectional'
            "default_calendar": "primary",
            "create_events": True,
            "update_events": True,
            "delete_events": False,
            "sync_completed_tasks": False,
            "event_prefix": "DTMS: ",
            "reminder_minutes": [24 * 60, 60, 10],  # 24 hours, 1 hour, 10 minutes
            "last_sync": datetime.utcnow().isoformat()
        }
        
        return jsonify(settings), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@google_calendar_bp.route("/google-calendar/sync-settings", methods=["PUT"])
@jwt_required()
def update_sync_settings():
    """Update sync settings for Google Calendar"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        # Update settings (in production, save to database)
        settings = {
            "auto_sync": data.get('auto_sync', True),
            "sync_frequency": data.get('sync_frequency', 'hourly'),
            "sync_direction": data.get('sync_direction', 'bidirectional'),
            "default_calendar": data.get('default_calendar', 'primary'),
            "create_events": data.get('create_events', True),
            "update_events": data.get('update_events', True),
            "delete_events": data.get('delete_events', False),
            "sync_completed_tasks": data.get('sync_completed_tasks', False),
            "event_prefix": data.get('event_prefix', 'DTMS: '),
            "reminder_minutes": data.get('reminder_minutes', [24 * 60, 60, 10]),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        return jsonify({
            "success": True,
            "settings": settings,
            "message": "Sync settings updated successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Helper functions
def build_calendar_service(credentials):
    """Build Google Calendar service"""
    return googleapiclient.discovery.build(
        API_SERVICE_NAME, API_VERSION, credentials=credentials
    )

def sync_task_to_calendar(service, task, sync_results):
    """Sync a single task to Google Calendar"""
    try:
        # Check if event already exists
        events = service.events().list(
            calendarId='primary',
            q=f"DTMS: {task.id}"
        ).execute()
        
        existing_events = events.get('items', [])
        
        event_data = {
            'summary': f"DTMS: {task.title}",
            'description': f"Task ID: {task.id}\n\n{task.description or ''}",
            'start': {
                'dateTime': task.due_date.replace('Z', '+00:00'),
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': (datetime.fromisoformat(task.due_date.replace('Z', '+00:00')) + timedelta(hours=1)).isoformat(),
                'timeZone': 'UTC',
            },
            'extendedProperties': {
                'private': {
                    'task_id': task.id,
                    'task_status': task.status,
                    'task_priority': task.priority
                }
            }
        }
        
        if existing_events:
            # Update existing event
            event = service.events().update(
                calendarId='primary',
                eventId=existing_events[0]['id'],
                body=event_data
            ).execute()
            sync_results['events_updated'] += 1
        else:
            # Create new event
            event = service.events().insert(
                calendarId='primary',
                body=event_data
            ).execute()
        
        return {"success": True, "event": event}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

def sync_calendar_to_tasks(service, user_id, date_range, sync_results):
    """Sync calendar events to tasks"""
    try:
        # Get events
        time_min = date_range.get('start_date', datetime.utcnow().isoformat())
        time_max = date_range.get('end_date', (datetime.utcnow() + timedelta(days=30)).isoformat())
        
        events_result = service.events().list(
            calendarId='primary',
            timeMin=time_min,
            timeMax=time_max,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        events = events_result.get('items', [])
        tasks_synced = 0
        conflicts = 0
        
        for event in events:
            # Check if event is from DTMS
            summary = event.get('summary', '')
            if not summary.startswith('DTMS: '):
                continue
            
            # Extract task info
            task_id = event.get('extendedProperties', {}).get('private', {}).get('task_id')
            
            if task_id:
                # Update existing task
                task = Task.find_by_id(task_id)
                if task and task.user_id == user_id:
                    # Update task based on event
                    task.due_date = event['start']['dateTime']
                    task.save()
                    tasks_synced += 1
                else:
                    conflicts += 1
            else:
                # Create new task from event
                task_data = {
                    'user_id': user_id,
                    'title': summary.replace('DTMS: ', ''),
                    'description': event.get('description', ''),
                    'due_date': event['start']['dateTime'],
                    'status': 'pending',
                    'priority': 'medium'
                }
                
                new_task = Task.create(task_data)
                tasks_synced += 1
        
        return {
            "tasks_synced": tasks_synced,
            "conflicts": conflicts
        }
        
    except Exception as e:
        return {"tasks_synced": 0, "conflicts": 0, "error": str(e)}
