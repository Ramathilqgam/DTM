from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import random
from ..models.user import User
from ..models.task import Task

team_tasks_bp = Blueprint("team_tasks", __name__)

# Team roles and permissions
TEAM_ROLES = {
    "owner": {
        "name": "Team Owner",
        "permissions": ["create_tasks", "edit_tasks", "delete_tasks", "manage_members", "view_analytics", "manage_settings"],
        "level": 5
    },
    "admin": {
        "name": "Team Admin",
        "permissions": ["create_tasks", "edit_tasks", "delete_tasks", "manage_members", "view_analytics"],
        "level": 4
    },
    "manager": {
        "name": "Team Manager",
        "permissions": ["create_tasks", "edit_tasks", "view_analytics", "assign_tasks"],
        "level": 3
    },
    "member": {
        "name": "Team Member",
        "permissions": ["create_tasks", "edit_own_tasks", "view_team_tasks"],
        "level": 2
    },
    "viewer": {
        "name": "Team Viewer",
        "permissions": ["view_team_tasks"],
        "level": 1
    }
}

# Task collaboration types
COLLABORATION_TYPES = {
    "individual": {
        "name": "Individual",
        "description": "Single person responsible",
        "icon": "person",
        "color": "#2196F3"
    },
    "collaborative": {
        "name": "Collaborative",
        "description": "Multiple people work together",
        "icon": "group",
        "color": "#4CAF50"
    },
    "review_required": {
        "name": "Review Required",
        "description": "Work needs review before completion",
        "icon": "fact_check",
        "color": "#FF9800"
    },
    "parallel": {
        "name": "Parallel",
        "description": "Multiple people work on different aspects",
        "icon": "call_split",
        "color": "#9C27B0"
    },
    "sequential": {
        "name": "Sequential",
        "description": "Work passes from person to person",
        "icon": "linear_scale",
        "color": "#F44336"
    }
}

@team_tasks_bp.route("/teams", methods=["GET"])
@jwt_required()
def get_teams():
    """Get user's teams"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    try:
        # Get user's teams (mock implementation)
        teams = get_user_teams(user_id)
        
        return jsonify({
            "teams": teams,
            "total_teams": len(teams),
            "owned_teams": len([team for team in teams if team["user_role"] == "owner"]),
            "member_teams": len([team for team in teams if team["user_role"] != "owner"])
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@team_tasks_bp.route("/teams", methods=["POST"])
@jwt_required()
def create_team():
    """Create a new team"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    required_fields = ["name", "description"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        team = {
            "id": f"team_{datetime.now().timestamp()}",
            "name": data["name"],
            "description": data["description"],
            "owner_id": user_id,
            "created_at": datetime.utcnow().isoformat(),
            "members": [
                {
                    "user_id": user_id,
                    "role": "owner",
                    "joined_at": datetime.utcnow().isoformat()
                }
            ],
            "settings": {
                "allow_member_invites": data.get("allow_member_invites", True),
                "require_approval": data.get("require_approval", False),
                "default_task_visibility": data.get("default_task_visibility", "team"),
                "enable_analytics": data.get("enable_analytics", True)
            },
            "stats": {
                "total_tasks": 0,
                "completed_tasks": 0,
                "active_members": 1,
                "created_at": datetime.utcnow().isoformat()
            }
        }
        
        # Save team (mock implementation)
        save_team(team)
        
        return jsonify({
            "success": True,
            "team": team,
            "message": "Team created successfully"
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@team_tasks_bp.route("/teams/<team_id>", methods=["GET"])
@jwt_required()
def get_team_details(team_id):
    """Get team details and tasks"""
    user_id = get_jwt_identity()
    
    try:
        # Verify user is team member
        team = get_team_by_id(team_id, user_id)
        
        if not team:
            return jsonify({"error": "Team not found or access denied"}), 404
        
        # Get team tasks
        team_tasks = get_team_tasks(team_id)
        
        # Get team members
        members = get_team_members(team_id)
        
        # Get team analytics
        analytics = get_team_analytics(team_id)
        
        return jsonify({
            "team": team,
            "tasks": team_tasks,
            "members": members,
            "analytics": analytics,
            "user_role": get_user_role_in_team(user_id, team_id)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@team_tasks_bp.route("/teams/<team_id>/tasks", methods=["POST"])
@jwt_required()
def create_team_task(team_id):
    """Create a team task"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        # Verify user has permission to create tasks
        if not has_permission(user_id, team_id, "create_tasks"):
            return jsonify({"error": "Permission denied"}), 403
        
        required_fields = ["title", "collaboration_type"]
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400
        
        task = {
            "id": f"team_task_{datetime.now().timestamp()}",
            "team_id": team_id,
            "title": data["title"],
            "description": data.get("description", ""),
            "collaboration_type": data["collaboration_type"],
            "assigned_to": data.get("assigned_to", []),
            "created_by": user_id,
            "priority": data.get("priority", "medium"),
            "status": "open",
            "category": data.get("category", "general"),
            "estimated_duration": data.get("estimated_duration"),
            "tags": data.get("tags", []),
            "dependencies": data.get("dependencies", []),
            "subtasks": data.get("subtasks", []),
            "comments": [],
            "attachments": [],
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "due_date": data.get("due_date"),
            "progress": 0,
            "collaborators": data.get("collaborators", [])
        }
        
        # Add creator as collaborator if not already included
        if user_id not in task["collaborators"]:
            task["collaborators"].append(user_id)
        
        # Validate collaboration type requirements
        if not validate_collaboration_requirements(task):
            return jsonify({"error": "Invalid collaboration configuration"}), 400
        
        # Save task
        save_team_task(task)
        
        # Update team stats
        update_team_stats(team_id)
        
        # Notify team members
        notify_team_members(team_id, {
            "type": "new_task",
            "task_id": task["id"],
            "title": task["title"],
            "created_by": user_id
        })
        
        return jsonify({
            "success": True,
            "task": task,
            "message": "Team task created successfully"
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@team_tasks_bp.route("/teams/<team_id>/tasks/<task_id>", methods=["PUT"])
@jwt_required()
def update_team_task(team_id, task_id):
    """Update a team task"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        # Get existing task
        task = get_team_task_by_id(task_id, team_id)
        
        if not task:
            return jsonify({"error": "Task not found"}), 404
        
        # Check permissions
        if not can_edit_task(user_id, team_id, task):
            return jsonify({"error": "Permission denied"}), 403
        
        # Update task fields
        updatable_fields = [
            "title", "description", "priority", "status", "category", 
            "estimated_duration", "tags", "due_date", "assigned_to", 
            "collaborators", "progress"
        ]
        
        for field in updatable_fields:
            if field in data:
                task[field] = data[field]
        
        task["updated_at"] = datetime.utcnow().isoformat()
        
        # Add status change comment
        if "status" in data and data["status"] != task.get("previous_status"):
            task["comments"].append({
                "id": f"comment_{datetime.now().timestamp()}",
                "user_id": user_id,
                "content": f"Status changed to {data['status']}",
                "type": "system",
                "created_at": datetime.utcnow().isoformat()
            })
        
        # Save updated task
        save_team_task(task)
        
        # Update team stats
        update_team_stats(team_id)
        
        return jsonify({
            "success": True,
            "task": task,
            "message": "Task updated successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@team_tasks_bp.route("/teams/<team_id>/tasks/<task_id>/comments", methods=["POST"])
@jwt_required()
def add_task_comment(team_id, task_id):
    """Add comment to team task"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        if not data.get("content"):
            return jsonify({"error": "Comment content required"}), 400
        
        # Get task
        task = get_team_task_by_id(task_id, team_id)
        
        if not task:
            return jsonify({"error": "Task not found"}), 404
        
        # Verify user is team member
        if not is_team_member(user_id, team_id):
            return jsonify({"error": "Access denied"}), 403
        
        comment = {
            "id": f"comment_{datetime.now().timestamp()}",
            "user_id": user_id,
            "content": data["content"],
            "type": "user",
            "mentions": data.get("mentions", []),
            "created_at": datetime.utcnow().isoformat()
        }
        
        task["comments"].append(comment)
        task["updated_at"] = datetime.utcnow().isoformat()
        
        # Save task
        save_team_task(task)
        
        # Notify mentioned users
        if comment["mentions"]:
            notify_mentioned_users(comment["mentions"], {
                "type": "mention",
                "task_id": task_id,
                "comment_id": comment["id"],
                "mentioned_by": user_id
            })
        
        return jsonify({
            "success": True,
            "comment": comment,
            "message": "Comment added successfully"
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@team_tasks_bp.route("/teams/<team_id>/members", methods=["POST"])
@jwt_required()
def invite_team_member(team_id):
    """Invite member to team"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        # Verify user has permission to manage members
        if not has_permission(user_id, team_id, "manage_members"):
            return jsonify({"error": "Permission denied"}), 403
        
        if not data.get("email") or not data.get("role"):
            return jsonify({"error": "Email and role required"}), 400
        
        # Check if user exists
        invited_user = User.find_by_email(data["email"])
        if not invited_user:
            return jsonify({"error": "User not found"}), 404
        
        # Check if already member
        if is_team_member(invited_user.id, team_id):
            return jsonify({"error": "User already team member"}), 400
        
        # Create invitation
        invitation = {
            "id": f"invite_{datetime.now().timestamp()}",
            "team_id": team_id,
            "invited_by": user_id,
            "invited_user_id": invited_user.id,
            "email": data["email"],
            "role": data["role"],
            "message": data.get("message", ""),
            "status": "pending",
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow() + timedelta(days=7)).isoformat()
        }
        
        # Save invitation
        save_invitation(invitation)
        
        # Send notification (mock implementation)
        send_invitation_notification(invitation)
        
        return jsonify({
            "success": True,
            "invitation": invitation,
            "message": "Invitation sent successfully"
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@team_tasks_bp.route("/teams/<team_id>/analytics", methods=["GET"])
@jwt_required()
def get_team_analytics_endpoint(team_id):
    """Get team analytics"""
    user_id = get_jwt_identity()
    
    try:
        # Verify user has permission to view analytics
        if not has_permission(user_id, team_id, "view_analytics"):
            return jsonify({"error": "Permission denied"}), 403
        
        analytics = get_team_analytics(team_id)
        
        return jsonify(analytics), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@team_tasks_bp.route("/teams/<team_id>/activity", methods=["GET"])
@jwt_required()
def get_team_activity(team_id):
    """Get recent team activity"""
    user_id = get_jwt_identity()
    
    try:
        # Verify user is team member
        if not is_team_member(user_id, team_id):
            return jsonify({"error": "Access denied"}), 403
        
        limit = request.args.get("limit", 20, type=int)
        activity = get_team_activity_log(team_id, limit)
        
        return jsonify({
            "activity": activity,
            "total_count": len(activity)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# In-memory storage for teams and tasks (for testing)
TEAMS_DB = {}
TEAM_TASKS_DB = {}

# Helper functions for team tasks
def get_user_teams(user_id):
    """Get user's teams (mock implementation with in-memory storage)"""
    user_teams = []
    
    # Get teams from in-memory storage
    for team_id, team in TEAMS_DB.items():
        # Check if user is a member of this team
        for member in team.get("members", []):
            if member["user_id"] == user_id:
                user_teams.append({
                    "id": team["id"],
                    "name": team["name"],
                    "description": team["description"],
                    "user_role": member["role"],
                    "member_count": len(team.get("members", [])),
                    "created_at": team["created_at"],
                    "last_activity": team.get("last_activity", team["created_at"]),
                    "stats": team.get("stats", {
                        "total_tasks": 0,
                        "completed_tasks": 0,
                        "active_tasks": 0
                    })
                })
                break
    
    # Add default mock teams if no teams exist
    if not user_teams:
        return [
            {
                "id": "team_1",
                "name": "Development Team",
                "description": "Main development team for the project",
                "user_role": "owner",
                "member_count": 5,
                "created_at": "2024-01-01T00:00:00Z",
                "last_activity": (datetime.now() - timedelta(hours=2)).isoformat(),
                "stats": {
                    "total_tasks": 12,
                    "completed_tasks": 8,
                    "active_tasks": 4
                }
            },
            {
                "id": "team_2",
                "name": "Marketing Team",
                "description": "Marketing and content creation team",
                "user_role": "member",
                "member_count": 3,
                "created_at": "2024-02-01T00:00:00Z",
                "last_activity": (datetime.now() - timedelta(days=1)).isoformat(),
                "stats": {
                    "total_tasks": 8,
                    "completed_tasks": 5,
                    "active_tasks": 3
                }
            }
        ]
    
    return user_teams

def get_team_by_id(team_id, user_id):
    """Get team by ID (in-memory implementation)"""
    # Check in-memory database first
    if team_id in TEAMS_DB:
        team = TEAMS_DB[team_id]
        # Verify user is a member
        for member in team.get("members", []):
            if member["user_id"] == user_id:
                return team
        return None
    
    # Fallback to mock data
    teams = get_user_teams(user_id)
    for team in teams:
        if team["id"] == team_id:
            return team
    return None

def get_team_tasks(team_id):
    """Get team's tasks (in-memory implementation with fallback to mock data)"""
    # Get tasks from in-memory storage
    team_tasks = []
    for task_id, task in TEAM_TASKS_DB.items():
        if task["team_id"] == team_id:
            team_tasks.append(task)
    
    # If no tasks in memory, return mock data
    if not team_tasks:
        return [
            {
                "id": "team_task_1",
                "team_id": team_id,
                "title": "Implement User Authentication",
                "description": "Add JWT-based authentication system",
                "collaboration_type": "collaborative",
                "assigned_to": ["user_1", "user_2"],
                "created_by": "user_1",
                "priority": "high",
                "status": "in_progress",
                "category": "development",
                "estimated_duration": 120,
                "tags": ["backend", "security"],
                "collaborators": ["user_1", "user_2", "user_3"],
                "progress": 65,
                "created_at": (datetime.now() - timedelta(days=3)).isoformat(),
                "updated_at": (datetime.now() - timedelta(hours=6)).isoformat(),
                "due_date": (datetime.now() + timedelta(days=2)).isoformat(),
                "comments": [
                    {
                        "id": "comment_1",
                        "user_id": "user_2",
                        "content": "Started working on the JWT implementation",
                        "type": "user",
                        "created_at": (datetime.now() - timedelta(days=2)).isoformat()
                    }
                ]
            },
            {
                "id": "team_task_2",
                "team_id": team_id,
                "title": "Design Dashboard UI",
                "description": "Create responsive dashboard design",
                "collaboration_type": "individual",
                "assigned_to": ["user_3"],
                "created_by": "user_1",
                "priority": "medium",
                "status": "open",
                "category": "design",
                "estimated_duration": 60,
                "tags": ["frontend", "ui"],
                "collaborators": ["user_3"],
                "progress": 0,
                "created_at": (datetime.now() - timedelta(days=1)).isoformat(),
                "updated_at": (datetime.now() - timedelta(days=1)).isoformat(),
                "due_date": (datetime.now() + timedelta(days=5)).isoformat(),
                "comments": []
            }
        ]
    
    return team_tasks

def get_team_members(team_id):
    """Get team members (mock implementation)"""
    # Mock team members data
    return [
        {
            "user_id": "user_1",
            "name": "John Doe",
            "email": "john@example.com",
            "role": "owner",
            "joined_at": "2024-01-01T00:00:00Z",
            "last_active": (datetime.now() - timedelta(hours=2)).isoformat(),
            "avatar": "https://example.com/avatars/john.jpg"
        },
        {
            "user_id": "user_2",
            "name": "Jane Smith",
            "email": "jane@example.com",
            "role": "member",
            "joined_at": "2024-01-02T00:00:00Z",
            "last_active": (datetime.now() - timedelta(hours=4)).isoformat(),
            "avatar": "https://example.com/avatars/jane.jpg"
        },
        {
            "user_id": "user_3",
            "name": "Bob Johnson",
            "email": "bob@example.com",
            "role": "member",
            "joined_at": "2024-01-03T00:00:00Z",
            "last_active": (datetime.now() - timedelta(days=1)).isoformat(),
            "avatar": "https://example.com/avatars/bob.jpg"
        }
    ]

def get_team_analytics(team_id):
    """Get team analytics (mock implementation)"""
    # Mock analytics data
    return {
        "overview": {
            "total_tasks": 15,
            "completed_tasks": 10,
            "in_progress_tasks": 3,
            "pending_tasks": 2,
            "completion_rate": 66.7,
            "average_completion_time": 4.2,  # days
            "tasks_created_this_week": 5,
            "tasks_completed_this_week": 3
        },
        "member_performance": [
            {
                "user_id": "user_1",
                "name": "John Doe",
                "tasks_assigned": 8,
                "tasks_completed": 6,
                "completion_rate": 75.0,
                "average_time": 3.5,
                "contribution_score": 85
            },
            {
                "user_id": "user_2",
                "name": "Jane Smith",
                "tasks_assigned": 5,
                "tasks_completed": 3,
                "completion_rate": 60.0,
                "average_time": 5.2,
                "contribution_score": 72
            }
        ],
        "collaboration_metrics": {
            "collaborative_tasks": 8,
            "individual_tasks": 7,
            "average_collaborators_per_task": 2.3,
            "most_active_collaborator": "user_1",
            "collaboration_efficiency": 78.5
        },
        "category_breakdown": {
            "development": 6,
            "design": 3,
            "testing": 2,
            "documentation": 4
        },
        "time_tracking": {
            "total_estimated_hours": 180,
            "total_actual_hours": 165,
            "efficiency_rate": 91.7,
            "average_task_duration": 11.0  # hours
        }
    }

def get_user_role_in_team(user_id, team_id):
    """Get user's role in team"""
    # Mock implementation
    return "owner"

def has_permission(user_id, team_id, permission):
    """Check if user has specific permission in team"""
    user_role = get_user_role_in_team(user_id, team_id)
    role_permissions = TEAM_ROLES.get(user_role, {}).get("permissions", [])
    return permission in role_permissions

def can_edit_task(user_id, team_id, task):
    """Check if user can edit task"""
    user_role = get_user_role_in_team(user_id, team_id)
    
    # Can edit if owner, admin, manager, or task creator
    if user_role in ["owner", "admin", "manager"]:
        return True
    
    # Can edit if created the task
    if task["created_by"] == user_id:
        return True
    
    # Can edit if assigned to task (for members)
    if user_role == "member" and user_id in task.get("assigned_to", []):
        return True
    
    return False

def validate_collaboration_requirements(task):
    """Validate collaboration type requirements"""
    collab_type = task["collaboration_type"]
    
    if collab_type == "individual":
        # Individual tasks can have 0 or 1 assigned person (creator can work on it)
        return len(task.get("assigned_to", [])) <= 1
    
    elif collab_type == "collaborative":
        # Collaborative tasks need at least the creator as collaborator
        collaborators = task.get("collaborators", [])
        return len(collaborators) >= 1
    
    elif collab_type == "parallel":
        # Parallel tasks need at least the creator as assigned person
        assigned_to = task.get("assigned_to", [])
        return len(assigned_to) >= 1
    
    elif collab_type == "sequential":
        # Sequential tasks need at least the creator as assigned person
        assigned_to = task.get("assigned_to", [])
        return len(assigned_to) >= 1
    
    return True

def save_team(team):
    """Save team (in-memory implementation for testing)"""
    TEAMS_DB[team["id"]] = team
    print(f"Team saved: {team['name']} with ID: {team['id']}")
    print(f"Total teams in DB: {len(TEAMS_DB)}")

def save_team_task(task):
    """Save team task (in-memory implementation for testing)"""
    TEAM_TASKS_DB[task["id"]] = task
    print(f"Team task saved: {task['title']} with ID: {task['id']}")
    print(f"Total tasks in DB: {len(TEAM_TASKS_DB)}")

def get_team_task_by_id(task_id, team_id):
    """Get team task by ID (in-memory implementation)"""
    # Check in-memory database first
    if task_id in TEAM_TASKS_DB:
        task = TEAM_TASKS_DB[task_id]
        if task["team_id"] == team_id:
            return task
    
    # Fallback to mock data
    tasks = get_team_tasks(team_id)
    for task in tasks:
        if task["id"] == task_id:
            return task
    return None

def update_team_stats(team_id):
    """Update team statistics (mock implementation)"""
    # In real implementation, would update database
    pass

def notify_team_members(team_id, notification):
    """Notify team members (mock implementation)"""
    # In real implementation, would send notifications
    pass

def is_team_member(user_id, team_id):
    """Check if user is team member (mock implementation)"""
    # Mock implementation
    return True

def save_invitation(invitation):
    """Save invitation (mock implementation)"""
    # In real implementation, would save to database
    pass

def send_invitation_notification(invitation):
    """Send invitation notification (mock implementation)"""
    # In real implementation, would send email/notification
    pass

def notify_mentioned_users(user_ids, notification):
    """Notify mentioned users (mock implementation)"""
    # In real implementation, would send notifications
    pass

def get_team_activity_log(team_id, limit):
    """Get team activity log (mock implementation)"""
    # Mock activity data
    return [
        {
            "id": "activity_1",
            "type": "task_created",
            "user_id": "user_1",
            "user_name": "John Doe",
            "description": "Created task 'Implement User Authentication'",
            "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(),
            "task_id": "team_task_1"
        },
        {
            "id": "activity_2",
            "type": "comment_added",
            "user_id": "user_2",
            "user_name": "Jane Smith",
            "description": "Commented on 'Implement User Authentication'",
            "timestamp": (datetime.now() - timedelta(hours=4)).isoformat(),
            "task_id": "team_task_1"
        },
        {
            "id": "activity_3",
            "type": "task_updated",
            "user_id": "user_1",
            "user_name": "John Doe",
            "description": "Updated status of 'Design Dashboard UI'",
            "timestamp": (datetime.now() - timedelta(days=1)).isoformat(),
            "task_id": "team_task_2"
        }
    ][:limit]
