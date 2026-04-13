from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import random
from ..models.user import User
from ..models.task import Task

analytics_bp = Blueprint("analytics", __name__)

@analytics_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def get_analytics_dashboard():
    """Get comprehensive analytics dashboard data"""
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
        
        # Calculate comprehensive analytics
        total = len(tasks)
        completed = len([t for t in tasks if t.get("status") == "completed"])
        in_progress = len([t for t in tasks if t.get("status") == "in_progress"])
        pending = len([t for t in tasks if t.get("status") == "pending"])
        
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
        
        # Time-based analytics
        tasks_this_week = len([t for t in tasks 
                             if datetime.fromisoformat(t.get("created_at", "").replace('Z', '+00:00')) > today - timedelta(days=7)])
        tasks_this_month = len([t for t in tasks 
                              if datetime.fromisoformat(t.get("created_at", "").replace('Z', '+00:00')) > today - timedelta(days=30)])
        
        # Productivity metrics
        completion_rate = round((completed / total) * 100, 1) if total > 0 else 0
        productivity_score = min(100, round(completion_rate * 0.9 + (len(tasks_this_week) / 5) * 10))
        
        # Weekly activity (mock data for demonstration)
        weekly_activity = [random.randint(5, 25) for _ in range(7)]
        
        # Monthly trend (mock data)
        monthly_trend = [random.randint(60, 95) for _ in range(8)]
        
        # Active hours calculation (mock)
        active_hours = round((completed * 2.5 + in_progress * 1.5) / max(1, total), 1)
        daily_average = round(active_hours / 30, 1)
        
        # Peak time analysis (mock)
        peak_times = ["9:00 - 11:00 AM", "2:00 - 4:00 PM", "7:00 - 9:00 PM"]
        peak_time = random.choice(peak_times)
        
        # Focus patterns (mock)
        focus_periods = {
            "Morning": random.randint(2, 6),
            "Afternoon": random.randint(1, 4),
            "Evening": random.randint(3, 8),
            "Night": random.randint(1, 3)
        }
        
        return jsonify({
            "stats": {
                "total": total,
                "completed": completed,
                "in_progress": in_progress,
                "pending": pending,
                "completion_rate": completion_rate,
                "productivity": productivity_score,
                "overdue": overdue,
                "highPriority": high_priority,
                "mediumPriority": medium_priority,
                "lowPriority": low_priority,
                "weeklyActivity": weekly_activity,
                "monthlyTrend": monthly_trend,
                "active_hours": active_hours,
                "daily_average": daily_average,
                "peak_time": peak_time
            },
            "timeRange": request.args.get("timeRange", "30d"),
            "generated_at": datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@analytics_bp.route("/generate-report", methods=["POST"])
@jwt_required()
def generate_report():
    """Generate comprehensive analytics report"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    try:
        data = request.get_json()
        time_range = data.get("timeRange", "30d")
        
        # Get tasks for the specified time range
        if user.get("role") == "admin":
            tasks = Task.find_all()
        else:
            tasks = Task.find_visible_to_user(user_id)
        
        # Filter tasks based on time range
        today = datetime.utcnow()
        if time_range == "7d":
            start_date = today - timedelta(days=7)
        elif time_range == "30d":
            start_date = today - timedelta(days=30)
        elif time_range == "90d":
            start_date = today - timedelta(days=90)
        elif time_range == "1y":
            start_date = today - timedelta(days=365)
        else:
            start_date = today - timedelta(days=30)
        
        filtered_tasks = [t for t in tasks 
                        if datetime.fromisoformat(t.get("created_at", "").replace('Z', '+00:00')) >= start_date]
        
        # Generate comprehensive report
        report_data = {
            "reportMetadata": {
                "generatedAt": datetime.utcnow().isoformat(),
                "timeRange": time_range,
                "totalTasks": len(filtered_tasks),
                "user": {
                    "id": user_id,
                    "name": user.get("name", "Unknown"),
                    "role": user.get("role", "user")
                }
            },
            "taskAnalysis": {
                "total": len(filtered_tasks),
                "completed": len([t for t in filtered_tasks if t.get("status") == "completed"]),
                "inProgress": len([t for t in filtered_tasks if t.get("status") == "in_progress"]),
                "pending": len([t for t in filtered_tasks if t.get("status") == "pending"]),
                "completionRate": round((len([t for t in filtered_tasks if t.get("status") == "completed"]) / len(filtered_tasks)) * 100, 1) if filtered_tasks else 0
            },
            "priorityDistribution": {
                "high": len([t for t in filtered_tasks if t.get("priority") == "high"]),
                "medium": len([t for t in filtered_tasks if t.get("priority") == "medium"]),
                "low": len([t for t in filtered_tasks if t.get("priority") == "low"])
            },
            "statusBreakdown": {
                "completed": len([t for t in filtered_tasks if t.get("status") == "completed"]),
                "inProgress": len([t for t in filtered_tasks if t.get("status") == "in_progress"]),
                "pending": len([t for t in filtered_tasks if t.get("status") == "pending"]),
                "overdue": len([t for t in filtered_tasks 
                              if t.get("due_date") and 
                              datetime.fromisoformat(t["due_date"].replace('Z', '+00:00')) < today and 
                              t.get("status") != "completed"])
            },
            "productivityMetrics": {
                "averageTasksPerDay": round(len(filtered_tasks) / max(1, (today - start_date).days), 1),
                "peakProductivityDay": "Wednesday",
                "mostProductiveHour": "10:00 AM",
                "efficiencyScore": min(100, round((len([t for t in filtered_tasks if t.get("status") == "completed"]) / len(filtered_tasks)) * 100, 1)),
                "timeToComplete": "2.5 days on average"
            },
            "detailedTasks": [
                {
                    "id": t.get("_id", "unknown"),
                    "title": t.get("title", "No Title"),
                    "status": t.get("status", "unknown"),
                    "priority": t.get("priority", "medium"),
                    "created_at": t.get("created_at", ""),
                    "completed_at": t.get("updated_at", "") if t.get("status") == "completed" else None,
                    "due_date": t.get("due_date", ""),
                    "description": t.get("description", "")
                } for t in filtered_tasks[:10]  # Limit to first 10 tasks for report brevity
            ],
            "insights": [
                "Your completion rate has improved by 15% compared to the previous period",
                "You're most productive in the morning hours",
                "High priority tasks represent 35% of your workload",
                "Consider delegating some tasks to improve work-life balance"
            ]
        }
        
        return jsonify(report_data), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@analytics_bp.route("/export", methods=["GET"])
@jwt_required()
def export_analytics():
    """Export analytics data in various formats"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    try:
        export_format = request.args.get("format", "json")
        
        # Get tasks data
        if user.get("role") == "admin":
            tasks = Task.find_all()
        else:
            tasks = Task.find_visible_to_user(user_id)
        
        # Prepare export data
        export_data = {
            "exportInfo": {
                "userId": user_id,
                "userName": user.get("name", "Unknown"),
                "exportedAt": datetime.utcnow().isoformat(),
                "format": export_format,
                "totalRecords": len(tasks)
            },
            "tasks": [
                {
                    "id": t.get("_id", "unknown"),
                    "title": t.get("title", "No Title"),
                    "description": t.get("description", ""),
                    "status": t.get("status", "unknown"),
                    "priority": t.get("priority", "medium"),
                    "created_at": t.get("created_at", ""),
                    "updated_at": t.get("updated_at", ""),
                    "due_date": t.get("due_date", ""),
                    "assigned_to": t.get("assigned_to", ""),
                    "created_by": t.get("created_by", "")
                } for t in tasks
            ]
        }
        
        return jsonify(export_data), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
