from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import random
from ..models.user import User
from ..models.task import Task

collaboration_bp = Blueprint("collaboration", __name__)

# Mock data for demonstration
collaboration_rooms = {}
user_activities = []
project_updates = []

@collaboration_bp.route("/rooms", methods=["GET"])
@jwt_required()
def get_collaboration_rooms():
    """Get available collaboration rooms"""
    user_id = get_jwt_identity()
    
    # Mock rooms data
    rooms = [
        {
            "id": "general",
            "name": "General Discussion",
            "description": "General team discussions and announcements",
            "members": 12,
            "active": True,
            "last_activity": "2 minutes ago"
        },
        {
            "id": "project-alpha",
            "name": "Project Alpha",
            "description": "Working on the new feature release",
            "members": 5,
            "active": True,
            "last_activity": "5 minutes ago"
        },
        {
            "id": "skill-sharing",
            "name": "Skill Sharing",
            "description": "Share learning resources and tips",
            "members": 8,
            "active": False,
            "last_activity": "1 hour ago"
        }
    ]
    
    return jsonify({
        "rooms": rooms,
        "total": len(rooms)
    }), 200

@collaboration_bp.route("/room/<room_id>/messages", methods=["GET"])
@jwt_required()
def get_room_messages(room_id):
    """Get messages from a collaboration room"""
    user_id = get_jwt_identity()
    
    # Mock messages data
    messages = [
        {
            "id": "1",
            "user": {
                "name": "Sarah Chen",
                "avatar": "SC",
                "role": "admin"
            },
            "content": "Great work on the task management feature everyone! 🎉",
            "timestamp": "2024-01-15T14:30:00Z",
            "type": "message"
        },
        {
            "id": "2",
            "user": {
                "name": "Mike Johnson",
                "avatar": "MJ",
                "role": "user"
            },
            "content": "Thanks! The AI assistant integration is really helpful",
            "timestamp": "2024-01-15T14:32:00Z",
            "type": "message"
        },
        {
            "id": "3",
            "user": {
                "name": "System",
                "avatar": "🤖",
                "role": "system"
            },
            "content": "New task assigned: Complete API documentation",
            "timestamp": "2024-01-15T14:35:00Z",
            "type": "system"
        }
    ]
    
    return jsonify({
        "messages": messages,
        "room_id": room_id
    }), 200

@collaboration_bp.route("/room/<room_id>/join", methods=["POST"])
@jwt_required()
def join_room(room_id):
    """Join a collaboration room"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Add user to room (mock implementation)
    return jsonify({
        "message": f"Joined room {room_id} successfully",
        "user": {
            "id": user_id,
            "name": user.get("name", "Unknown"),
            "avatar": user.get("name", "Unknown")[:2].upper()
        }
    }), 200

@collaboration_bp.route("/activities", methods=["GET"])
@jwt_required()
def get_user_activities():
    """Get user's recent activities"""
    user_id = get_jwt_identity()
    
    # Mock activities
    activities = [
        {
            "id": "1",
            "type": "task_completed",
            "title": "Completed task: Design new dashboard",
            "description": "Finished the dashboard redesign with new analytics",
            "timestamp": "2024-01-15T13:45:00Z",
            "points": 50
        },
        {
            "id": "2",
            "type": "skill_learned",
            "title": "Learned new skill: React Hooks",
            "description": "Completed advanced React patterns course",
            "timestamp": "2024-01-15T11:20:00Z",
            "points": 30
        },
        {
            "id": "3",
            "type": "achievement_unlocked",
            "title": "Achievement: Task Master",
            "description": "Completed 50 tasks total",
            "timestamp": "2024-01-15T09:15:00Z",
            "points": 100
        },
        {
            "id": "4",
            "type": "collaboration",
            "title": "Helped team member",
            "description": "Assisted with API integration issue",
            "timestamp": "2024-01-14T16:30:00Z",
            "points": 25
        }
    ]
    
    return jsonify({
        "activities": activities,
        "total": len(activities)
    }), 200

@collaboration_bp.route("/projects", methods=["GET"])
@jwt_required()
def get_team_projects():
    """Get team projects"""
    user_id = get_jwt_identity()
    
    # Mock projects data
    projects = [
        {
            "id": "proj-1",
            "name": "Mobile App Redesign",
            "description": "Complete overhaul of mobile application UI/UX",
            "status": "in_progress",
            "progress": 65,
            "team": [
                {"name": "Sarah Chen", "role": "Lead", "avatar": "SC"},
                {"name": "Mike Johnson", "role": "Developer", "avatar": "MJ"},
                {"name": "Emma Davis", "role": "Designer", "avatar": "ED"}
            ],
            "deadline": "2024-02-15",
            "priority": "high"
        },
        {
            "id": "proj-2",
            "name": "API Documentation",
            "description": "Create comprehensive API documentation",
            "status": "planning",
            "progress": 20,
            "team": [
                {"name": "Alex Kumar", "role": "Tech Writer", "avatar": "AK"},
                {"name": "Sarah Chen", "role": "Reviewer", "avatar": "SC"}
            ],
            "deadline": "2024-01-30",
            "priority": "medium"
        },
        {
            "id": "proj-3",
            "name": "Performance Optimization",
            "description": "Optimize database queries and response times",
            "status": "completed",
            "progress": 100,
            "team": [
                {"name": "David Lee", "role": "Backend Dev", "avatar": "DL"}
            ],
            "deadline": "2024-01-10",
            "priority": "high"
        }
    ]
    
    return jsonify({
        "projects": projects,
        "total": len(projects)
    }), 200

@collaboration_bp.route("/message", methods=["POST"])
@jwt_required()
def send_message():
    """Send a message to a collaboration room"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    room_id = data.get("room_id")
    message_content = data.get("message")
    
    if not room_id or not message_content:
        return jsonify({"error": "Room ID and message are required"}), 400
    
    # Mock message sending
    message = {
        "id": str(datetime.utcnow().timestamp()),
        "user": {
            "id": user_id,
            "name": user.get("name", "Unknown"),
            "avatar": user.get("name", "Unknown")[:2].upper()
        },
        "content": message_content,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "type": "message"
    }
    
    return jsonify({
        "message": "Message sent successfully",
        "data": message
    }), 200

@collaboration_bp.route("/status", methods=["GET"])
@jwt_required()
def get_collaboration_status():
    """Get collaboration status and online users"""
    user_id = get_jwt_identity()
    
    # Mock status data
    status = {
        "online_users": 8,
        "active_rooms": 3,
        "pending_messages": 2,
        "user_status": "online",
        "team_productivity": 87,
        "recent_collaboration_score": 92
    }
    
    return jsonify(status), 200
