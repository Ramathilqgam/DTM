from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from ..models.task import Task
from ..models.user import User

analytics_bp = Blueprint("analytics", __name__)

@analytics_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def get_dashboard_analytics():
    """Get comprehensive dashboard analytics"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    try:
        # Get all tasks based on user role
        if user.get("role") == "admin":
            tasks = Task.find_all()
        else:
            tasks = Task.find_visible_to_user(user_id)
        
        # Basic stats
        total = len(tasks)
        completed = len([t for t in tasks if t.get("status") == "completed"])
        pending = len([t for t in tasks if t.get("status") == "pending"])
        in_progress = len([t for t in tasks if t.get("status") == "in_progress"])
        
        # Priority distribution
        high_priority = len([t for t in tasks if t.get("priority") == "high"])
        medium_priority = len([t for t in tasks if t.get("priority") == "medium"])
        low_priority = len([t for t in tasks if t.get("priority") == "low"])
        
        # Overdue tasks
        today = datetime.utcnow()
        overdue = len([t for t in tasks 
                      if t.get("due_date") and 
                      datetime.fromisoformat(t["due_date"].replace('Z', '+00:00')) < today and 
                      t.get("status") != "completed"])
        
        # Weekly activity (mock data for now - in production, this would be calculated from actual timestamps)
        weekly_activity = [12, 19, 8, 15, 22, 18, 25]
        
        # Monthly trend (mock data)
        monthly_trend = [65, 72, 68, 81, 79, 85, 88, 92]
        
        # Productivity score
        productivity = round((completed / total) * 100, 1) if total > 0 else 0
        
        # Recent activity
        recent_tasks = sorted(tasks, key=lambda x: x.get("created_at", datetime.min), reverse=True)[:5]
        
        return jsonify({
            "stats": {
                "total": total,
                "completed": completed,
                "pending": pending,
                "in_progress": in_progress,
                "completion_rate": round((completed / total) * 100, 1) if total > 0 else 0,
                "productivity": productivity,
                "overdue": overdue
            },
            "priority_distribution": {
                "high": high_priority,
                "medium": medium_priority,
                "low": low_priority
            },
            "charts": {
                "weekly_activity": weekly_activity,
                "monthly_trend": monthly_trend
            },
            "recent_tasks": [Task.to_dict(task) for task in recent_tasks]
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@analytics_bp.route("/productivity", methods=["GET"])
@jwt_required()
def get_productivity_metrics():
    """Get detailed productivity metrics"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    try:
        # Get tasks for the user
        if user.get("role") == "admin":
            tasks = Task.find_all()
        else:
            tasks = Task.find_visible_to_user(user_id)
        
        # Calculate metrics for different time periods
        today = datetime.utcnow()
        last_week = today - timedelta(days=7)
        last_month = today - timedelta(days=30)
        
        # Filter tasks by time period
        all_tasks = tasks
        recent_tasks = [t for t in tasks if datetime.fromisoformat(t.get("created_at", today.isoformat()).replace('Z', '+00:00')) > last_week]
        monthly_tasks = [t for t in tasks if datetime.fromisoformat(t.get("created_at", today.isoformat()).replace('Z', '+00:00')) > last_month]
        
        # Calculate completion rates
        def completion_rate(task_list):
            if not task_list:
                return 0
            completed = len([t for t in task_list if t.get("status") == "completed"])
            return round((completed / len(task_list)) * 100, 1)
        
        return jsonify({
            "time_periods": {
                "all_time": {
                    "total": len(all_tasks),
                    "completed": len([t for t in all_tasks if t.get("status") == "completed"]),
                    "completion_rate": completion_rate(all_tasks)
                },
                "last_week": {
                    "total": len(recent_tasks),
                    "completed": len([t for t in recent_tasks if t.get("status") == "completed"]),
                    "completion_rate": completion_rate(recent_tasks)
                },
                "last_month": {
                    "total": len(monthly_tasks),
                    "completed": len([t for t in monthly_tasks if t.get("status") == "completed"]),
                    "completion_rate": completion_rate(monthly_tasks)
                }
            },
            "efficiency_score": min(100, completion_rate(all_tasks) + (len(recent_tasks) * 2)),  # Mock efficiency score
            "trend": "increasing"  # Mock trend
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@analytics_bp.route("/notifications", methods=["GET"])
@jwt_required()
def get_notifications():
    """Get smart notifications for the user"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    try:
        # Get tasks for the user
        if user.get("role") == "admin":
            tasks = Task.find_all()
        else:
            tasks = Task.find_visible_to_user(user_id)
        
        notifications = []
        
        # Overdue tasks notification
        today = datetime.utcnow()
        overdue_tasks = [t for t in tasks 
                        if t.get("due_date") and 
                        datetime.fromisoformat(t["due_date"].replace('Z', '+00:00')) < today and 
                        t.get("status") != "completed"]
        
        if overdue_tasks:
            notifications.append({
                "type": "warning",
                "message": f"You have {len(overdue_tasks)} overdue task(s) that need immediate attention",
                "time": "Urgent",
                "count": len(overdue_tasks)
            })
        
        # High priority tasks
        high_priority_tasks = [t for t in tasks if t.get("priority") == "high" and t.get("status") != "completed"]
        if high_priority_tasks:
            notifications.append({
                "type": "info",
                "message": f"You have {len(high_priority_tasks)} high priority task(s) requiring focus",
                "time": "Today",
                "count": len(high_priority_tasks)
            })
        
        # Pending tasks
        pending_tasks = [t for t in tasks if t.get("status") == "pending"]
        if pending_tasks:
            notifications.append({
                "type": "task",
                "message": f"You have {len(pending_tasks)} pending task(s) to review",
                "time": "Just now",
                "count": len(pending_tasks)
            })
        
        # Recent completions
        completed_today = len([t for t in tasks if t.get("status") == "completed"])
        if completed_today > 0:
            notifications.append({
                "type": "complete",
                "message": f"Excellent! You've completed {completed_today} task(s) recently",
                "time": "This week",
                "count": completed_today
            })
        
        return jsonify({"notifications": notifications}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
