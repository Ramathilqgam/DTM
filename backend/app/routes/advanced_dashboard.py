from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import calendar
from collections import defaultdict
from ..models.user import User
from ..models.task import Task

advanced_dashboard_bp = Blueprint("advanced_dashboard", __name__)

# Dashboard widget types
DASHBOARD_WIDGETS = {
    "task_completion": {
        "name": "Task Completion",
        "description": "Track task completion over time",
        "type": "line_chart",
        "icon": "trending_up",
        "color": "#4CAF50"
    },
    "productivity_score": {
        "name": "Productivity Score",
        "description": "Overall productivity metrics",
        "type": "gauge",
        "icon": "speed",
        "color": "#2196F3"
    },
    "category_distribution": {
        "name": "Task Categories",
        "description": "Distribution of tasks by category",
        "type": "pie_chart",
        "icon": "pie_chart",
        "color": "#FF9800"
    },
    "time_tracking": {
        "name": "Time Tracking",
        "description": "Time spent on different activities",
        "type": "bar_chart",
        "icon": "schedule",
        "color": "#9C27B0"
    },
    "priority_matrix": {
        "name": "Priority Analysis",
        "description": "Task priority distribution",
        "type": "donut_chart",
        "icon": "priority_high",
        "color": "#F44336"
    },
    "weekly_progress": {
        "name": "Weekly Progress",
        "description": "Daily task completion this week",
        "type": "area_chart",
        "icon": "date_range",
        "color": "#00BCD4"
    }
}

@advanced_dashboard_bp.route("/dashboard/overview", methods=["GET"])
@jwt_required()
def get_dashboard_overview():
    """Get comprehensive dashboard overview"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    try:
        # Get time range from query params
        days = request.args.get("days", 30, type=int)
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Generate comprehensive dashboard data
        overview = {
            "summary": get_user_summary(user_id),
            "metrics": get_productivity_metrics(user_id, start_date, end_date),
            "charts": get_chart_data(user_id, start_date, end_date),
            "widgets": get_widget_data(user_id, start_date, end_date),
            "insights": generate_dashboard_insights(user_id, start_date, end_date),
            "goals": get_goal_progress(user_id),
            "time_range": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days": days
            }
        }
        
        return jsonify(overview), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@advanced_dashboard_bp.route("/dashboard/metrics", methods=["GET"])
@jwt_required()
def get_detailed_metrics():
    """Get detailed performance metrics"""
    user_id = get_jwt_identity()
    
    try:
        # Get time range
        days = request.args.get("days", 30, type=int)
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        metrics = {
            "task_metrics": get_task_metrics(user_id, start_date, end_date),
            "time_metrics": get_time_metrics(user_id, start_date, end_date),
            "productivity_metrics": get_productivity_metrics(user_id, start_date, end_date),
            "quality_metrics": get_quality_metrics(user_id, start_date, end_date),
            "efficiency_metrics": get_efficiency_metrics(user_id, start_date, end_date),
            "comparison_metrics": get_comparison_metrics(user_id, start_date, end_date)
        }
        
        return jsonify(metrics), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@advanced_dashboard_bp.route("/dashboard/charts", methods=["GET"])
@jwt_required()
def get_chart_data_endpoint():
    """Get chart data for visualization"""
    user_id = get_jwt_identity()
    
    try:
        # Get time range and chart type
        days = request.args.get("days", 30, type=int)
        chart_type = request.args.get("type", "all")
        
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        charts = {}
        
        if chart_type == "all" or chart_type == "completion":
            charts["completion_trend"] = get_completion_trend(user_id, start_date, end_date)
        
        if chart_type == "all" or chart_type == "category":
            charts["category_distribution"] = get_category_distribution(user_id, start_date, end_date)
        
        if chart_type == "all" or chart_type == "priority":
            charts["priority_analysis"] = get_priority_analysis(user_id, start_date, end_date)
        
        if chart_type == "all" or chart_type == "weekly":
            charts["weekly_pattern"] = get_weekly_pattern(user_id, start_date, end_date)
        
        if chart_type == "all" or chart_type == "productivity":
            charts["productivity_score"] = get_productivity_score_trend(user_id, start_date, end_date)
        
        if chart_type == "all" or chart_type == "time":
            charts["time_allocation"] = get_time_allocation(user_id, start_date, end_date)
        
        return jsonify(charts), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@advanced_dashboard_bp.route("/dashboard/widgets", methods=["GET"])
@jwt_required()
def get_dashboard_widgets():
    """Get customizable dashboard widgets"""
    user_id = get_jwt_identity()
    
    try:
        # Get user's widget preferences
        widget_preferences = get_widget_preferences(user_id)
        
        # Generate widget data
        widgets = []
        for widget_config in widget_preferences:
            widget_data = generate_widget_data(user_id, widget_config)
            widgets.append(widget_data)
        
        return jsonify({
            "widgets": widgets,
            "available_widgets": DASHBOARD_WIDGETS,
            "layout": get_widget_layout(user_id)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@advanced_dashboard_bp.route("/dashboard/widgets", methods=["POST"])
@jwt_required()
def update_widget_preferences():
    """Update dashboard widget preferences"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        # Update widget preferences
        preferences = data.get("preferences", [])
        layout = data.get("layout", {})
        
        save_widget_preferences(user_id, preferences, layout)
        
        return jsonify({
            "success": True,
            "message": "Widget preferences updated successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@advanced_dashboard_bp.route("/dashboard/goals", methods=["GET"])
@jwt_required()
def get_goals():
    """Get user goals and progress"""
    user_id = get_jwt_identity()
    
    try:
        goals = get_user_goals(user_id)
        goal_progress = get_goal_progress(user_id)
        
        return jsonify({
            "goals": goals,
            "progress": goal_progress,
            "achievements": get_goal_achievements(user_id)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@advanced_dashboard_bp.route("/dashboard/goals", methods=["POST"])
@jwt_required()
def create_goal():
    """Create a new goal"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        required_fields = ["title", "target", "metric"]
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400
        
        goal = {
            "id": f"goal_{datetime.now().timestamp()}",
            "user_id": user_id,
            "title": data["title"],
            "description": data.get("description", ""),
            "target": data["target"],
            "metric": data["metric"],
            "current": 0,
            "deadline": data.get("deadline"),
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        }
        
        save_goal(goal)
        
        return jsonify({
            "success": True,
            "goal": goal,
            "message": "Goal created successfully"
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@advanced_dashboard_bp.route("/dashboard/export", methods=["GET"])
@jwt_required()
def export_dashboard_data():
    """Export dashboard data in various formats"""
    user_id = get_jwt_identity()
    
    try:
        export_format = request.args.get("format", "json")
        days = request.args.get("days", 30, type=int)
        
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        if export_format == "json":
            data = get_export_data(user_id, start_date, end_date)
            return jsonify(data), 200
        
        elif export_format == "csv":
            csv_data = generate_csv_export(user_id, start_date, end_date)
            return csv_data, 200, {
                "Content-Type": "text/csv",
                "Content-Disposition": f"attachment; filename=dashboard_export_{datetime.now().strftime('%Y%m%d')}.csv"
            }
        
        else:
            return jsonify({"error": "Unsupported export format"}), 400
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Helper functions for advanced dashboard
def get_user_summary(user_id):
    """Get user summary statistics"""
    # Mock implementation
    return {
        "total_tasks": 156,
        "completed_tasks": 128,
        "pending_tasks": 28,
        "completion_rate": 82.1,
        "productivity_score": 87.5,
        "current_streak": 12,
        "longest_streak": 23,
        "total_time_logged": 245.5,  # hours
        "average_task_time": 1.9,  # hours
        "tasks_this_week": 15,
        "tasks_completed_this_week": 12
    }

def get_productivity_metrics(user_id, start_date, end_date):
    """Get productivity metrics"""
    # Mock implementation
    return {
        "overall_score": 85.2,
        "task_completion_rate": 82.1,
        "time_efficiency": 78.9,
        "quality_score": 91.3,
        "consistency_score": 88.7,
        "improvement_rate": 5.2,  # percentage improvement
        "peak_productivity_hour": 14,  # 2 PM
        "most_productive_day": "Wednesday",
        "focus_sessions": 45,
        "average_focus_duration": 45.5  # minutes
    }

def get_chart_data(user_id, start_date, end_date):
    """Get comprehensive chart data"""
    return {
        "completion_trend": get_completion_trend(user_id, start_date, end_date),
        "category_distribution": get_category_distribution(user_id, start_date, end_date),
        "priority_analysis": get_priority_analysis(user_id, start_date, end_date),
        "weekly_pattern": get_weekly_pattern(user_id, start_date, end_date),
        "productivity_score": get_productivity_score_trend(user_id, start_date, end_date),
        "time_allocation": get_time_allocation(user_id, start_date, end_date)
    }

def get_widget_data(user_id, start_date, end_date):
    """Get data for dashboard widgets"""
    return {
        "quick_stats": {
            "tasks_today": 8,
            "tasks_completed_today": 6,
            "productivity_today": 75.0,
            "time_logged_today": 6.5
        },
        "recent_activity": [
            {
                "type": "task_completed",
                "title": "Complete project proposal",
                "timestamp": (datetime.now() - timedelta(hours=2)).isoformat()
            },
            {
                "type": "goal_achieved",
                "title": "Complete 10 tasks this week",
                "timestamp": (datetime.now() - timedelta(days=1)).isoformat()
            }
        ],
        "upcoming_deadlines": [
            {
                "title": "Q4 Report",
                "deadline": (datetime.now() + timedelta(days=3)).isoformat(),
                "priority": "high"
            }
        ]
    }

def generate_dashboard_insights(user_id, start_date, end_date):
    """Generate AI-powered insights"""
    return [
        {
            "type": "productivity",
            "title": "Peak Performance Time",
            "description": "Your productivity peaks between 2-4 PM. Schedule important tasks during this time.",
            "action": "optimize_schedule",
            "confidence": 0.92
        },
        {
            "type": "improvement",
            "title": "Task Completion Trend",
            "description": "Your task completion rate has improved by 15% this month.",
            "action": "maintain_momentum",
            "confidence": 0.87
        },
        {
            "type": "focus",
            "title": "Deep Work Sessions",
            "description": "You're most effective with 45-minute focused work sessions.",
            "action": "use_pomodoro",
            "confidence": 0.78
        }
    ]

def get_goal_progress(user_id):
    """Get goal progress data"""
    return [
        {
            "id": "goal_1",
            "title": "Complete 50 tasks this month",
            "current": 38,
            "target": 50,
            "progress": 76.0,
            "deadline": (datetime.now() + timedelta(days=10)).isoformat(),
            "status": "on_track"
        },
        {
            "id": "goal_2",
            "title": "Maintain 80% completion rate",
            "current": 82.1,
            "target": 80.0,
            "progress": 102.6,
            "deadline": (datetime.now() + timedelta(days=20)).isoformat(),
            "status": "exceeded"
        }
    ]

def get_task_metrics(user_id, start_date, end_date):
    """Get detailed task metrics"""
    return {
        "total_tasks": 45,
        "completed_tasks": 37,
        "completion_rate": 82.2,
        "average_completion_time": 2.3,  # days
        "tasks_per_day": 1.5,
        "completion_trend": "increasing",
        "category_performance": {
            "development": {"completed": 15, "total": 18, "rate": 83.3},
            "meetings": {"completed": 8, "total": 10, "rate": 80.0},
            "documentation": {"completed": 14, "total": 17, "rate": 82.4}
        }
    }

def get_time_metrics(user_id, start_date, end_date):
    """Get time tracking metrics"""
    return {
        "total_hours_logged": 78.5,
        "average_daily_hours": 5.2,
        "most_productive_hour": 14,
        "focus_sessions": 23,
        "average_focus_duration": 45.2,
        "break_frequency": 2.3,  # breaks per day
        "time_by_category": {
            "development": 35.2,
            "meetings": 18.5,
            "planning": 12.3,
            "documentation": 12.5
        }
    }

def get_quality_metrics(user_id, start_date, end_date):
    """Get quality metrics"""
    return {
        "error_rate": 0.05,  # 5% error rate
        "revision_rate": 0.12,  # 12% revision rate
        "satisfaction_score": 4.3,  # out of 5
        "quality_trend": "improving",
        "peer_ratings": {
            "code_quality": 4.5,
            "documentation": 4.1,
            "communication": 4.6
        }
    }

def get_efficiency_metrics(user_id, start_date, end_date):
    """Get efficiency metrics"""
    return {
        "task_efficiency": 87.3,
        "time_efficiency": 82.1,
        "resource_efficiency": 79.8,
        "process_efficiency": 85.2,
        "efficiency_trend": "improving",
        "bottlenecks": ["meeting_overhead", "context_switching"]
    }

def get_comparison_metrics(user_id, start_date, end_date):
    """Get comparison metrics"""
    return {
        "vs_previous_period": {
            "tasks_completed": "+12%",
            "productivity_score": "+5.2%",
            "time_efficiency": "+3.1%"
        },
        "vs_team_average": {
            "completion_rate": "+8.3%",
            "productivity_score": "+6.7%",
            "quality_score": "+2.1%"
        },
        "vs_goals": {
            "task_completion": "92%",
            "productivity_target": "105%",
            "quality_target": "98%"
        }
    }

def get_completion_trend(user_id, start_date, end_date):
    """Get task completion trend data"""
    # Generate daily completion data
    data = []
    current_date = start_date
    
    while current_date <= end_date:
        # Mock data with some randomness
        base_completion = 5
        weekend_factor = 0.3 if current_date.weekday() >= 5 else 1.0
        daily_completion = base_completion * weekend_factor + random.uniform(-1, 2)
        
        data.append({
            "date": current_date.strftime("%Y-%m-%d"),
            "completed": max(0, int(daily_completion)),
            "created": int(daily_completion * 1.2)
        })
        
        current_date += timedelta(days=1)
    
    return data

def get_category_distribution(user_id, start_date, end_date):
    """Get task category distribution"""
    return [
        {"category": "development", "count": 25, "percentage": 35.7},
        {"category": "meetings", "count": 15, "percentage": 21.4},
        {"category": "planning", "count": 12, "percentage": 17.1},
        {"category": "documentation", "count": 10, "percentage": 14.3},
        {"category": "review", "count": 8, "percentage": 11.4}
    ]

def get_priority_analysis(user_id, start_date, end_date):
    """Get priority analysis data"""
    return [
        {"priority": "high", "count": 20, "completion_rate": 85.0},
        {"priority": "medium", "count": 35, "completion_rate": 82.9},
        {"priority": "low", "count": 15, "completion_rate": 73.3}
    ]

def get_weekly_pattern(user_id, start_date, end_date):
    """Get weekly work pattern"""
    return [
        {"day": "Monday", "tasks_completed": 8, "productivity_score": 82.1},
        {"day": "Tuesday", "tasks_completed": 10, "productivity_score": 87.3},
        {"day": "Wednesday", "tasks_completed": 12, "productivity_score": 91.2},
        {"day": "Thursday", "tasks_completed": 9, "productivity_score": 85.6},
        {"day": "Friday", "tasks_completed": 7, "productivity_score": 78.9},
        {"day": "Saturday", "tasks_completed": 3, "productivity_score": 65.2},
        {"day": "Sunday", "tasks_completed": 2, "productivity_score": 58.7}
    ]

def get_productivity_score_trend(user_id, start_date, end_date):
    """Get productivity score over time"""
    data = []
    current_date = start_date
    
    while current_date <= end_date:
        # Mock productivity score with trend
        base_score = 75
        trend_factor = (current_date - start_date).days * 0.1
        daily_variation = random.uniform(-5, 5)
        score = min(100, max(0, base_score + trend_factor + daily_variation))
        
        data.append({
            "date": current_date.strftime("%Y-%m-%d"),
            "score": round(score, 1)
        })
        
        current_date += timedelta(days=1)
    
    return data

def get_time_allocation(user_id, start_date, end_date):
    """Get time allocation by activity"""
    return [
        {"activity": "Deep Work", "hours": 35.2, "percentage": 44.8},
        {"activity": "Meetings", "hours": 18.5, "percentage": 23.6},
        {"activity": "Planning", "hours": 12.3, "percentage": 15.7},
        {"activity": "Communication", "hours": 8.7, "percentage": 11.1},
        {"activity": "Breaks", "hours": 3.8, "percentage": 4.8}
    ]

def get_widget_preferences(user_id):
    """Get user's widget preferences"""
    # Mock implementation
    return [
        {
            "id": "widget_1",
            "type": "task_completion",
            "position": {"x": 0, "y": 0, "w": 6, "h": 4},
            "config": {"days": 30}
        },
        {
            "id": "widget_2",
            "type": "productivity_score",
            "position": {"x": 6, "y": 0, "w": 6, "h": 4},
            "config": {}
        },
        {
            "id": "widget_3",
            "type": "category_distribution",
            "position": {"x": 0, "y": 4, "w": 4, "h": 4},
            "config": {}
        },
        {
            "id": "widget_4",
            "type": "weekly_progress",
            "position": {"x": 4, "y": 4, "w": 8, "h": 4},
            "config": {}
        }
    ]

def generate_widget_data(user_id, widget_config):
    """Generate data for a specific widget"""
    widget_type = widget_config["type"]
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=widget_config.get("config", {}).get("days", 30))
    
    if widget_type == "task_completion":
        return {
            **widget_config,
            "data": get_completion_trend(user_id, start_date, end_date)
        }
    elif widget_type == "productivity_score":
        return {
            **widget_config,
            "data": {"current_score": 85.2, "previous_score": 80.0}
        }
    elif widget_type == "category_distribution":
        return {
            **widget_config,
            "data": get_category_distribution(user_id, start_date, end_date)
        }
    elif widget_type == "weekly_progress":
        return {
            **widget_config,
            "data": get_weekly_pattern(user_id, start_date, end_date)
        }
    
    return widget_config

def get_widget_layout(user_id):
    """Get widget layout configuration"""
    return {
        "columns": 12,
        "row_height": 60,
        "margin": [10, 10],
        "container_padding": [10, 10]
    }

def save_widget_preferences(user_id, preferences, layout):
    """Save widget preferences (mock implementation)"""
    # In real implementation, would save to database
    pass

def get_user_goals(user_id):
    """Get user's goals"""
    return [
        {
            "id": "goal_1",
            "title": "Complete 50 tasks this month",
            "description": "Focus on task completion and quality",
            "target": 50,
            "metric": "tasks_completed",
            "deadline": (datetime.now() + timedelta(days=15)).isoformat(),
            "status": "active"
        },
        {
            "id": "goal_2",
            "title": "Maintain 80% productivity score",
            "description": "Keep productivity above 80%",
            "target": 80.0,
            "metric": "productivity_score",
            "deadline": (datetime.now() + timedelta(days=30)).isoformat(),
            "status": "active"
        }
    ]

def save_goal(goal):
    """Save goal (mock implementation)"""
    # In real implementation, would save to database
    pass

def get_goal_achievements(user_id):
    """Get goal achievements"""
    return [
        {
            "id": "achievement_1",
            "title": "Task Master",
            "description": "Completed 100 tasks",
            "achieved_at": (datetime.now() - timedelta(days=5)).isoformat(),
            "icon": "military_tech"
        },
        {
            "id": "achievement_2",
            "title": "Consistency King",
            "description": "30-day completion streak",
            "achieved_at": (datetime.now() - timedelta(days=10)).isoformat(),
            "icon": "local_fire_department"
        }
    ]

def get_export_data(user_id, start_date, end_date):
    """Get data for export"""
    return {
        "summary": get_user_summary(user_id),
        "metrics": get_productivity_metrics(user_id, start_date, end_date),
        "charts": get_chart_data(user_id, start_date, end_date),
        "goals": get_goal_progress(user_id),
        "export_timestamp": datetime.utcnow().isoformat()
    }

def generate_csv_export(user_id, start_date, end_date):
    """Generate CSV export data"""
    # Mock CSV data
    csv_headers = "Date,Tasks Completed,Productivity Score,Hours Logged\n"
    csv_data = ""
    
    current_date = start_date
    while current_date <= end_date:
        tasks_completed = random.randint(3, 12)
        productivity_score = round(random.uniform(70, 95), 1)
        hours_logged = round(random.uniform(4, 10), 1)
        
        csv_data += f"{current_date.strftime('%Y-%m-%d')},{tasks_completed},{productivity_score},{hours_logged}\n"
        current_date += timedelta(days=1)
    
    return csv_headers + csv_data
