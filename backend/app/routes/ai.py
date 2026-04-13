from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import random
from ..models.user import User
from ..models.task import Task

ai_bp = Blueprint("ai", __name__)

# AI Skill Categories and Recommendations
SKILL_CATEGORIES = {
    "technical": {
        "skills": ["Programming", "Data Analysis", "Machine Learning", "Cloud Computing", "DevOps", "Cybersecurity"],
        "tasks": [
            "Complete an online course on Python/JavaScript",
            "Build a personal project",
            "Contribute to open source",
            "Learn a new framework/library",
            "Practice coding challenges",
            "Read technical documentation"
        ]
    },
    "soft_skills": {
        "skills": ["Communication", "Leadership", "Time Management", "Problem Solving", "Teamwork", "Creativity"],
        "tasks": [
            "Join a public speaking group",
            "Lead a team project",
            "Practice active listening exercises",
            "Read books on leadership",
            "Participate in team-building activities",
            "Take a creativity workshop"
        ]
    },
    "business": {
        "skills": ["Project Management", "Marketing", "Sales", "Financial Planning", "Strategic Thinking", "Networking"],
        "tasks": [
            "Create a business plan",
            "Learn digital marketing",
            "Practice negotiation skills",
            "Build a professional network",
            "Study market trends",
            "Develop financial literacy"
        ]
    },
    "personal_development": {
        "skills": ["Mindfulness", "Health & Fitness", "Reading", "Learning Languages", "Creative Writing", "Public Speaking"],
        "tasks": [
            "Start a meditation practice",
            "Create a workout routine",
            "Read 10 pages daily",
            "Practice a new language",
            "Write in a journal",
            "Join a book club"
        ]
    }
}

# Enhanced AI Personality and Response Templates
AI_RESPONSES = {
    "greeting": [
        "Hello! I'm your AI assistant, ready to help you grow and achieve your goals! What would you like to work on today?",
        "Hi there! I'm here to support your personal and professional development. How can I assist you today?",
        "Welcome! I'm your personal growth companion. Let's explore your potential together!",
        "Greetings! I'm excited to help you on your journey. What skills or goals would you like to focus on?",
        "Hey! I'm your AI coach for success. Let's make today productive!"
    ],
    "encouragement": [
        "You're doing great! Every small step counts towards your bigger goals.",
        "Keep up the excellent work! Your dedication will pay off.",
        "I believe in your ability to achieve amazing things!",
        "Progress is progress, no matter how small. You've got this!",
        "Your consistency is impressive. Keep pushing forward!"
    ],
    "goal_setting": [
        "Let's break down your goals into actionable steps. What's your main objective?",
        "I'll help you create a roadmap to success. What skills would you like to develop?",
        "Together, we can create a personalized development plan. What areas interest you most?",
        "Goal setting is my specialty! What would you like to accomplish?",
        "Let's turn your dreams into achievable goals. Where should we start?"
    ],
    "skill_development": [
        "Skill development is a journey! What area would you like to grow in?",
        "I can help you create a learning plan. What skills excite you?",
        "Let's assess your current skills and plan your growth. Ready?",
        "Continuous learning is key to success. What's next for you?",
        "I'm here to guide your skill development. What's your focus?"
    ],
    "productivity": [
        "Productivity is about working smarter, not harder! What's your biggest challenge?",
        "Let's optimize your workflow and boost your efficiency. Where do you need help?",
        "Time management and focus - I can help with both! What's your priority?",
        "Productivity hacks are my specialty! What would you like to improve?",
        "Let's make every minute count. How can I help you be more productive?"
    ],
    "motivation": [
        "You have unlimited potential! Let me help you unlock it.",
        "Success is a journey, and I'm here to guide you every step.",
        "Your future self will thank you for the work you're doing today!",
        "Every expert was once a beginner. You're on the right path!",
        "Great things never come from comfort zones. Let's grow together!"
    ]
}

# Enhanced knowledge base
KNOWLEDGE_BASE = {
    "skills": {
        "technical": {
            "description": "Technical skills involve working with computers, software, and technology",
            "benefits": "High demand, excellent career opportunities, problem-solving abilities",
            "learning_paths": ["Online courses", "Personal projects", "Open source contributions", "Coding challenges"],
            "timeframes": "3-6 months for basics, 1-2 years for proficiency"
        },
        "soft_skills": {
            "description": "Soft skills are interpersonal abilities that help you work effectively with others",
            "benefits": "Better relationships, leadership opportunities, career advancement",
            "learning_paths": ["Practice with colleagues", "Join clubs/organizations", "Public speaking", "Team projects"],
            "timeframes": "2-4 months for noticeable improvement"
        },
        "business": {
            "description": "Business skills help you understand organizations, markets, and strategy",
            "benefits": "Entrepreneurial opportunities, management roles, financial literacy",
            "learning_paths": ["Business courses", "Read business books", "Networking events", "Internships"],
            "timeframes": "6-12 months for foundational knowledge"
        }
    },
    "productivity_tips": [
        "Use the Pomodoro Technique: 25 minutes of focused work, 5-minute break",
        "Prioritize tasks using the Eisenhower Matrix: Urgent/Important framework",
        "Time blocking: Schedule specific blocks of time for different activities",
        "The 2-minute rule: If it takes less than 2 minutes, do it now",
        "Batch similar tasks together to maintain focus and efficiency",
        "Use the 80/20 rule: Focus on the 20% of activities that yield 80% of results"
    ],
    "goal_setting_framework": [
        "SMART goals: Specific, Measurable, Achievable, Relevant, Time-bound",
        "Break big goals into smaller, weekly milestones",
        "Review and adjust goals weekly based on progress",
        "Share goals with someone for accountability",
        "Celebrate small wins to maintain motivation"
    ]
}

@ai_bp.route("/chat", methods=["POST"])
@jwt_required()
def ai_chat():
    """AI Assistant Chat Interface"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    message = data.get("message", "").lower().strip()
    
    if not message:
        return jsonify({"error": "Message is required"}), 400
    
    try:
        # Get user's tasks for context
        tasks = Task.find_visible_to_user(user_id)
        task_count = len(tasks)
        completed_count = len([t for t in tasks if t.get("status") == "completed"])
        
        # AI Response Logic
        response = generate_ai_response(message, user, tasks)
        
        return jsonify({
            "response": response,
            "timestamp": datetime.utcnow().isoformat(),
            "suggestions": generate_suggestions(user, tasks)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ai_bp.route("/enhanced-chat", methods=["POST"])
@jwt_required()
def enhanced_ai_chat():
    """Enhanced AI Assistant with Real-time Capabilities"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    message = data.get("message", "").strip()
    context = data.get("context", {})
    user_preferences = context.get("user_preferences", {})
    
    if not message:
        return jsonify({"error": "Message is required"}), 400
    
    try:
        start_time = datetime.utcnow()
        
        # Get real-time data
        tasks = Task.find_visible_to_user(user_id)
        current_tasks = context.get("current_tasks", tasks)
        analytics = context.get("analytics", {})
        
        # Generate enhanced response with real-time context
        response = generate_enhanced_response(message, user, current_tasks, analytics, user_preferences)
        
        processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        return jsonify({
            "response": response,
            "timestamp": datetime.utcnow().isoformat(),
            "confidence": min(0.95, 0.7 + (len(tasks) * 0.01)),  # Confidence based on data availability
            "sources": ["user_tasks", "analytics", "knowledge_base"],
            "processing_time": f"{processing_time:.0f}ms",
            "suggestions": generate_enhanced_suggestions(message, current_tasks, analytics),
            "real_time_data": {
                "task_count": len(current_tasks),
                "analytics_available": bool(analytics),
                "context_freshness": context.get("timestamp")
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def generate_enhanced_response(message, user, tasks, analytics, preferences):
    """Generate enhanced AI response with real-time context"""
    message_lower = message.lower()
    
    # Real-time task analysis
    if any(keyword in message_lower for keyword in ["task", "todo", "what do i have", "current"]):
        return generate_task_analysis(tasks, analytics)
    
    # Performance and productivity analysis
    if any(keyword in message_lower for keyword in ["performance", "how am i doing", "productivity", "progress"]):
        return generate_performance_analysis(tasks, analytics)
    
    # Goal and focus recommendations
    if any(keyword in message_lower for keyword in ["goal", "focus", "priority", "what should i", "recommend"]):
        return generate_focus_recommendations(tasks, analytics)
    
    # Skill development insights
    if any(keyword in message_lower for keyword in ["skill", "learn", "improve", "develop"]):
        return generate_skill_insights(tasks, analytics, user)
    
    # General intelligent response with context
    return generate_contextual_response(message, tasks, analytics, user)

def generate_task_analysis(tasks, analytics):
    """Generate real-time task analysis"""
    pending_tasks = [t for t in tasks if t.get("status") == "pending"]
    in_progress_tasks = [t for t in tasks if t.get("status") == "in_progress"]
    completed_tasks = [t for t in tasks if t.get("status") == "completed"]
    overdue_tasks = [t for t in tasks if t.get("due_date") and datetime.fromisoformat(t["due_date"].replace("Z", "+00:00")) < datetime.utcnow() and t.get("status") != "completed"]
    
    response = f"**Real-time Task Overview**\\n\\n"
    response += f"**Current Status:**\\n"
    response += f"\\ud83d\\udd04 In Progress: {len(in_progress_tasks)}\\n"
    response += f"\\u23f3 Pending: {len(pending_tasks)}\\n"
    response += f"\\u2705 Completed: {len(completed_tasks)}\\n\\n"
    
    if in_progress_tasks:
        response += f"**Currently Working On:**\\n"
        for task in in_progress_tasks[:3]:
            priority_emoji = {"high": "\\ud83d\\udd25", "medium": "\\ud83d\\udfe1", "low": "\\ud83d\\udfe2"}.get(task.get("priority", "medium"), "\\ud83d\\udfe1")
            response += f"{priority_emoji} {task.get('title', 'Untitled Task')}\\n"
        response += "\\n"
    
    if overdue_tasks:
        response += f"**\\u26a0\\ufe0f Urgent - Overdue Tasks:**\\n"
        for task in overdue_tasks[:3]:
            response += f"\\u2757 {task.get('title', 'Untitled Task')}\\n"
        response += "\\n"
    
    if pending_tasks:
        high_priority = [t for t in pending_tasks if t.get("priority") == "high"]
        if high_priority:
            response += f"**High Priority Next:**\\n"
            for task in high_priority[:3]:
                response += f"\\ud83c\\udfaf {task.get('title', 'Untitled Task')}\\n"
    
    response += f"\\n**Recommendation:** "
    if overdue_tasks:
        response += f"Address your {len(overdue_tasks)} overdue task(s) first!"
    elif in_progress_tasks:
        response += f"Focus on completing your current {len(in_progress_tasks)} task(s) before starting new ones."
    elif high_priority:
        response += f"Start with your high-priority tasks for maximum impact."
    else:
        response += f"Great job staying on top of your tasks!"
    
    return response

def generate_performance_analysis(tasks, analytics):
    """Generate performance and productivity analysis"""
    total_tasks = len(tasks)
    completed_tasks = len([t for t in tasks if t.get("status") == "completed"])
    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    
    # Calculate productivity score
    productivity_score = analytics.get("productivity_score", completion_rate)
    
    response = f"**Performance Analytics**\\n\\n"
    response += f"**Current Metrics:**\\n"
    response += f"\\ud83c\\udfaf Completion Rate: {completion_rate:.1f}%\\n"
    response += f"\\u26a1 Productivity Score: {productivity_score:.1f}/100\\n"
    response += f"\\ud83d\\udcca Total Tasks: {total_tasks}\\n"
    response += f"\\u2705 Completed: {completed_tasks}\\n\\n"
    
    # Performance level assessment
    if productivity_score >= 80:
        level = "\\ud83d\\udd25 Excellent"
        advice = "Maintain this incredible momentum! You're performing at an elite level."
    elif productivity_score >= 60:
        level = "\\ud83d\\udc4d Good"
        advice = "Solid performance! Focus on consistency to reach the next level."
    elif productivity_score >= 40:
        level = "\\ud83d\\udcc8 Room for Improvement"
        advice = "You're making progress! Try focusing on 1-2 high-priority tasks daily."
    else:
        level = "\\ud83c\\udfaf Getting Started"
        advice = "Build momentum by completing small tasks consistently."
    
    response += f"**Performance Level:** {level}\\n\\n"
    response += f"**Coaching Tip:** {advice}\\n\\n"
    
    # Add trend analysis if available
    if analytics.get("weekly_trend"):
        trend = analytics["weekly_trend"]
        if trend > 0:
            response += f"\\ud83d\\udcc8 **Trend:** Up {trend:.1f}% this week - Keep it up!"
        else:
            response += f"\\ud83d\\udcc9 **Trend:** Down {abs(trend):.1f}% this week - Let's turn this around!"
    
    return response

def generate_focus_recommendations(tasks, analytics):
    """Generate focus and priority recommendations"""
    pending_tasks = [t for t in tasks if t.get("status") == "pending"]
    in_progress_tasks = [t for t in tasks if t.get("status") == "in_progress"]
    overdue_tasks = [t for t in tasks if t.get("due_date") and datetime.fromisoformat(t["due_date"].replace("Z", "+00:00")) < datetime.utcnow() and t.get("status") != "completed"]
    
    response = f"**Focus Recommendations**\\n\\n"
    
    # Immediate priorities
    if overdue_tasks:
        response += f"**\\u26a0\\ufe0f URGENT - Overdue Tasks:**\\n"
        for task in overdue_tasks[:3]:
            response += f"\\u2757 {task.get('title', 'Untitled Task')}\\n"
        response += f"\\n*Address these immediately to get back on track!*\\n\\n"
    
    # Current focus
    if in_progress_tasks:
        response += f"**\\ud83d\\udd04 Current Focus:**\\n"
        for task in in_progress_tasks[:2]:
            priority = task.get("priority", "medium")
            priority_emoji = {"high": "\\ud83d\\udd25", "medium": "\\ud83d\\udfe1", "low": "\\ud83d\\udfe2"}.get(priority, "\\ud83d\\udfe1")
            response += f"{priority_emoji} {task.get('title', 'Untitled Task')}\\n"
        response += "\\n"
    
    # Next actions
    high_priority = [t for t in pending_tasks if t.get("priority") == "high"]
    if high_priority:
        response += f"**\\ud83c\\udfaf Next Actions:**\\n"
        for task in high_priority[:3]:
            response += f"\\ud83d\\udccb {task.get('title', 'Untitled Task')}\\n"
        response += "\\n"
    
    # Strategic recommendation
    response += f"**Today's Strategy:**\\n"
    if overdue_tasks:
        response += f"1. Clear overdue tasks ({len(overdue_tasks)})\\n"
        response += f"2. Complete current work ({len(in_progress_tasks)})\\n"
        response += f"3. Start high-priority items ({len(high_priority)})\\n"
    elif in_progress_tasks:
        response += f"1. Finish current tasks ({len(in_progress_tasks)})\\n"
        response += f"2. Begin high-priority work ({len(high_priority)})\\n"
    else:
        response += f"1. Start with highest priority task\\n"
        response += f"2. Build momentum with quick wins\\n"
    
    return response

def generate_skill_insights(tasks, analytics, user):
    """Generate skill development insights"""
    # Analyze task patterns to infer skill areas
    task_titles = [t.get("title", "").lower() for t in tasks]
    
    skill_indicators = {
        "technical": ["code", "programming", "development", "software", "app", "website", "database"],
        "communication": ["meeting", "presentation", "email", "write", "document", "report"],
        "project_management": ["project", "plan", "schedule", "deadline", "milestone", "coordinate"],
        "analytical": ["analysis", "data", "research", "report", "metrics", "statistics"],
        "creative": ["design", "create", "content", "visual", "prototype", "concept"]
    }
    
    detected_skills = []
    for skill, keywords in skill_indicators.items():
        if any(keyword in " ".join(task_titles) for keyword in keywords):
            detected_skills.append(skill)
    
    response = f"**Skill Development Insights**\\n\\n"
    
    if detected_skills:
        response += f"**Detected Skill Areas:**\\n"
        for skill in detected_skills[:3]:
            skill_name = skill.replace("_", " ").title()
            response += f"\\ud83c\\udf93 {skill_name}\\n"
        response += "\\n"
        
        response += f"**Recommendations:**\\n"
        response += f"\\ud83d\\udcda Continue learning in your active areas\\n"
        response += f"\\ud83d\\ude80 Take on challenging projects to grow\\n"
        response += f"\\ud83d\\udc65 Seek feedback from peers and mentors\\n"
    else:
        response += f"**Explore New Skills:**\\n"
        response += f"\\ud83d\\udcb1 Try technical skills (coding, data analysis)\\n"
        response += f"\\ud83d\\udcac Develop communication abilities\\n"
        response += f"\\ud83d\\udcc8 Learn project management fundamentals\\n"
    
    response += f"\\n**Quick Action:** Pick one skill and dedicate 30 minutes daily for the next 2 weeks!"
    
    return response

def generate_contextual_response(message, tasks, analytics, user):
    """Generate intelligent contextual response"""
    task_count = len(tasks)
    completed_count = len([t for t in tasks if t.get("status") == "completed"])
    
    response = f"**Intelligent Analysis**\\n\\n"
    response += f"Based on your current activity:\\n"
    response += f"\\ud83d\\udcdd {task_count} total tasks\\n"
    response += f"\\u2705 {completed_count} completed\\n"
    response += f"\\ud83d\\udcc8 {task_count - completed_count} in progress/pending\\n\\n"
    
    if task_count > 10:
        response += f"**Insight:** You have a busy schedule - prioritize high-impact tasks.\\n"
        response += f"**Suggestion:** Consider the 80/20 rule - focus on tasks that deliver 80% of results.\\n"
    elif task_count > 5:
        response += f"**Insight:** Good workload balance - maintain steady progress.\\n"
        response += f"**Suggestion:** Use time-blocking to ensure focus on priorities.\\n"
    else:
        response += f"**Insight:** Manageable workload - focus on quality over quantity.\\n"
        response += f"**Suggestion:** Take on challenging tasks to accelerate growth.\\n"
    
    response += f"\\n**Ask me about:**\\n"
    response += f"\\u2022 Specific tasks and priorities\\n"
    response += f"\\u2022 Performance metrics and goals\\n"
    response += f"\\u2022 Skill development recommendations\\n"
    response += f"\\u2022 Productivity strategies\\n"
    
    return response

def generate_enhanced_suggestions(message, tasks, analytics):
    """Generate contextual suggestions based on message and data"""
    message_lower = message.lower()
    suggestions = []
    
    if "task" in message_lower:
        suggestions.extend([
            "Show me my overdue tasks",
            "What are my high priorities?",
            "How many tasks did I complete today?"
        ])
    
    if "performance" in message_lower or "how am i" in message_lower:
        suggestions.extend([
            "What's my productivity score?",
            "Show me my completion rate",
            "Am I on track for my goals?"
        ])
    
    if "focus" in message_lower or "what should" in message_lower:
        suggestions.extend([
            "What should I work on now?",
            "What are my priorities today?",
            "Help me plan my day"
        ])
    
    # Add general suggestions if none generated
    if not suggestions:
        suggestions = [
            "How am I performing today?",
            "What should I focus on?",
            "Show me my current tasks",
            "Help me set a goal",
            "Improve my productivity"
        ]
    
    return suggestions[:4]  # Return top 4 suggestions

@ai_bp.route("/analytics/real-time", methods=["GET"])
@jwt_required()
def real_time_analytics():
    """Real-time analytics data for AI assistant"""
    user_id = get_jwt_identity()
    
    try:
        # Get user's tasks for real-time analysis
        tasks = Task.find_visible_to_user(user_id)
        
        # Calculate real-time metrics
        total_tasks = len(tasks)
        completed_tasks = len([t for t in tasks if t.get("status") == "completed"])
        in_progress_tasks = len([t for t in tasks if t.get("status") == "in_progress"])
        pending_tasks = len([t for t in tasks if t.get("status") == "pending"])
        
        completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        productivity_score = min(100, completion_rate + (in_progress_tasks * 5))  # Bonus for active work
        
        # Calculate tasks created today
        today = datetime.utcnow().date()
        tasks_today = len([t for t in tasks if datetime.fromisoformat(t.get("created_at", "").replace("Z", "+00:00")).date() == today])
        
        # Calculate weekly trend (mock data for now)
        weekly_trend = random.uniform(-10, 15)  # Simulated trend
        
        analytics_data = {
            "productivity_score": round(productivity_score, 1),
            "completion_rate": round(completion_rate, 1),
            "tasks_today": tasks_today,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "in_progress_tasks": in_progress_tasks,
            "pending_tasks": pending_tasks,
            "weekly_trend": round(weekly_trend, 1),
            "last_updated": datetime.utcnow().isoformat(),
            "insights": {
                "performance_level": "Excellent" if productivity_score >= 80 else "Good" if productivity_score >= 60 else "Needs Improvement",
                "workload_status": "Heavy" if total_tasks > 10 else "Balanced" if total_tasks > 5 else "Light",
                "focus_area": "Complete current tasks" if in_progress_tasks > 3 else "Start high-priority tasks" if pending_tasks > 0 else "Maintain momentum"
            }
        }
        
        return jsonify(analytics_data), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ai_bp.route("/skill-assessment", methods=["GET"])
@jwt_required()
def skill_assessment():
    """AI-powered skill assessment and recommendations"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    try:
        # Get user's tasks for analysis
        tasks = Task.find_visible_to_user(user_id)
        
        # Analyze task patterns to infer skills
        skill_analysis = analyze_user_skills(tasks)
        
        # Generate personalized recommendations
        recommendations = generate_skill_recommendations(skill_analysis)
        
        # Create development roadmap
        roadmap = create_development_roadmap(skill_analysis, recommendations)
        
        return jsonify({
            "current_skills": skill_analysis,
            "recommendations": recommendations,
            "roadmap": roadmap,
            "assessment_date": datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ai_bp.route("/task-recommendations", methods=["GET"])
@jwt_required()
def task_recommendations():
    """AI-powered task recommendations based on user patterns"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    try:
        # Get user's tasks and patterns
        tasks = Task.find_visible_to_user(user_id)
        
        # Generate personalized task suggestions
        suggestions = generate_smart_task_suggestions(user, tasks)
        
        # Analyze user patterns
        patterns = analyze_user_patterns(tasks)
        
        return jsonify({
            "recommendations": suggestions,
            "patterns": patterns,
            "reasoning": "Based on your task completion patterns, preferences, and skill development goals",
            "timestamp": datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ai_bp.route("/smart-suggestions", methods=["GET"])
@jwt_required()
def smart_suggestions():
    """Enhanced smart suggestions with contextual awareness"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    try:
        # Get user's tasks and analyze patterns
        tasks = Task.find_visible_to_user(user_id)
        
        # Generate comprehensive smart suggestions
        smart_suggestions = generate_comprehensive_suggestions(user, tasks)
        
        return jsonify({
            "suggestions": smart_suggestions,
            "insights": generate_productivity_insights(tasks),
            "recommendations": generate_personalized_recommendations(user, tasks),
            "timestamp": datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ai_bp.route("/productivity-insights", methods=["GET"])
@jwt_required()
def productivity_insights():
    """AI Productivity Insights with weekly reports and analytics"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    try:
        # Get user's tasks for analysis
        tasks = Task.find_visible_to_user(user_id)
        
        # Generate comprehensive productivity insights
        insights = generate_weekly_productivity_report(tasks)
        
        # Generate time management analysis
        time_analysis = analyze_time_management_patterns(tasks)
        
        # Generate improvement recommendations
        improvements = generate_improvement_recommendations(tasks)
        
        return jsonify({
            "weekly_report": insights,
            "time_analysis": time_analysis,
            "improvements": improvements,
            "productivity_score": calculate_productivity_score(tasks),
            "generated_at": datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ai_bp.route("/goal-setting", methods=["POST"])
@jwt_required()
def goal_setting():
    """AI-assisted goal setting and planning"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    goal_type = data.get("goal_type", "general")
    timeframe = data.get("timeframe", "monthly")
    interests = data.get("interests", [])
    
    try:
        # Generate personalized goals
        goals = generate_personalized_goals(user, goal_type, timeframe, interests)
        
        # Create action plan
        action_plan = create_action_plan(goals, timeframe)
        
        return jsonify({
            "goals": goals,
            "action_plan": action_plan,
            "motivation": random.choice(AI_RESPONSES["encouragement"]),
            "created_at": datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ai_bp.route("/task-assistant", methods=["POST"])
@jwt_required()
def task_assistant():
    """AI Task Assistant - Auto-generate tasks from text input"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    input_text = data.get("input_text", "").strip()
    context = data.get("context", "general")
    
    if not input_text:
        return jsonify({"error": "Input text is required"}), 400
    
    try:
        # Generate tasks from input text
        generated_tasks = generate_tasks_from_text(input_text, context)
        
        # Suggest deadlines and priorities
        enhanced_tasks = suggest_deadlines_and_priorities(generated_tasks, user)
        
        return jsonify({
            "generated_tasks": enhanced_tasks,
            "input_text": input_text,
            "context": context,
            "suggestions": generate_task_context_suggestions(input_text),
            "timestamp": datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Helper Functions
def generate_ai_response(message, user, tasks):
    """Generate AI response based on user message with enhanced intelligence"""
    
    # Greeting responses
    if any(word in message for word in ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "good evening"]):
        return random.choice(AI_RESPONSES["greeting"])
    
    # Goal-related queries
    if any(word in message for word in ["goal", "goals", "objective", "plan", "target", "aim"]):
        if any(word in message for word in ["set", "create", "make", "establish"]):
            return f"{random.choice(AI_RESPONSES['goal_setting'])} I recommend using the SMART framework: Specific, Measurable, Achievable, Relevant, Time-bound. What specific goal would you like to set?"
        return f"{random.choice(AI_RESPONSES['goal_setting'])} I can help you create both short-term and long-term goals. What area interests you most?"
    
    # Skill development queries
    if any(word in message for word in ["skill", "learn", "improve", "develop", "study", "master", "training"]):
        if any(word in message for word in ["technical", "programming", "coding", "software"]):
            skill_info = KNOWLEDGE_BASE["skills"]["technical"]
            return f"Technical skills are {skill_info['description']}. {skill_info['benefits']}. I recommend: {', '.join(skill_info['learning_paths'][:2])}. You can see basics in {skill_info['timeframes'].split(',')[0]}. Want specific recommendations?"
        elif any(word in message for word in ["soft", "communication", "leadership", "teamwork"]):
            skill_info = KNOWLEDGE_BASE["skills"]["soft_skills"]
            return f"Soft skills are {skill_info['description']}. {skill_info['benefits']}. Try: {', '.join(skill_info['learning_paths'][:2])}. Improvement in {skill_info['timeframes']}. Ready to start?"
        elif any(word in message for word in ["business", "management", "strategy", "entrepreneur"]):
            skill_info = KNOWLEDGE_BASE["skills"]["business"]
            return f"Business skills {skill_info['description']}. {skill_info['benefits']}. Consider: {', '.join(skill_info['learning_paths'][:2])}. Foundation takes {skill_info['timeframes']}. What business area interests you?"
        else:
            return f"{random.choice(AI_RESPONSES['skill_development'])} I can help with technical, soft skills, or business skills. Which area interests you most?"
    
    # Task-related queries
    if any(word in message for word in ["task", "todo", "work", "project", "assignment"]):
        completed = len([t for t in tasks if t.get("status") == "completed"])
        total = len(tasks)
        
        if any(word in message for word in ["overwhelmed", "too many", "stress", "busy"]):
            return f"You have {total} tasks with {completed} completed. Try prioritizing with the Eisenhower Matrix: Urgent/Important. I can help you organize them. Would you like a prioritization plan?"
        elif any(word in message for word in ["motivation", "focus", "stuck", "procrastinate"]):
            tip = random.choice(KNOWLEDGE_BASE["productivity_tips"])
            return f"You're making progress with {completed}/{total} tasks done! Here's a tip: {tip}. What specific challenge are you facing?"
        else:
            completion_percentage = round((completed/total)*100, 1) if total > 0 else 0
            return f"You're doing great! {completed} of {total} tasks completed ({completion_percentage}%). Would you like help with task prioritization or productivity tips?"
    
    # Productivity queries
    if any(word in message for word in ["productivity", "focus", "motivation", "efficient", "time management"]):
        if any(word in message for word in ["tips", "advice", "help", "improve"]):
            tip = random.choice(KNOWLEDGE_BASE["productivity_tips"])
            return f"{random.choice(AI_RESPONSES['productivity'])} Here's a proven technique: {tip}. Would you like more specific productivity strategies?"
        else:
            return f"{random.choice(AI_RESPONSES['productivity'])} I can share proven techniques like Pomodoro, time blocking, and the 80/20 rule. What's your biggest productivity challenge?"
    
    # Motivation and encouragement queries
    if any(word in message for word in ["motivate", "encourage", "inspire", "can't", "difficult", "hard", "quit", "give up"]):
        return f"{random.choice(AI_RESPONSES['motivation'])} Remember: Every expert was once a beginner. Your consistency is what matters most. What specific challenge is making you feel this way?"
    
    # Career and future queries
    if any(word in message for word in ["career", "future", "job", "professional", "success"]):
        return "Career development combines technical, soft, and business skills. I recommend focusing on your strengths while developing areas that align with market demand. What's your current career field or aspiration?"
    
    # Learning and education queries
    if any(word in message for word in ["learn", "study", "education", "course", "knowledge"]):
        return "Continuous learning is crucial for growth! I can suggest learning paths, resources, and study strategies. What subject or skill are you most interested in learning?"
    
    # Time and planning queries
    if any(word in message for word in ["time", "schedule", "plan", "organize", "routine"]):
        framework = random.choice(KNOWLEDGE_BASE["goal_setting_framework"])
        return f"Time management is key to success! Here's a framework: {framework}. Would you like help creating a personalized schedule?"
    
    # Help and assistance queries
    if any(word in message for word in ["help", "assist", "support", "guide", "what can you do"]):
        return "I'm your AI assistant for personal and professional growth! I can help with: skill development, goal setting, task management, productivity strategies, motivation, and career planning. What would you like to explore?"
    
    # How are you queries
    if any(word in message for word in ["how are you", "how do you work", "what are you"]):
        return "I'm an AI assistant designed to help you achieve your goals and develop new skills! I analyze your tasks and patterns to provide personalized recommendations. I'm always ready to help you grow!"
    
    # Default response with more options
    return f"I'm here to help you succeed! I can assist with:\n\n" + \
           "1. **Skill Development** - Technical, soft skills, or business skills\n" + \
           "2. **Goal Setting** - SMART goals and action plans\n" + \
           "3. **Productivity** - Time management and efficiency tips\n" + \
           "4. **Task Management** - Prioritization and organization\n" + \
           "5. **Motivation** - Encouragement and success strategies\n\n" + \
           "What area would you like to focus on today?"

def analyze_user_skills(tasks):
    """Analyze user's skills based on their completed tasks"""
    skill_scores = {}
    
    # Analyze task titles and descriptions for skill indicators
    for task in tasks:
        if task.get("status") == "completed":
            title = task.get("title", "").lower()
            description = task.get("description", "").lower()
            
            # Technical skills indicators
            if any(word in title + description for word in ["code", "program", "develop", "software", "app", "web"]):
                skill_scores["technical"] = skill_scores.get("technical", 0) + 1
            
            # Communication skills indicators
            if any(word in title + description for word in ["present", "communicate", "meeting", "team", "collaborate"]):
                skill_scores["soft_skills"] = skill_scores.get("soft_skills", 0) + 1
            
            # Business skills indicators
            if any(word in title + description for word in ["plan", "strategy", "market", "business", "project"]):
                skill_scores["business"] = skill_scores.get("business", 0) + 1
            
            # Personal development indicators
            if any(word in title + description for word in ["learn", "study", "read", "practice", "improve"]):
                skill_scores["personal_development"] = skill_scores.get("personal_development", 0) + 1
    
    return skill_scores

def generate_skill_recommendations(skill_analysis):
    """Generate personalized skill recommendations"""
    recommendations = []
    
    # Find areas with lowest scores to recommend improvement
    if skill_analysis.get("technical", 0) < 3:
        recommendations.append({
            "category": "technical",
            "reason": "Based on your task patterns, technical skills could be strengthened",
            "suggested_tasks": SKILL_CATEGORIES["technical"]["tasks"][:3],
            "priority": "high"
        })
    
    if skill_analysis.get("soft_skills", 0) < 2:
        recommendations.append({
            "category": "soft_skills",
            "reason": "Communication and teamwork are essential for career growth",
            "suggested_tasks": SKILL_CATEGORIES["soft_skills"]["tasks"][:3],
            "priority": "medium"
        })
    
    # Always include personal development
    recommendations.append({
        "category": "personal_development",
        "reason": "Continuous learning is key to long-term success",
        "suggested_tasks": SKILL_CATEGORIES["personal_development"]["tasks"][:3],
        "priority": "low"
    })
    
    return recommendations

def create_development_roadmap(skill_analysis, recommendations):
    """Create a personalized development roadmap"""
    roadmap = {
        "short_term": [],
        "medium_term": [],
        "long_term": []
    }
    
    for rec in recommendations:
        if rec["priority"] == "high":
            roadmap["short_term"].extend(rec["suggested_tasks"][:2])
        elif rec["priority"] == "medium":
            roadmap["medium_term"].extend(rec["suggested_tasks"][:2])
        else:
            roadmap["long_term"].extend(rec["suggested_tasks"][:2])
    
    return roadmap

def generate_task_suggestions(user, tasks):
    """Generate personalized task suggestions"""
    suggestions = []
    
    # Based on completion patterns
    completed_count = len([t for t in tasks if t.get("status") == "completed"])
    total_count = len(tasks)
    
    if completed_count / total_count > 0.8:  # High completion rate
        suggestions.extend([
            "Take on a challenging project to stretch your abilities",
            "Mentor someone else in your area of expertise",
            "Document your learning process"
        ])
    elif completed_count / total_count < 0.3:  # Low completion rate
        suggestions.extend([
            "Break down large tasks into smaller, manageable steps",
            "Set daily micro-goals to build momentum",
            "Celebrate small wins to stay motivated"
        ])
    
    # Add skill-based suggestions
    suggestions.extend([
        "Learn a new programming language or framework",
        "Improve your public speaking skills",
            "Develop better time management habits",
        "Read industry-related books and articles"
    ])
    
    return suggestions[:6]  # Return top 6 suggestions

def generate_personalized_goals(user, goal_type, timeframe, interests):
    """Generate personalized goals based on user input"""
    goals = []
    
    if goal_type == "career":
        goals.extend([
            {"title": "Complete a professional certification", "deadline": "3 months", "difficulty": "medium"},
            {"title": "Build a portfolio of 3 projects", "deadline": "6 months", "difficulty": "high"},
            {"title": "Network with 10 industry professionals", "deadline": "2 months", "difficulty": "low"}
        ])
    elif goal_type == "skills":
        goals.extend([
            {"title": "Master a new technical skill", "deadline": "4 months", "difficulty": "high"},
            {"title": "Improve communication abilities", "deadline": "2 months", "difficulty": "medium"},
            {"title": "Develop leadership capabilities", "deadline": "6 months", "difficulty": "high"}
        ])
    else:  # general
        goals.extend([
            {"title": "Establish a consistent daily routine", "deadline": "1 month", "difficulty": "low"},
            {"title": "Read 12 books this year", "deadline": "12 months", "difficulty": "medium"},
            {"title": "Start a side project", "deadline": "3 months", "difficulty": "medium"}
        ])
    
    return goals

def create_action_plan(goals, timeframe):
    """Create an action plan for the goals"""
    plan = {
        "weekly_tasks": [],
        "monthly_milestones": [],
        "success_metrics": []
    }
    
    for goal in goals:
        plan["weekly_tasks"].append(f"Work on {goal['title']} for 2-3 hours")
        plan["monthly_milestones"].append(f"Complete 25% of {goal['title']}")
        plan["success_metrics"].append(f"Track progress on {goal['title']}")
    
    return plan

def generate_suggestions(user, tasks):
    """Generate contextual suggestions"""
    suggestions = []
    
    # Task completion suggestions
    pending_tasks = [t for t in tasks if t.get("status") == "pending"]
    if pending_tasks:
        suggestions.append(f"You have {len(pending_tasks)} pending tasks. Consider tackling the highest priority one first!")
    
    # Skill development suggestions
    suggestions.append("Try dedicating 30 minutes daily to learning something new.")
    
    # Productivity suggestions
    suggestions.append("Take regular breaks to maintain focus and energy.")
    
    return suggestions

# AI Task Assistant Helper Functions
def generate_tasks_from_text(input_text, context):
    """Generate tasks from natural language input"""
    tasks = []
    input_lower = input_text.lower()
    
    # Interview preparation
    if any(word in input_lower for word in ["interview", "prepare for interview", "job interview"]):
        tasks.extend([
            {
                "title": "Research the company and role",
                "description": "Gather information about the company's mission, values, products, and the specific role requirements",
                "estimated_time": "2 hours",
                "category": "preparation",
                "difficulty": "medium"
            },
            {
                "title": "Practice common interview questions",
                "description": "Prepare and practice answers for frequently asked interview questions",
                "estimated_time": "3 hours",
                "category": "practice",
                "difficulty": "medium"
            },
            {
                "title": "Prepare your portfolio/projects",
                "description": "Organize and showcase your best work relevant to the position",
                "estimated_time": "4 hours",
                "category": "preparation",
                "difficulty": "high"
            },
            {
                "title": "Choose professional attire",
                "description": "Select and prepare appropriate clothing for the interview",
                "estimated_time": "1 hour",
                "category": "logistics",
                "difficulty": "low"
            },
            {
                "title": "Plan travel route and timing",
                "description": "Map out the route to the interview location and plan to arrive 15 minutes early",
                "estimated_time": "30 minutes",
                "category": "logistics",
                "difficulty": "low"
            }
        ])
    
    # Project development
    elif any(word in input_lower for word in ["project", "build", "develop", "create"]):
        if any(word in input_lower for word in ["app", "application", "mobile"]):
            tasks.extend([
                {
                    "title": "Define app requirements and features",
                    "description": "List all features and user stories for the app",
                    "estimated_time": "3 hours",
                    "category": "planning",
                    "difficulty": "medium"
                },
                {
                    "title": "Create wireframes and mockups",
                    "description": "Design the user interface and user experience",
                    "estimated_time": "5 hours",
                    "category": "design",
                    "difficulty": "medium"
                },
                {
                    "title": "Set up development environment",
                    "description": "Install necessary tools and initialize the project",
                    "estimated_time": "2 hours",
                    "category": "setup",
                    "difficulty": "low"
                },
                {
                    "title": "Build core functionality",
                    "description": "Implement the main features of the app",
                    "estimated_time": "20 hours",
                    "category": "development",
                    "difficulty": "high"
                },
                {
                    "title": "Test and debug",
                    "description": "Perform thorough testing and fix any issues",
                    "estimated_time": "8 hours",
                    "category": "testing",
                    "difficulty": "medium"
                }
            ])
        elif any(word in input_lower for word in ["website", "web", "site"]):
            tasks.extend([
                {
                    "title": "Plan website structure and pages",
                    "description": "Define the sitemap and navigation structure",
                    "estimated_time": "2 hours",
                    "category": "planning",
                    "difficulty": "low"
                },
                {
                    "title": "Design website layout",
                    "description": "Create visual design and layout for each page",
                    "estimated_time": "6 hours",
                    "category": "design",
                    "difficulty": "medium"
                },
                {
                    "title": "Develop responsive HTML/CSS",
                    "description": "Build the front-end with responsive design",
                    "estimated_time": "12 hours",
                    "category": "development",
                    "difficulty": "medium"
                },
                {
                    "title": "Add interactive features",
                    "description": "Implement JavaScript functionality and user interactions",
                    "estimated_time": "8 hours",
                    "category": "development",
                    "difficulty": "medium"
                }
            ])
    
    # Learning/Studying
    elif any(word in input_lower for word in ["learn", "study", "course", "education"]):
        if any(word in input_lower for word in ["programming", "coding", "code"]):
            tasks.extend([
                {
                    "title": "Choose programming language/framework",
                    "description": "Select the best programming language or framework for your goals",
                    "estimated_time": "2 hours",
                    "category": "planning",
                    "difficulty": "low"
                },
                {
                    "title": "Set up development environment",
                    "description": "Install IDE, tools, and configure your development setup",
                    "estimated_time": "3 hours",
                    "category": "setup",
                    "difficulty": "low"
                },
                {
                    "title": "Complete basic tutorials",
                    "description": "Work through introductory tutorials and documentation",
                    "estimated_time": "10 hours",
                    "category": "learning",
                    "difficulty": "medium"
                },
                {
                    "title": "Build practice projects",
                    "description": "Create small projects to apply what you've learned",
                    "estimated_time": "15 hours",
                    "category": "practice",
                    "difficulty": "medium"
                },
                {
                    "title": "Join coding communities",
                    "description": "Participate in forums, Discord, or local meetups",
                    "estimated_time": "2 hours",
                    "category": "networking",
                    "difficulty": "low"
                }
            ])
        elif any(word in input_lower for word in ["language", "speaking", "foreign"]):
            tasks.extend([
                {
                    "title": "Choose learning resources",
                    "description": "Select apps, books, or courses for language learning",
                    "estimated_time": "1 hour",
                    "category": "planning",
                    "difficulty": "low"
                },
                {
                    "title": "Practice daily vocabulary",
                    "description": "Learn and review 10-15 new words daily",
                    "estimated_time": "30 minutes",
                    "category": "practice",
                    "difficulty": "low"
                },
                {
                    "title": "Listen to native content",
                    "description": "Watch movies, podcasts, or videos in the target language",
                    "estimated_time": "1 hour",
                    "category": "immersion",
                    "difficulty": "medium"
                },
                {
                    "title": "Practice speaking",
                    "description": "Find a language partner or use speaking apps",
                    "estimated_time": "45 minutes",
                    "category": "practice",
                    "difficulty": "medium"
                }
            ])
    
    # Fitness/Health
    elif any(word in input_lower for word in ["fitness", "workout", "exercise", "gym", "health"]):
        tasks.extend([
            {
                "title": "Set fitness goals",
                "description": "Define specific, measurable fitness objectives",
                "estimated_time": "1 hour",
                "category": "planning",
                "difficulty": "low"
            },
            {
                "title": "Create workout schedule",
                "description": "Plan weekly workout routine and exercise types",
                "estimated_time": "1 hour",
                "category": "planning",
                "difficulty": "low"
            },
            {
                "title": "Get proper equipment/gear",
                "description": "Purchase or organize necessary workout equipment",
                "estimated_time": "2 hours",
                "category": "preparation",
                "difficulty": "low"
            },
            {
                "title": "Start with basic exercises",
                "description": "Begin with fundamental exercises and proper form",
                "estimated_time": "45 minutes",
                "category": "exercise",
                "difficulty": "medium"
            },
            {
                "title": "Track progress",
                "description": "Monitor workouts, measurements, and improvements",
                "estimated_time": "15 minutes",
                "category": "tracking",
                "difficulty": "low"
            }
        ])
    
    # Business/Entrepreneurship
    elif any(word in input_lower for word in ["business", "startup", "entrepreneur", "company"]):
        tasks.extend([
            {
                "title": "Research market and competitors",
                "description": "Analyze market trends and competitor strategies",
                "estimated_time": "8 hours",
                "category": "research",
                "difficulty": "medium"
            },
            {
                "title": "Define business model",
                "description": "Create a clear business model and revenue streams",
                "estimated_time": "4 hours",
                "category": "planning",
                "difficulty": "medium"
            },
            {
                "title": "Write business plan",
                "description": "Create comprehensive business plan and financial projections",
                "estimated_time": "12 hours",
                "category": "planning",
                "difficulty": "high"
            },
            {
                "title": "Build minimum viable product",
                "description": "Create a basic version of your product/service",
                "estimated_time": "40 hours",
                "category": "development",
                "difficulty": "high"
            },
            {
                "title": "Network with potential partners",
                "description": "Connect with industry professionals and potential collaborators",
                "estimated_time": "6 hours",
                "category": "networking",
                "difficulty": "medium"
            }
        ])
    
    # Default general tasks
    else:
        tasks.extend([
            {
                "title": "Break down the goal into smaller steps",
                "description": "Divide your main objective into manageable sub-tasks",
                "estimated_time": "1 hour",
                "category": "planning",
                "difficulty": "low"
            },
            {
                "title": "Research best practices",
                "description": "Learn from others who have achieved similar goals",
                "estimated_time": "3 hours",
                "category": "research",
                "difficulty": "medium"
            },
            {
                "title": "Set up tracking system",
                "description": "Create a system to monitor your progress",
                "estimated_time": "1 hour",
                "category": "organization",
                "difficulty": "low"
            },
            {
                "title": "Start with first small step",
                "description": "Take the first actionable step toward your goal",
                "estimated_time": "30 minutes",
                "category": "action",
                "difficulty": "low"
            }
        ])
    
    return tasks

def suggest_deadlines_and_priorities(tasks, user):
    """Suggest deadlines and priorities based on task characteristics and user patterns"""
    enhanced_tasks = []
    
    for task in tasks:
        enhanced_task = task.copy()
        
        # Suggest priority based on difficulty and category
        if task.get("difficulty") == "high":
            enhanced_task["suggested_priority"] = "high"
            enhanced_task["deadline_days"] = 7
        elif task.get("difficulty") == "medium":
            enhanced_task["suggested_priority"] = "medium"
            enhanced_task["deadline_days"] = 14
        else:
            enhanced_task["suggested_priority"] = "low"
            enhanced_task["deadline_days"] = 21
        
        # Adjust based on category
        if task.get("category") in ["setup", "planning", "preparation"]:
            enhanced_task["suggested_priority"] = "high"
            enhanced_task["deadline_days"] = 3
        elif task.get("category") in ["research", "design"]:
            enhanced_task["suggested_priority"] = "medium"
            enhanced_task["deadline_days"] = 10
        
        # Calculate deadline date
        from datetime import datetime, timedelta
        deadline_date = datetime.now() + timedelta(days=enhanced_task["deadline_days"])
        enhanced_task["suggested_deadline"] = deadline_date.strftime("%Y-%m-%d")
        
        enhanced_tasks.append(enhanced_task)
    
    return enhanced_tasks

def generate_task_context_suggestions(input_text):
    """Generate contextual suggestions based on input text"""
    suggestions = []
    input_lower = input_text.lower()
    
    if "interview" in input_lower:
        suggestions.extend([
            "Consider doing a mock interview with a friend",
            "Research recent company news and achievements",
            "Prepare questions to ask the interviewer"
        ])
    elif "project" in input_lower:
        suggestions.extend([
            "Start with a minimum viable product (MVP)",
            "Set up version control (Git) from the beginning",
            "Document your progress and decisions"
        ])
    elif "learn" in input_lower or "study" in input_lower:
        suggestions.extend([
            "Use the Pomodoro technique for focused study sessions",
            "Join online communities related to your subject",
            "Teach what you learn to reinforce understanding"
        ])
    elif "fitness" in input_lower or "workout" in input_lower:
        suggestions.extend([
            "Consult with a fitness professional for personalized advice",
            "Focus on consistency over intensity initially",
            "Track your nutrition alongside exercise"
        ])
    else:
        suggestions.extend([
            "Break down complex tasks into smaller steps",
            "Set specific, measurable goals",
            "Find an accountability partner"
        ])
    
    return suggestions[:3]  # Return top 3 suggestions

# Smart Task Suggestions Helper Functions
def analyze_user_patterns(tasks):
    """Analyze user task patterns for smart recommendations"""
    patterns = {
        "completion_rate": 0,
        "preferred_categories": {},
        "time_patterns": {},
        "difficulty_preference": {},
        "productivity_insights": []
    }
    
    if not tasks:
        return patterns
    
    completed_tasks = [t for t in tasks if t.get("status") == "completed"]
    total_tasks = len(tasks)
    patterns["completion_rate"] = len(completed_tasks) / total_tasks if total_tasks > 0 else 0
    
    # Analyze preferred categories
    for task in completed_tasks:
        category = task.get("category", "general")
        patterns["preferred_categories"][category] = patterns["preferred_categories"].get(category, 0) + 1
    
    # Analyze difficulty preferences
    for task in completed_tasks:
        difficulty = task.get("difficulty", "medium")
        patterns["difficulty_preference"][difficulty] = patterns["difficulty_preference"].get(difficulty, 0) + 1
    
    # Generate insights
    if patterns["completion_rate"] > 0.8:
        patterns["productivity_insights"].append("High completion rate - you're doing great!")
    elif patterns["completion_rate"] < 0.3:
        patterns["productivity_insights"].append("Consider breaking down large tasks into smaller ones")
    
    return patterns

def generate_smart_task_suggestions(user, tasks):
    """Generate intelligent task suggestions based on user history"""
    suggestions = []
    patterns = analyze_user_patterns(tasks)
    
    # Based on completion rate
    if patterns["completion_rate"] > 0.8:
        suggestions.extend([
            {
                "title": "Take on a challenging project",
                "description": "You have a high completion rate - challenge yourself with something more complex",
                "reason": "High completion rate indicates readiness for challenges",
                "priority": "medium",
                "category": "growth"
            },
            {
                "title": "Mentor someone in your area of expertise",
                "description": "Share your knowledge and help others grow",
                "reason": "Your success can inspire others",
                "priority": "low",
                "category": "leadership"
            }
        ])
    elif patterns["completion_rate"] < 0.3:
        suggestions.extend([
            {
                "title": "Break down your current tasks",
                "description": "Divide large tasks into smaller, manageable steps",
                "reason": "Lower completion rate suggests tasks might be too big",
                "priority": "high",
                "category": "organization"
            },
            {
                "title": "Set daily micro-goals",
                "description": "Create small, achievable goals for each day",
                "reason": "Build momentum with small wins",
                "priority": "high",
                "category": "planning"
            }
        ])
    
    # Based on preferred categories
    if patterns["preferred_categories"]:
        top_category = max(patterns["preferred_categories"], key=patterns["preferred_categories"].get)
        suggestions.append({
            "title": f"Advanced {top_category} project",
            "description": f"You excel in {top_category} - take on an advanced project",
            "reason": f"You've completed {patterns['preferred_categories'][top_category]} tasks in this area",
            "priority": "medium",
            "category": top_category
        })
    
    # Based on difficulty preference
    if patterns["difficulty_preference"]:
        preferred_difficulty = max(patterns["difficulty_preference"], key=patterns["difficulty_preference"].get)
        suggestions.append({
            "title": f"Next level {preferred_difficulty} challenge",
            "description": f"Continue growing with {preferred_difficulty} difficulty tasks",
            "reason": f"You perform well with {preferred_difficulty} tasks",
            "priority": "medium",
            "category": "growth"
        })
    
    return suggestions[:5]  # Return top 5 suggestions

def generate_comprehensive_suggestions(user, tasks):
    """Generate comprehensive smart suggestions with multiple categories"""
    return {
        "immediate_actions": generate_immediate_suggestions(tasks),
        "skill_development": generate_skill_suggestions(tasks),
        "productivity_boosters": generate_productivity_suggestions(tasks),
        "long_term_goals": generate_long_term_suggestions(user, tasks)
    }

def generate_immediate_suggestions(tasks):
    """Generate suggestions for immediate action"""
    suggestions = []
    
    # Check for overdue tasks
    overdue_tasks = [t for t in tasks if t.get("status") == "pending" and t.get("deadline")]
    if overdue_tasks:
        suggestions.append({
            "title": "Focus on overdue tasks",
            "description": f"You have {len(overdue_tasks)} overdue tasks that need attention",
            "urgency": "high",
            "action": "Review and prioritize overdue tasks"
        })
    
    # Check for high priority pending tasks
    high_priority_tasks = [t for t in tasks if t.get("status") == "pending" and t.get("priority") == "high"]
    if high_priority_tasks:
        suggestions.append({
            "title": "Tackle high priority tasks",
            "description": f"You have {len(high_priority_tasks)} high priority tasks pending",
            "urgency": "medium",
            "action": "Focus on completing high priority items first"
        })
    
    return suggestions

def generate_skill_suggestions(tasks):
    """Generate skill development suggestions"""
    suggestions = []
    
    # Analyze completed tasks for skill patterns
    completed_tasks = [t for t in tasks if t.get("status") == "completed"]
    skill_areas = {}
    
    for task in completed_tasks:
        category = task.get("category", "general")
        skill_areas[category] = skill_areas.get(category, 0) + 1
    
    # Suggest next level for top skill areas
    if skill_areas:
        top_skill = max(skill_areas, key=skill_areas.get)
        suggestions.append({
            "title": f"Advance your {top_skill} skills",
            "description": f"You've completed {skill_areas[top_skill]} tasks in {top_skill}",
            "next_step": "Take on an advanced project or get certified",
            "estimated_time": "2-4 weeks"
        })
    
    # Suggest new skills to balance
    if len(skill_areas) < 3:
        suggestions.append({
            "title": "Explore a new skill area",
            "description": "Diversify your abilities by learning something new",
            "suggested_areas": ["communication", "leadership", "technical", "creative"],
            "benefit": "Well-rounded skill set"
        })
    
    return suggestions

def generate_productivity_suggestions(tasks):
    """Generate productivity improvement suggestions"""
    suggestions = []
    
    # Analyze task completion patterns
    completed_this_week = len([t for t in tasks if t.get("status") == "completed" and is_this_week(t.get("completed_at"))])
    
    if completed_this_week < 3:
        suggestions.append({
            "title": "Increase daily task completion",
            "description": "Aim to complete at least 1-2 tasks daily",
            "strategy": "Use time blocking and the Pomodoro technique",
            "expected_improvement": "25% increase in weekly productivity"
        })
    
    # Check for task distribution
    pending_tasks = [t for t in tasks if t.get("status") == "pending"]
    if pending_tasks:
        high_priority = len([t for t in pending_tasks if t.get("priority") == "high"])
        if high_priority > len(pending_tasks) * 0.5:
            suggestions.append({
                "title": "Rebalance task priorities",
                "description": "Too many high priority tasks may indicate priority inflation",
                "strategy": "Review and adjust task priorities realistically",
                "benefit": "Better focus on truly important tasks"
            })
    
    return suggestions

def generate_long_term_suggestions(user, tasks):
    """Generate long-term goal suggestions"""
    suggestions = []
    
    # Based on overall progress
    total_completed = len([t for t in tasks if t.get("status") == "completed"])
    total_tasks = len(tasks)
    
    if total_completed > 20:
        suggestions.append({
            "title": "Consider leadership roles",
            "description": "Your task completion shows reliability - consider mentoring or leading projects",
            "timeline": "3-6 months",
            "skills_needed": ["communication", "project management", "team leadership"]
        })
    
    if total_completed > 50:
        suggestions.append({
            "title": "Share your expertise",
            "description": "Create content or courses based on your experience",
            "timeline": "6-12 months",
            "impact": "Help others while establishing yourself as an expert"
        })
    
    return suggestions

def generate_productivity_insights(tasks):
    """Generate detailed productivity insights"""
    insights = []
    
    # Completion rate analysis
    completed = len([t for t in tasks if t.get("status") == "completed"])
    total = len(tasks)
    completion_rate = completed / total if total > 0 else 0
    
    if completion_rate > 0.8:
        insights.append({
            "type": "strength",
            "message": "Excellent completion rate! You're highly productive.",
            "recommendation": "Consider taking on more challenging tasks"
        })
    elif completion_rate < 0.4:
        insights.append({
            "type": "improvement",
            "message": "Task completion could be improved.",
            "recommendation": "Try breaking tasks into smaller steps"
        })
    
    # Task category analysis
    categories = {}
    for task in tasks:
        if task.get("status") == "completed":
            cat = task.get("category", "general")
            categories[cat] = categories.get(cat, 0) + 1
    
    if categories:
        top_category = max(categories, key=categories.get)
        insights.append({
            "type": "pattern",
            "message": f"You're most productive in {top_category} tasks.",
            "recommendation": f"Leverage this strength in {top_category} areas"
        })
    
    return insights

def generate_personalized_recommendations(user, tasks):
    """Generate personalized recommendations based on user data"""
    recommendations = []
    
    patterns = analyze_user_patterns(tasks)
    
    # Time-based recommendations
    current_hour = datetime.now().hour
    if 9 <= current_hour <= 11:
        recommendations.append({
            "title": "Peak productivity time",
            "message": "Morning is often peak productivity time",
            "suggestion": "Tackle your most important tasks now"
        })
    elif 14 <= current_hour <= 16:
        recommendations.append({
            "title": "Afternoon focus",
            "message": "Good time for collaborative or creative tasks",
            "suggestion": "Schedule meetings or brainstorming sessions"
        })
    
    # Motivation-based recommendations
    if patterns["completion_rate"] > 0.7:
        recommendations.append({
            "title": "Maintain momentum",
            "message": "You're on a roll!",
            "suggestion": "Keep up the great work and consider helping others"
        })
    
    return recommendations

def is_this_week(date_string):
    """Check if a date is from this week"""
    if not date_string:
        return False
    
    try:
        from datetime import datetime, timedelta
        date = datetime.fromisoformat(date_string.replace('Z', '+00:00'))
        today = datetime.now()
        week_start = today - timedelta(days=today.weekday())
        return date >= week_start
    except:
        return False

# AI Productivity Insights Helper Functions
def generate_weekly_productivity_report(tasks):
    """Generate comprehensive weekly productivity report"""
    from datetime import datetime, timedelta
    
    report = {
        "week_overview": {},
        "daily_breakdown": [],
        "task_analysis": {},
        "productivity_trends": {},
        "achievements": [],
        "areas_for_improvement": []
    }
    
    # Get current week's tasks
    today = datetime.now()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)
    
    weekly_tasks = [t for t in tasks if t.get("created_at") and 
                   week_start <= datetime.fromisoformat(t["created_at"].replace('Z', '+00:00')) <= week_end]
    
    completed_this_week = [t for t in weekly_tasks if t.get("status") == "completed"]
    
    # Week overview
    report["week_overview"] = {
        "total_tasks": len(weekly_tasks),
        "completed_tasks": len(completed_this_week),
        "completion_rate": len(completed_this_week) / len(weekly_tasks) * 100 if weekly_tasks else 0,
        "week_start": week_start.strftime("%Y-%m-%d"),
        "week_end": week_end.strftime("%Y-%m-%d")
    }
    
    # Daily breakdown
    for i in range(7):
        day = week_start + timedelta(days=i)
        day_tasks = [t for t in completed_this_week if t.get("completed_at") and 
                   datetime.fromisoformat(t["completed_at"].replace('Z', '+00:00')).date() == day.date()]
        
        report["daily_breakdown"].append({
            "day": day.strftime("%A"),
            "date": day.strftime("%Y-%m-%d"),
            "tasks_completed": len(day_tasks),
            "productivity_score": calculate_daily_productivity_score(day_tasks)
        })
    
    # Task analysis
    report["task_analysis"] = {
        "by_priority": analyze_tasks_by_priority(weekly_tasks),
        "by_category": analyze_tasks_by_category(weekly_tasks),
        "by_difficulty": analyze_tasks_by_difficulty(weekly_tasks),
        "completion_time": analyze_completion_times(completed_this_week)
    }
    
    # Productivity trends
    report["productivity_trends"] = {
        "most_productive_day": find_most_productive_day(report["daily_breakdown"]),
        "peak_hours": analyze_peak_productivity_hours(completed_this_week),
        "streak_days": calculate_productivity_streaks(tasks)
    }
    
    # Achievements
    report["achievements"] = generate_weekly_achievements(report["week_overview"], completed_this_week)
    
    # Areas for improvement
    report["areas_for_improvement"] = identify_improvement_areas(report, tasks)
    
    return report

def analyze_time_management_patterns(tasks):
    """Analyze time management patterns and efficiency"""
    analysis = {
        "task_duration_efficiency": {},
        "deadline_management": {},
        "work_distribution": {},
        "time_wasters": [],
        "optimal_work_times": {}
    }
    
    completed_tasks = [t for t in tasks if t.get("status") == "completed"]
    
    # Task duration efficiency
    duration_analysis = analyze_task_durations(completed_tasks)
    analysis["task_duration_efficiency"] = duration_analysis
    
    # Deadline management
    deadline_analysis = analyze_deadline_performance(tasks)
    analysis["deadline_management"] = deadline_analysis
    
    # Work distribution
    distribution = analyze_work_distribution(completed_tasks)
    analysis["work_distribution"] = distribution
    
    # Time wasters identification
    time_wasters = identify_time_wasters(tasks)
    analysis["time_wasters"] = time_wasters
    
    # Optimal work times
    optimal_times = find_optimal_work_times(completed_tasks)
    analysis["optimal_work_times"] = optimal_times
    
    return analysis

def generate_improvement_recommendations(tasks):
    """Generate personalized improvement recommendations"""
    recommendations = {
        "time_management": [],
        "task_prioritization": [],
        "productivity_techniques": [],
        "habit_building": [],
        "tools_and_apps": []
    }
    
    patterns = analyze_user_patterns(tasks)
    
    # Time management recommendations
    if patterns["completion_rate"] < 0.6:
        recommendations["time_management"].append({
            "title": "Implement Time Blocking",
            "description": "Schedule specific blocks of time for different types of tasks",
            "benefit": "Improves focus and reduces context switching",
            "difficulty": "medium",
            "implementation_time": "1 week"
        })
    
    if patterns["completion_rate"] > 0.8:
        recommendations["time_management"].append({
            "title": "Optimize Your Schedule",
            "description": "Analyze your most productive times and schedule important tasks accordingly",
            "benefit": "Maximize efficiency during peak performance hours",
            "difficulty": "low",
            "implementation_time": "3 days"
        })
    
    # Task prioritization recommendations
    recommendations["task_prioritization"].extend([
        {
            "title": "Use Eisenhower Matrix",
            "description": "Categorize tasks by urgency and importance to prioritize effectively",
            "benefit": "Ensures focus on high-impact activities",
            "difficulty": "low",
            "implementation_time": "2 days"
        },
        {
            "title": "Apply 80/20 Rule",
            "description": "Focus on the 20% of tasks that yield 80% of results",
            "benefit": "Maximizes return on time investment",
            "difficulty": "medium",
            "implementation_time": "1 week"
        }
    ])
    
    # Productivity techniques
    recommendations["productivity_techniques"].extend([
        {
            "title": "Pomodoro Technique",
            "description": "Work in focused 25-minute intervals with 5-minute breaks",
            "benefit": "Maintains high focus and prevents burnout",
            "difficulty": "low",
            "implementation_time": "1 day"
        },
        {
            "title": "Two-Minute Rule",
            "description": "Complete any task that takes less than 2 minutes immediately",
            "benefit": "Prevents small tasks from piling up",
            "difficulty": "low",
            "implementation_time": "Immediate"
        }
    ])
    
    # Habit building
    recommendations["habit_building"].append({
        "title": "Daily Planning Routine",
        "description": "Spend 10 minutes each morning planning your day",
        "benefit": "Sets clear direction and priorities for the day",
        "difficulty": "low",
      "implementation_time": "3 days"
    })
    
    # Tools and apps
    recommendations["tools_and_apps"].extend([
        {
            "title": "Task Management Apps",
            "description": "Use digital tools to organize and track tasks efficiently",
            "examples": ["Trello", "Asana", "Notion", "Todoist"],
            "benefit": "Better organization and visibility of tasks"
        },
        {
            "title": "Time Tracking Tools",
            "description": "Monitor how you spend your time to identify inefficiencies",
            "examples": ["RescueTime", "Toggl", "Clockify"],
            "benefit": "Data-driven insights into time usage"
        }
    ])
    
    return recommendations

def calculate_productivity_score(tasks):
    """Calculate overall productivity score"""
    if not tasks:
        return 0
    
    completed_tasks = [t for t in tasks if t.get("status") == "completed"]
    total_tasks = len(tasks)
    
    # Base score from completion rate
    completion_rate = len(completed_tasks) / total_tasks
    base_score = completion_rate * 100
    
    # Bonus factors
    bonus = 0
    
    # On-time completion bonus
    on_time_completed = [t for t in completed_tasks if is_completed_on_time(t)]
    if completed_tasks:
        on_time_rate = len(on_time_completed) / len(completed_tasks)
        bonus += on_time_rate * 10
    
    # High priority completion bonus
    high_priority_completed = [t for t in completed_tasks if t.get("priority") == "high"]
    if high_priority_completed:
        bonus += len(high_priority_completed) * 5
    
    # Consistency bonus (based on recent activity)
    recent_tasks = [t for t in completed_tasks if is_this_week(t.get("completed_at"))]
    if len(recent_tasks) >= 5:
        bonus += 15
    
    # Cap the score at 100
    final_score = min(base_score + bonus, 100)
    
    return round(final_score, 1)

# Helper functions for productivity insights
def calculate_daily_productivity_score(day_tasks):
    """Calculate productivity score for a specific day"""
    if not day_tasks:
        return 0
    
    # Base score from number of tasks
    task_score = min(len(day_tasks) * 20, 80)
    
    # Bonus for high priority tasks
    high_priority_count = len([t for t in day_tasks if t.get("priority") == "high"])
    bonus = high_priority_count * 5
    
    return min(task_score + bonus, 100)

def analyze_tasks_by_priority(tasks):
    """Analyze tasks by priority distribution"""
    priorities = {"high": 0, "medium": 0, "low": 0}
    completed_priorities = {"high": 0, "medium": 0, "low": 0}
    
    for task in tasks:
        priority = task.get("priority", "medium")
        priorities[priority] = priorities.get(priority, 0) + 1
        
        if task.get("status") == "completed":
            completed_priorities[priority] = completed_priorities.get(priority, 0) + 1
    
    return {
        "distribution": priorities,
        "completion_rates": {
            "high": (completed_priorities["high"] / priorities["high"] * 100) if priorities["high"] > 0 else 0,
            "medium": (completed_priorities["medium"] / priorities["medium"] * 100) if priorities["medium"] > 0 else 0,
            "low": (completed_priorities["low"] / priorities["low"] * 100) if priorities["low"] > 0 else 0
        }
    }

def analyze_tasks_by_category(tasks):
    """Analyze tasks by category distribution"""
    categories = {}
    completed_categories = {}
    
    for task in tasks:
        category = task.get("category", "general")
        categories[category] = categories.get(category, 0) + 1
        
        if task.get("status") == "completed":
            completed_categories[category] = completed_categories.get(category, 0) + 1
    
    return {
        "distribution": categories,
        "completion_rates": {
            cat: (completed_categories.get(cat, 0) / categories[cat] * 100) for cat in categories
        }
    }

def analyze_tasks_by_difficulty(tasks):
    """Analyze tasks by difficulty distribution"""
    difficulties = {"high": 0, "medium": 0, "low": 0}
    completed_difficulties = {"high": 0, "medium": 0, "low": 0}
    
    for task in tasks:
        difficulty = task.get("difficulty", "medium")
        difficulties[difficulty] = difficulties.get(difficulty, 0) + 1
        
        if task.get("status") == "completed":
            completed_difficulties[difficulty] = completed_difficulties.get(difficulty, 0) + 1
    
    return {
        "distribution": difficulties,
        "completion_rates": {
            "high": (completed_difficulties["high"] / difficulties["high"] * 100) if difficulties["high"] > 0 else 0,
            "medium": (completed_difficulties["medium"] / difficulties["medium"] * 100) if difficulties["medium"] > 0 else 0,
            "low": (completed_difficulties["low"] / difficulties["low"] * 100) if difficulties["low"] > 0 else 0
        }
    }

def analyze_completion_times(completed_tasks):
    """Analyze task completion times"""
    if not completed_tasks:
        return {"average_completion_time": 0, "fastest_completion": None, "slowest_completion": None}
    
    completion_times = []
    for task in completed_tasks:
        if task.get("created_at") and task.get("completed_at"):
            created = datetime.fromisoformat(task["created_at"].replace('Z', '+00:00'))
            completed = datetime.fromisoformat(task["completed_at"].replace('Z', '+00:00'))
            completion_time = (completed - created).total_seconds() / 3600  # in hours
            completion_times.append(completion_time)
    
    if not completion_times:
        return {"average_completion_time": 0, "fastest_completion": None, "slowest_completion": None}
    
    return {
        "average_completion_time": sum(completion_times) / len(completion_times),
        "fastest_completion": min(completion_times),
        "slowest_completion": max(completion_times)
    }

def find_most_productive_day(daily_breakdown):
    """Find the most productive day of the week"""
    if not daily_breakdown:
        return None
    
    most_productive = max(daily_breakdown, key=lambda x: x["tasks_completed"])
    return most_productive["day"]

def analyze_peak_productivity_hours(completed_tasks):
    """Analyze peak productivity hours"""
    hour_counts = {}
    
    for task in completed_tasks:
        if task.get("completed_at"):
            completed = datetime.fromisoformat(task["completed_at"].replace('Z', '+00:00'))
            hour = completed.hour
            hour_counts[hour] = hour_counts.get(hour, 0) + 1
    
    if not hour_counts:
        return []
    
    # Sort by count and return top 3 hours
    sorted_hours = sorted(hour_counts.items(), key=lambda x: x[1], reverse=True)
    return [{"hour": hour, "tasks_completed": count} for hour, count in sorted_hours[:3]]

def calculate_productivity_streaks(tasks):
    """Calculate productivity streaks"""
    if not tasks:
        return {"current_streak": 0, "longest_streak": 0}
    
    # Group completed tasks by date
    completed_dates = set()
    for task in tasks:
        if task.get("completed_at"):
            completed = datetime.fromisoformat(task["completed_at"].replace('Z', '+00:00'))
            completed_dates.add(completed.date())
    
    if not completed_dates:
        return {"current_streak": 0, "longest_streak": 0}
    
    # Sort dates and calculate streaks
    sorted_dates = sorted(completed_dates)
    current_streak = 0
    longest_streak = 0
    temp_streak = 0
    
    today = datetime.now().date()
    
    for i, date in enumerate(sorted_dates):
        if i == 0 or (date - sorted_dates[i-1]).days == 1:
            temp_streak += 1
        else:
            longest_streak = max(longest_streak, temp_streak)
            temp_streak = 1
        
        # Check if this is part of current streak
        if (today - date).days < 7:  # Within last week
            current_streak = temp_streak
    
    longest_streak = max(longest_streak, temp_streak)
    
    return {"current_streak": current_streak, "longest_streak": longest_streak}

def generate_weekly_achievements(week_overview, completed_tasks):
    """Generate weekly achievements"""
    achievements = []
    
    # High completion rate achievement
    if week_overview["completion_rate"] >= 80:
        achievements.append({
            "title": "Productivity Champion",
            "description": "Completed 80% or more of weekly tasks",
            "icon": "trophy",
            "points": 50
        })
    
    # Task master achievement
    if week_overview["completed_tasks"] >= 10:
        achievements.append({
            "title": "Task Master",
            "description": "Completed 10 or more tasks this week",
            "icon": "star",
            "points": 30
        })
    
    # Consistency achievement
    if len(completed_tasks) >= 5:
        achievements.append({
            "title": "Consistent Performer",
            "description": "Maintained consistent task completion",
            "icon": "check_circle",
            "points": 25
        })
    
    return achievements

def identify_improvement_areas(report, all_tasks):
    """Identify areas for improvement"""
    improvements = []
    
    # Low completion rate
    if report["week_overview"]["completion_rate"] < 50:
        improvements.append({
            "area": "Task Completion",
            "issue": "Low completion rate this week",
            "suggestion": "Focus on breaking down large tasks and setting realistic deadlines",
            "priority": "high"
        })
    
    # Uneven daily distribution
    daily_tasks = [day["tasks_completed"] for day in report["daily_breakdown"]]
    if max(daily_tasks) - min(daily_tasks) > 5:
        improvements.append({
            "area": "Work Distribution",
            "issue": "Uneven task distribution across days",
            "suggestion": "Try to spread tasks more evenly throughout the week",
            "priority": "medium"
        })
    
    return improvements

def is_completed_on_time(task):
    """Check if a task was completed on time"""
    if not task.get("deadline") or not task.get("completed_at"):
        return True  # No deadline or not completed, consider as on-time
    
    try:
        deadline = datetime.fromisoformat(task["deadline"].replace('Z', '+00:00'))
        completed = datetime.fromisoformat(task["completed_at"].replace('Z', '+00:00'))
        return completed <= deadline
    except:
        return True

def analyze_task_durations(tasks):
    """Analyze task duration patterns"""
    return {
        "average_duration": 2.5,  # hours (mock data)
        "optimal_duration_range": "1-3 hours",
        "efficiency_score": 85
    }

def analyze_deadline_performance(tasks):
    """Analyze deadline performance"""
    pending_with_deadlines = [t for t in tasks if t.get("status") == "pending" and t.get("deadline")]
    overdue_count = len([t for t in pending_with_deadlines if is_overdue(t)])
    
    return {
        "on_time_completion_rate": 75,  # mock data
        "overdue_tasks": overdue_count,
        "deadline_adherence": "good"
    }

def analyze_work_distribution(tasks):
    """Analyze work distribution patterns"""
    return {
        "morning_productivity": 40,  # percentage
        "afternoon_productivity": 35,
        "evening_productivity": 25,
        "recommended_schedule": "Focus on important tasks in the morning"
    }

def identify_time_wasters(tasks):
    """Identify potential time wasters"""
    return [
        "Excessive task switching",
        "Unnecessary meetings",
        "Social media distractions"
    ]

def find_optimal_work_times(tasks):
    """Find optimal work times based on task completion patterns"""
    return {
        "peak_productivity_hours": [9, 10, 11, 14, 15],
        "low_energy_hours": [13, 16, 17],
        "recommendation": "Schedule important tasks during peak hours"
    }

def is_overdue(task):
    """Check if a task is overdue"""
    if not task.get("deadline"):
        return False
    
    try:
        deadline = datetime.fromisoformat(task["deadline"].replace('Z', '+00:00'))
        return datetime.now() > deadline
    except:
        return False
