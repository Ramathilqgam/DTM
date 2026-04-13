from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import random
from ..models.user import User
from ..models.task import Task

priority_matrix_bp = Blueprint("priority_matrix", __name__)

# Eisenhower Matrix quadrants
MATRIX_QUADRANTS = {
    "urgent_important": {
        "name": "Do First",
        "description": "Urgent and important tasks - do these immediately",
        "color": "#F44336",
        "icon": "priority_high",
        "action": "Do",
        "time_frame": "Today",
        "priority": 1
    },
    "important_not_urgent": {
        "name": "Schedule",
        "description": "Important but not urgent - schedule time to do these",
        "color": "#2196F3",
        "icon": "event",
        "action": "Schedule",
        "time_frame": "This Week",
        "priority": 2
    },
    "urgent_not_important": {
        "name": "Delegate",
        "description": "Urgent but not important - delegate if possible",
        "color": "#FF9800",
        "icon": "share",
        "action": "Delegate",
        "time_frame": "Today/Tomorrow",
        "priority": 3
    },
    "not_urgent_not_important": {
        "name": "Eliminate",
        "description": "Neither urgent nor important - eliminate or minimize",
        "color": "#9E9E9E",
        "icon": "delete",
        "action": "Eliminate",
        "time_frame": "Later/Never",
        "priority": 4
    }
}

# Priority calculation rules
PRIORITY_RULES = {
    "urgency_factors": {
        "deadline_today": 1.0,
        "deadline_tomorrow": 0.8,
        "deadline_this_week": 0.6,
        "deadline_next_week": 0.4,
        "no_deadline": 0.2,
        "overdue": 1.2
    },
    "importance_factors": {
        "high": 1.0,
        "medium": 0.6,
        "low": 0.3
    },
    "category_importance": {
        "critical": 1.2,
        "urgent": 1.0,
        "normal": 0.8,
        "low": 0.6
    }
}

@priority_matrix_bp.route("/matrix", methods=["GET"])
def get_priority_matrix():
    """Get tasks organized by Eisenhower Matrix quadrants"""
    # For testing purposes, skip authentication
    user_id = "test_user"  # Mock user ID for testing
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    try:
        # Create sample tasks for demonstration (since database is empty)
        now = datetime.now()
        sample_tasks = [
            {
                "id": "task1",
                "title": "Complete project proposal",
                "description": "Prepare and submit Q2 project proposal for management review",
                "priority": "high",
                "deadline": (now + timedelta(days=1)).isoformat(),
                "category": "critical",
                "difficulty": "high",
                "impact": "high",
                "created_at": (now - timedelta(days=2)).isoformat(),
                "status": "in_progress",
                "user_id": user_id
            },
            {
                "id": "task2", 
                "title": "Review team performance",
                "description": "Conduct weekly team performance reviews and provide feedback",
                "priority": "medium",
                "deadline": (now + timedelta(days=5)).isoformat(),
                "category": "normal",
                "difficulty": "medium",
                "impact": "medium",
                "created_at": (now - timedelta(days=1)).isoformat(),
                "status": "pending",
                "user_id": user_id
            },
            {
                "id": "task3",
                "title": "Update documentation", 
                "description": "Update project documentation with latest changes and improvements",
                "priority": "low",
                "deadline": (now + timedelta(days=10)).isoformat(),
                "category": "low",
                "difficulty": "low",
                "impact": "low",
                "created_at": (now - timedelta(days=5)).isoformat(),
                "status": "pending",
                "user_id": user_id
            },
            {
                "id": "task4",
                "title": "Prepare presentation slides",
                "description": "Create slides for upcoming client presentation",
                "priority": "high",
                "deadline": (now + timedelta(days=3)).isoformat(),
                "category": "critical",
                "difficulty": "high",
                "impact": "high",
                "created_at": (now - timedelta(days=3)).isoformat(),
                "status": "in_progress",
                "user_id": user_id
            },
            {
                "id": "task5",
                "title": "Code review",
                "description": "Review pull requests and provide code quality feedback",
                "priority": "medium",
                "deadline": (now + timedelta(days=2)).isoformat(),
                "category": "normal",
                "difficulty": "medium",
                "impact": "medium",
                "created_at": (now - timedelta(days=4)).isoformat(),
                "status": "completed",
                "user_id": user_id
            }
        ]
        
        # Categorize tasks into matrix quadrants
        matrix_tasks = categorize_tasks_into_matrix(sample_tasks)
        
        # Generate insights and recommendations
        insights = generate_matrix_insights(matrix_tasks)
        recommendations = generate_matrix_recommendations(matrix_tasks)
        
        return jsonify({
            "matrix": matrix_tasks,
            "insights": insights,
            "recommendations": recommendations,
            "summary": generate_matrix_summary(matrix_tasks),
            "quadrants": MATRIX_QUADRANTS,
            "generated_at": datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@priority_matrix_bp.route("/analyze-task", methods=["POST"])
@jwt_required()
def analyze_task_priority():
    """Analyze a single task and determine its matrix quadrant"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or "task_id" not in data:
        return jsonify({"error": "Task ID required"}), 400
    
    try:
        task_id = data["task_id"]
        
        # Get task details (mock implementation)
        task = get_task_details(task_id, user_id)
        
        if not task:
            return jsonify({"error": "Task not found"}), 404
        
        # Calculate urgency and importance scores
        urgency_score = calculate_urgency_score(task)
        importance_score = calculate_importance_score(task)
        
        # Determine quadrant
        quadrant = determine_quadrant(urgency_score, importance_score)
        
        # Generate task-specific recommendations
        task_recommendations = generate_task_recommendations(task, quadrant)
        
        return jsonify({
            "task_id": task_id,
            "task": task,
            "urgency_score": urgency_score,
            "importance_score": importance_score,
            "quadrant": quadrant,
            "recommendations": task_recommendations,
            "analysis": {
                "deadline_impact": analyze_deadline_impact(task),
                "priority_factors": analyze_priority_factors(task),
                "suggested_action": MATRIX_QUADRANTS[quadrant]["action"],
                "time_frame": MATRIX_QUADRANTS[quadrant]["time_frame"]
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@priority_matrix_bp.route("/update-task-quadrant", methods=["POST"])
@jwt_required()
def update_task_quadrant():
    """Manually update a task's quadrant assignment"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or "task_id" not in data or "quadrant" not in data:
        return jsonify({"error": "Task ID and quadrant required"}), 400
    
    try:
        task_id = data["task_id"]
        quadrant = data["quadrant"]
        
        if quadrant not in MATRIX_QUADRANTS:
            return jsonify({"error": "Invalid quadrant"}), 400
        
        # Update task quadrant (mock implementation)
        success = update_task_priority(user_id, task_id, quadrant)
        
        if not success:
            return jsonify({"error": "Failed to update task"}), 500
        
        return jsonify({
            "success": True,
            "message": f"Task moved to {MATRIX_QUADRANTS[quadrant]['name']} quadrant",
            "quadrant": quadrant,
            "quadrant_info": MATRIX_QUADRANTS[quadrant]
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@priority_matrix_bp.route("/matrix-insights", methods=["GET"])
@jwt_required()
def get_matrix_insights():
    """Get detailed insights about task distribution and patterns"""
    user_id = get_jwt_identity()
    
    try:
        # Get user's tasks
        tasks = Task.find_visible_to_user(user_id)
        
        # Categorize tasks
        matrix_tasks = categorize_tasks_into_matrix(tasks)
        
        # Generate comprehensive insights
        insights = {
            "distribution_analysis": analyze_task_distribution(matrix_tasks),
            "productivity_patterns": analyze_productivity_patterns(matrix_tasks),
            "time_management": analyze_time_management(matrix_tasks),
            "recommendation_effectiveness": analyze_recommendation_effectiveness(matrix_tasks),
            "trend_analysis": analyze_priority_trends(tasks),
            "bottlenecks": identify_priority_bottlenecks(matrix_tasks),
            "optimization_suggestions": generate_optimization_suggestions(matrix_tasks)
        }
        
        return jsonify(insights), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@priority_matrix_bp.route("/batch-categorize", methods=["POST"])
@jwt_required()
def batch_categorize_tasks():
    """Categorize multiple tasks into matrix quadrants"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or "task_ids" not in data:
        return jsonify({"error": "Task IDs required"}), 400
    
    try:
        task_ids = data["task_ids"]
        results = []
        
        for task_id in task_ids:
            task = get_task_details(task_id, user_id)
            if task:
                urgency_score = calculate_urgency_score(task)
                importance_score = calculate_importance_score(task)
                quadrant = determine_quadrant(urgency_score, importance_score)
                
                results.append({
                    "task_id": task_id,
                    "task_title": task.get("title", "Unknown"),
                    "quadrant": quadrant,
                    "urgency_score": urgency_score,
                    "importance_score": importance_score,
                    "confidence": calculate_classification_confidence(urgency_score, importance_score)
                })
        
        return jsonify({
            "results": results,
            "summary": {
                "total_processed": len(results),
                "quadrant_distribution": count_quadrant_distribution(results),
                "average_confidence": sum(r["confidence"] for r in results) / len(results) if results else 0
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Helper functions for Priority Matrix
def categorize_tasks_into_matrix(tasks):
    """Categorize tasks into Eisenhower Matrix quadrants"""
    matrix = {
        "urgent_important": [],
        "important_not_urgent": [],
        "urgent_not_important": [],
        "not_urgent_not_important": []
    }
    
    for task in tasks:
        urgency_score = calculate_urgency_score(task)
        importance_score = calculate_importance_score(task)
        quadrant = determine_quadrant(urgency_score, importance_score)
        
        matrix[quadrant].append({
            **task,
            "urgency_score": urgency_score,
            "importance_score": importance_score,
            "quadrant": quadrant
        })
    
    # Sort tasks within each quadrant by priority
    for quadrant in matrix:
        matrix[quadrant].sort(key=lambda x: (x.get("priority", "medium"), x.get("deadline", "")), reverse=True)
    
    return matrix

def calculate_urgency_score(task):
    """Calculate urgency score based on deadline and time factors"""
    score = 0.0
    
    if task.get("deadline"):
        deadline = datetime.fromisoformat(task["deadline"].replace('Z', '+00:00'))
        now = datetime.now()
        days_until_deadline = (deadline - now).days
        
        if days_until_deadline < 0:
            score = PRIORITY_RULES["urgency_factors"]["overdue"]
        elif days_until_deadline == 0:
            score = PRIORITY_RULES["urgency_factors"]["deadline_today"]
        elif days_until_deadline == 1:
            score = PRIORITY_RULES["urgency_factors"]["deadline_tomorrow"]
        elif days_until_deadline <= 7:
            score = PRIORITY_RULES["urgency_factors"]["deadline_this_week"]
        elif days_until_deadline <= 14:
            score = PRIORITY_RULES["urgency_factors"]["deadline_next_week"]
        else:
            score = PRIORITY_RULES["urgency_factors"]["no_deadline"]
    else:
        score = PRIORITY_RULES["urgency_factors"]["no_deadline"]
    
    # Adjust for task age (older tasks might be more urgent)
    if task.get("created_at"):
        created = datetime.fromisoformat(task["created_at"].replace('Z', '+00:00'))
        days_old = (datetime.now() - created).days
        if days_old > 7:
            score += 0.1  # Add urgency for old tasks
    
    return min(score, 1.0)

def calculate_importance_score(task):
    """Calculate importance score based on priority, category, and other factors"""
    score = 0.0
    
    # Base importance from priority
    priority = task.get("priority", "medium")
    score = PRIORITY_RULES["importance_factors"][priority]
    
    # Adjust for category importance
    category = task.get("category", "normal")
    if category in PRIORITY_RULES["category_importance"]:
        score *= PRIORITY_RULES["category_importance"][category]
    
    # Adjust for difficulty (harder tasks might be more important)
    difficulty = task.get("difficulty", "medium")
    if difficulty == "high":
        score += 0.1
    elif difficulty == "low":
        score -= 0.05
    
    # Adjust for dependencies (tasks blocking others are more important)
    if task.get("blocks_other_tasks", False):
        score += 0.15
    
    # Adjust for impact (tasks with high impact are more important)
    impact = task.get("impact", "medium")
    if impact == "high":
        score += 0.2
    elif impact == "low":
        score -= 0.1
    
    return min(score, 1.0)

def determine_quadrant(urgency_score, importance_score):
    """Determine which quadrant a task belongs to based on urgency and importance"""
    urgency_threshold = 0.6
    importance_threshold = 0.6
    
    if urgency_score >= urgency_threshold and importance_score >= importance_threshold:
        return "urgent_important"
    elif urgency_score < urgency_threshold and importance_score >= importance_threshold:
        return "important_not_urgent"
    elif urgency_score >= urgency_threshold and importance_score < importance_threshold:
        return "urgent_not_important"
    else:
        return "not_urgent_not_important"

def generate_matrix_insights(matrix_tasks):
    """Generate insights about task distribution in the matrix"""
    total_tasks = sum(len(tasks) for tasks in matrix_tasks.values())
    
    if total_tasks == 0:
        return {"message": "No tasks available for analysis"}
    
    insights = {
        "total_tasks": total_tasks,
        "quadrant_distribution": {
            quadrant: len(tasks) for quadrant, tasks in matrix_tasks.items()
        },
        "quadrant_percentages": {
            quadrant: (len(tasks) / total_tasks) * 100 
            for quadrant, tasks in matrix_tasks.items()
        },
        "workload_balance": analyze_workload_balance(matrix_tasks),
        "urgency_distribution": analyze_urgency_distribution(matrix_tasks),
        "importance_distribution": analyze_importance_distribution(matrix_tasks)
    }
    
    return insights

def generate_matrix_recommendations(matrix_tasks):
    """Generate recommendations based on matrix analysis"""
    recommendations = []
    
    # Check for too many urgent tasks
    urgent_count = len(matrix_tasks["urgent_important"]) + len(matrix_tasks["urgent_not_important"])
    if urgent_count > 5:
        recommendations.append({
            "type": "workload",
            "priority": "high",
            "message": "You have too many urgent tasks. Consider delegating or rescheduling some.",
            "action": "review_urgent_tasks",
            "quadrants": ["urgent_important", "urgent_not_important"]
        })
    
    # Check for neglected important tasks
    important_count = len(matrix_tasks["important_not_urgent"])
    if important_count > 8:
        recommendations.append({
            "type": "planning",
            "priority": "medium",
            "message": "Many important tasks are not scheduled. Block time for these this week.",
            "action": "schedule_important_tasks",
            "quadrants": ["important_not_urgent"]
        })
    
    # Check for too many low-value tasks
    low_value_count = len(matrix_tasks["not_urgent_not_important"])
    if low_value_count > 10:
        recommendations.append({
            "type": "optimization",
            "priority": "medium",
            "message": "Consider eliminating or delegating low-value tasks to focus on what matters.",
            "action": "eliminate_low_value",
            "quadrants": ["not_urgent_not_important"]
        })
    
    return recommendations

def generate_matrix_summary(matrix_tasks):
    """Generate a summary of the current matrix state"""
    total_tasks = sum(len(tasks) for tasks in matrix_tasks.values())
    
    return {
        "total_tasks": total_tasks,
        "focus_area": get_primary_focus_area(matrix_tasks),
        "productivity_score": calculate_matrix_productivity_score(matrix_tasks),
        "workload_status": assess_workload_status(matrix_tasks),
        "key_priorities": identify_key_priorities(matrix_tasks),
        "time_allocation": suggest_time_allocation(matrix_tasks)
    }

def get_task_details(task_id, user_id):
    """Get task details (mock implementation with sample tasks)"""
    # Create sample tasks for demonstration
    now = datetime.now()
    mock_tasks = {
        "task1": {
            "id": "task1",
            "title": "Complete project proposal",
            "description": "Prepare and submit the Q2 project proposal for management review",
            "priority": "high",
            "deadline": (now + timedelta(days=1)).isoformat(),
            "category": "critical",
            "difficulty": "high",
            "impact": "high",
            "created_at": (now - timedelta(days=2)).isoformat(),
            "status": "in_progress"
        },
        "task2": {
            "id": "task2", 
            "title": "Review team performance",
            "description": "Conduct weekly team performance reviews and provide feedback",
            "priority": "medium",
            "deadline": (now + timedelta(days=5)).isoformat(),
            "category": "normal",
            "difficulty": "medium",
            "impact": "medium",
            "created_at": (now - timedelta(days=1)).isoformat(),
            "status": "pending"
        },
        "task3": {
            "id": "task3",
            "title": "Update documentation", 
            "description": "Update project documentation with latest changes and improvements",
            "priority": "low",
            "deadline": (now + timedelta(days=10)).isoformat(),
            "category": "low",
            "difficulty": "low",
            "impact": "low",
            "created_at": (now - timedelta(days=5)).isoformat(),
            "status": "pending"
        },
        "task4": {
            "id": "task4",
            "title": "Prepare presentation slides",
            "description": "Create slides for upcoming client presentation",
            "priority": "high",
            "deadline": (now + timedelta(days=3)).isoformat(),
            "category": "critical",
            "difficulty": "high",
            "impact": "high",
            "created_at": (now - timedelta(days=3)).isoformat(),
            "status": "in_progress"
        },
        "task5": {
            "id": "task5",
            "title": "Code review",
            "description": "Review pull requests and provide code quality feedback",
            "priority": "medium",
            "deadline": (now + timedelta(days=2)).isoformat(),
            "category": "normal",
            "difficulty": "medium",
            "impact": "medium",
            "created_at": (now - timedelta(days=4)).isoformat(),
            "status": "completed"
        }
    }
    
    return mock_tasks.get(task_id)

def update_task_priority(user_id, task_id, quadrant):
    """Update task quadrant assignment (mock implementation)"""
    # Mock implementation - in real app, would update database
    return True

def calculate_classification_confidence(urgency_score, importance_score):
    """Calculate confidence in quadrant classification"""
    # Higher confidence when scores are clearly above/below thresholds
    urgency_confidence = abs(urgency_score - 0.6) * 2
    importance_confidence = abs(importance_score - 0.6) * 2
    return min((urgency_confidence + importance_confidence) / 2, 1.0)

def count_quadrant_distribution(results):
    """Count tasks in each quadrant from batch results"""
    distribution = {}
    for result in results:
        quadrant = result["quadrant"]
        distribution[quadrant] = distribution.get(quadrant, 0) + 1
    return distribution

def analyze_workload_balance(matrix_tasks):
    """Analyze if workload is balanced across quadrants"""
    total = sum(len(tasks) for tasks in matrix_tasks.values())
    if total == 0:
        return "balanced"
    
    # Check if too many tasks in urgent quadrants
    urgent_percentage = ((len(matrix_tasks["urgent_important"]) + len(matrix_tasks["urgent_not_important"])) / total) * 100
    
    if urgent_percentage > 60:
        return "overloaded_urgent"
    elif urgent_percentage < 20:
        return "underloaded_urgent"
    else:
        return "balanced"

def analyze_urgency_distribution(matrix_tasks):
    """Analyze urgency distribution across tasks"""
    return {
        "high_urgency": len(matrix_tasks["urgent_important"]) + len(matrix_tasks["urgent_not_important"]),
        "low_urgency": len(matrix_tasks["important_not_urgent"]) + len(matrix_tasks["not_urgent_not_important"])
    }

def analyze_importance_distribution(matrix_tasks):
    """Analyze importance distribution across tasks"""
    return {
        "high_importance": len(matrix_tasks["urgent_important"]) + len(matrix_tasks["important_not_urgent"]),
        "low_importance": len(matrix_tasks["urgent_not_important"]) + len(matrix_tasks["not_urgent_not_important"])
    }

def get_primary_focus_area(matrix_tasks):
    """Determine the primary focus area based on task distribution"""
    max_quadrant = max(matrix_tasks.keys(), key=lambda x: len(matrix_tasks[x]))
    return MATRIX_QUADRANTS[max_quadrant]["name"]

def calculate_matrix_productivity_score(matrix_tasks):
    """Calculate productivity score based on task distribution"""
    total = sum(len(tasks) for tasks in matrix_tasks.values())
    if total == 0:
        return 0
    
    # Ideal distribution: more important tasks, fewer low-value tasks
    ideal_weights = {
        "urgent_important": 0.25,
        "important_not_urgent": 0.35,
        "urgent_not_important": 0.20,
        "not_urgent_not_important": 0.20
    }
    
    actual_weights = {
        quadrant: len(tasks) / total for quadrant, tasks in matrix_tasks.items()
    }
    
    # Calculate deviation from ideal
    score = 100
    for quadrant, ideal_weight in ideal_weights.items():
        deviation = abs(actual_weights[quadrant] - ideal_weight)
        score -= deviation * 100
    
    return max(score, 0)

def assess_workload_status(matrix_tasks):
    """Assess current workload status"""
    urgent_count = len(matrix_tasks["urgent_important"]) + len(matrix_tasks["urgent_not_urgent"])
    
    if urgent_count > 8:
        return "overloaded"
    elif urgent_count > 4:
        return "busy"
    elif urgent_count > 0:
        return "manageable"
    else:
        return "light"

def identify_key_priorities(matrix_tasks):
    """Identify key priorities from urgent important tasks"""
    return [task["title"] for task in matrix_tasks["urgent_important"][:3]]

def suggest_time_allocation(matrix_tasks):
    """Suggest time allocation based on matrix distribution"""
    total = sum(len(tasks) for tasks in matrix_tasks.values())
    if total == 0:
        return {}
    
    return {
        "urgent_important": f"{int((len(matrix_tasks['urgent_important']) / total) * 100)}%",
        "important_not_urgent": f"{int((len(matrix_tasks['important_not_urgent']) / total) * 100)}%",
        "urgent_not_important": f"{int((len(matrix_tasks['urgent_not_important']) / total) * 100)}%",
        "not_urgent_not_important": f"{int((len(matrix_tasks['not_urgent_not_important']) / total) * 100)}%"
    }

def analyze_deadline_impact(task):
    """Analyze how deadline affects task priority"""
    if not task.get("deadline"):
        return {"impact": "low", "reason": "No deadline set"}
    
    deadline = datetime.fromisoformat(task["deadline"].replace('Z', '+00:00'))
    days_until = (deadline - datetime.now()).days
    
    if days_until < 0:
        return {"impact": "critical", "reason": "Task is overdue"}
    elif days_until == 0:
        return {"impact": "high", "reason": "Due today"}
    elif days_until <= 2:
        return {"impact": "high", "reason": f"Due in {days_until} days"}
    elif days_until <= 7:
        return {"impact": "medium", "reason": f"Due in {days_until} days"}
    else:
        return {"impact": "low", "reason": f"Due in {days_until} days"}

def analyze_priority_factors(task):
    """Analyze factors affecting task priority"""
    factors = []
    
    if task.get("priority") == "high":
        factors.append("High priority setting")
    
    if task.get("deadline"):
        factors.append("Has deadline")
    
    if task.get("category") == "critical":
        factors.append("Critical category")
    
    if task.get("difficulty") == "high":
        factors.append("High complexity")
    
    return factors

def generate_task_recommendations(task, quadrant):
    """Generate specific recommendations for a task"""
    quadrant_info = MATRIX_QUADRANTS[quadrant]
    recommendations = [quadrant_info["action"]]
    
    if quadrant == "urgent_important":
        recommendations.append("Focus on this immediately")
        recommendations.append("Block dedicated time")
    elif quadrant == "important_not_urgent":
        recommendations.append("Schedule specific time")
        recommendations.append("Avoid procrastination")
    elif quadrant == "urgent_not_important":
        recommendations.append("Consider delegation")
        recommendations.append("Quick completion if possible")
    else:
        recommendations.append("Evaluate necessity")
        recommendations.append("Consider postponing")
    
    return recommendations

def analyze_task_distribution(matrix_tasks):
    """Detailed analysis of task distribution"""
    return {
        "quadrant_counts": {quadrant: len(tasks) for quadrant, tasks in matrix_tasks.items()},
        "total_tasks": sum(len(tasks) for tasks in matrix_tasks.values()),
        "dominant_quadrant": max(matrix_tasks.keys(), key=lambda x: len(matrix_tasks[x])),
        "balance_score": calculate_balance_score(matrix_tasks)
    }

def calculate_balance_score(matrix_tasks):
    """Calculate how well-balanced the task distribution is"""
    total = sum(len(tasks) for tasks in matrix_tasks.values())
    if total == 0:
        return 100
    
    # Perfect balance would be 25% in each quadrant
    ideal_percentage = 25
    deviations = []
    
    for tasks in matrix_tasks.values():
        actual_percentage = (len(tasks) / total) * 100
        deviation = abs(actual_percentage - ideal_percentage)
        deviations.append(deviation)
    
    # Lower average deviation = better balance
    avg_deviation = sum(deviations) / len(deviations)
    balance_score = 100 - (avg_deviation * 2)
    
    return max(balance_score, 0)

def analyze_productivity_patterns(matrix_tasks):
    """Analyze productivity patterns from matrix data"""
    return {
        "focus_efficiency": calculate_focus_efficiency(matrix_tasks),
        "procrastination_risk": assess_procrastination_risk(matrix_tasks),
        "delegation_opportunities": identify_delegation_opportunities(matrix_tasks)
    }

def calculate_focus_efficiency(matrix_tasks):
    """Calculate how well user focuses on important tasks"""
    total = sum(len(tasks) for tasks in matrix_tasks.values())
    if total == 0:
        return 100
    
    important_tasks = len(matrix_tasks["urgent_important"]) + len(matrix_tasks["important_not_urgent"])
    return (important_tasks / total) * 100

def assess_procrastination_risk(matrix_tasks):
    """Assess risk of procrastination based on task distribution"""
    important_not_urgent = len(matrix_tasks["important_not_urgent"])
    urgent_important = len(matrix_tasks["urgent_important"])
    
    if important_not_urgent > urgent_important * 2:
        return "high"
    elif important_not_urgent > urgent_important:
        return "medium"
    else:
        return "low"

def identify_delegation_opportunities(matrix_tasks):
    """Identify tasks that could be delegated"""
    return len(matrix_tasks["urgent_not_important"])

def analyze_time_management(matrix_tasks):
    """Analyze time management patterns"""
    return {
        "urgent_workload": len(matrix_tasks["urgent_important"]) + len(matrix_tasks["urgent_not_urgent"]),
        "strategic_tasks": len(matrix_tasks["important_not_urgent"]),
        "low_value_tasks": len(matrix_tasks["not_urgent_not_important"]),
        "time_management_score": calculate_time_management_score(matrix_tasks)
    }

def calculate_time_management_score(matrix_tasks):
    """Calculate time management effectiveness score"""
    total = sum(len(tasks) for tasks in matrix_tasks.values())
    if total == 0:
        return 100
    
    # Good time management: focus on important tasks, minimize urgent not important
    strategic_ratio = len(matrix_tasks["important_not_urgent"]) / total
    urgent_not_important_ratio = len(matrix_tasks["urgent_not_important"]) / total
    
    score = (strategic_ratio * 100) - (urgent_not_important_ratio * 50)
    return max(score, 0)

def analyze_recommendation_effectiveness(matrix_tasks):
    """Analyze how well recommendations would work"""
    return {
        "delegateable_tasks": len(matrix_tasks["urgent_not_important"]),
        "eliminable_tasks": len(matrix_tasks["not_urgent_not_important"]),
        "scheduleable_tasks": len(matrix_tasks["important_not_urgent"]),
        "immediate_tasks": len(matrix_tasks["urgent_important"])
    }

def analyze_priority_trends(tasks):
    """Analyze trends in task priorities over time"""
    # Mock implementation - would analyze historical data
    return {
        "trend": "increasing_focus",
        "priority_stability": 0.75,
        "completion_patterns": "improving"
    }

def identify_priority_bottlenecks(matrix_tasks):
    """Identify bottlenecks in task prioritization"""
    bottlenecks = []
    
    if len(matrix_tasks["urgent_important"]) > 5:
        bottlenecks.append("Too many urgent tasks")
    
    if len(matrix_tasks["not_urgent_not_important"]) > 10:
        bottlenecks.append("Too many low-value tasks")
    
    return bottlenecks

def generate_optimization_suggestions(matrix_tasks):
    """Generate suggestions for optimizing task prioritization"""
    suggestions = []
    
    if len(matrix_tasks["urgent_not_important"]) > 3:
        suggestions.append("Consider delegating urgent but less important tasks")
    
    if len(matrix_tasks["important_not_urgent"]) > 6:
        suggestions.append("Schedule time blocks for important strategic tasks")
    
    if len(matrix_tasks["not_urgent_not_important"]) > 8:
        suggestions.append("Review and eliminate unnecessary tasks")
    
    return suggestions
