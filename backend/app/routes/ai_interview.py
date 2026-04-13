from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import json
import random
from ..models.user import User
from ..models.task import Task

ai_interview_bp = Blueprint("ai_interview", __name__)

# Interview sessions storage (in production, use database)
INTERVIEW_SESSIONS = {}
INTERVIEW_QUESTIONS = {}
INTERVIEW_RESULTS = {}
INTERVIEW_ANALYTICS = {}

# Comprehensive interview question database
INTERVIEW_QUESTION_BANK = {
    "technical": {
        "frontend": [
            {
                "id": "tech_fe_1",
                "question": "Explain the difference between controlled and uncontrolled components in React.",
                "category": "React Fundamentals",
                "difficulty": "intermediate",
                "expected_keywords": ["useState", "state management", "value", "onChange"],
                "sample_answer": "Controlled components are form elements whose values are controlled by React state, while uncontrolled components maintain their own internal state."
            },
            {
                "id": "tech_fe_2",
                "question": "What is the Virtual DOM and how does it work?",
                "category": "React Performance",
                "difficulty": "intermediate",
                "expected_keywords": ["virtual DOM", "diffing algorithm", "reconciliation", "performance"],
                "sample_answer": "The Virtual DOM is a JavaScript representation of the real DOM. React uses it to optimize updates by comparing changes and only updating what has changed."
            },
            {
                "id": "tech_fe_3",
                "question": "Describe the React component lifecycle methods.",
                "category": "React Lifecycle",
                "difficulty": "intermediate",
                "expected_keywords": ["componentDidMount", "componentDidUpdate", "componentWillUnmount", "hooks"],
                "sample_answer": "React components have lifecycle methods like componentDidMount for setup, componentDidUpdate for updates, and componentWillUnmount for cleanup."
            }
        ],
        "backend": [
            {
                "id": "tech_be_1",
                "question": "Explain REST API principles and HTTP methods.",
                "category": "API Design",
                "difficulty": "intermediate",
                "expected_keywords": ["REST", "HTTP", "GET", "POST", "PUT", "DELETE", "stateless"],
                "sample_answer": "REST is an architectural style that uses HTTP methods like GET, POST, PUT, DELETE to perform CRUD operations on resources."
            },
            {
                "id": "tech_be_2",
                "question": "What is database indexing and why is it important?",
                "category": "Database",
                "difficulty": "intermediate",
                "expected_keywords": ["index", "performance", "query optimization", "B-tree"],
                "sample_answer": "Database indexing improves query performance by creating data structures that allow faster data retrieval."
            },
            {
                "id": "tech_be_3",
                "question": "Explain the concept of database transactions and ACID properties.",
                "category": "Database",
                "difficulty": "advanced",
                "expected_keywords": ["ACID", "atomicity", "consistency", "isolation", "durability"],
                "sample_answer": "ACID properties ensure database transactions are Atomic, Consistent, Isolated, and Durable, maintaining data integrity."
            }
        ],
        "general": [
            {
                "id": "tech_gen_1",
                "question": "How do you approach debugging a complex issue?",
                "category": "Problem Solving",
                "difficulty": "intermediate",
                "expected_keywords": ["debugging", "breakpoints", "logs", "systematic", "reproduction"],
                "sample_answer": "I approach debugging systematically by reproducing the issue, using breakpoints and logs, and isolating the problem area."
            },
            {
                "id": "tech_gen_2",
                "question": "Describe your experience with version control systems.",
                "category": "Tools",
                "difficulty": "intermediate",
                "expected_keywords": ["Git", "version control", "branches", "merge", "pull requests"],
                "sample_answer": "I have extensive experience with Git, including branching strategies, merge conflicts, and collaborative workflows."
            }
        ]
    },
    "behavioral": {
        "leadership": [
            {
                "id": "beh_ldr_1",
                "question": "Tell me about a time you had to lead a team through a challenging project.",
                "category": "Leadership",
                "difficulty": "intermediate",
                "expected_keywords": ["leadership", "team", "challenge", "communication", "motivation"],
                "sample_answer": "I led a team through a challenging project by maintaining clear communication, setting realistic goals, and keeping the team motivated."
            },
            {
                "id": "beh_ldr_2",
                "question": "How do you handle conflicts within your team?",
                "category": "Conflict Resolution",
                "difficulty": "intermediate",
                "expected_keywords": ["conflict", "resolution", "communication", "mediation", "compromise"],
                "sample_answer": "I handle conflicts by facilitating open communication, understanding different perspectives, and finding mutually beneficial solutions."
            }
        ],
        "teamwork": [
            {
                "id": "beh_tw_1",
                "question": "Describe a situation where you had to collaborate with difficult team members.",
                "category": "Collaboration",
                "difficulty": "intermediate",
                "expected_keywords": ["collaboration", "difficult", "communication", "patience", "understanding"],
                "sample_answer": "I collaborated with difficult team members by maintaining professionalism, focusing on common goals, and finding common ground."
            },
            {
                "id": "beh_tw_2",
                "question": "How do you contribute to a positive team environment?",
                "category": "Team Culture",
                "difficulty": "intermediate",
                "expected_keywords": ["positive", "team", "environment", "support", "communication"],
                "sample_answer": "I contribute to a positive team environment by being supportive, maintaining open communication, and celebrating team successes."
            }
        ],
        "problem_solving": [
            {
                "id": "beh_ps_1",
                "question": "Tell me about a complex problem you solved recently.",
                "category": "Problem Solving",
                "difficulty": "intermediate",
                "expected_keywords": ["problem", "solution", "complex", "analysis", "implementation"],
                "sample_answer": "I solved a complex problem by breaking it down into smaller parts, analyzing each component, and implementing a systematic solution."
            },
            {
                "id": "beh_ps_2",
                "question": "How do you approach learning new technologies?",
                "category": "Learning",
                "difficulty": "intermediate",
                "expected_keywords": ["learning", "technologies", "curiosity", "practice", "documentation"],
                "sample_answer": "I approach learning new technologies by reading documentation, practicing with small projects, and seeking mentorship."
            }
        ]
    },
    "situational": [
        {
            "id": "sit_1",
            "question": "You're working on a tight deadline and your teammate is not contributing. What do you do?",
            "category": "Team Management",
            "difficulty": "intermediate",
            "expected_keywords": ["deadline", "teammate", "communication", "escalation", "solution"],
            "sample_answer": "I would first communicate with the teammate to understand the issue, then work together to find a solution, and escalate if necessary."
        },
        {
            "id": "sit_2",
            "question": "You discover a critical bug in production. How do you handle it?",
            "category": "Crisis Management",
            "difficulty": "advanced",
            "expected_keywords": ["bug", "production", "urgent", "fix", "communication"],
            "sample_answer": "I would immediately assess the impact, communicate with stakeholders, implement a quick fix, and plan a permanent solution."
        },
        {
            "id": "sit_3",
            "question": "Your manager asks you to implement a feature you disagree with. What do you do?",
            "category": "Professional Judgment",
            "difficulty": "intermediate",
            "expected_keywords": ["disagree", "manager", "communication", "alternatives", "compromise"],
            "sample_answer": "I would respectfully explain my concerns, suggest alternatives, and ultimately implement the best solution for the business."
        }
    ]
}

@ai_interview_bp.route("/ai-interview/start", methods=["POST"])
@jwt_required()
def start_interview():
    """Start a new AI interview session"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        interview_type = data.get("type", "mixed")  # technical, behavioral, situational, mixed
        difficulty = data.get("difficulty", "intermediate")  # easy, intermediate, advanced
        duration = data.get("duration", 30)  # minutes
        focus_area = data.get("focus_area", "general")  # frontend, backend, general
        
        # Create interview session
        session_id = f"interview_{len(INTERVIEW_SESSIONS) + 1}"
        session = {
            "id": session_id,
            "user_id": user_id,
            "type": interview_type,
            "difficulty": difficulty,
            "duration": duration,
            "focus_area": focus_area,
            "status": "active",
            "started_at": datetime.utcnow().isoformat(),
            "questions_asked": [],
            "answers_given": [],
            "current_question_index": 0,
            "evaluation": {
                "technical_score": 0,
                "behavioral_score": 0,
                "communication_score": 0,
                "overall_score": 0
            }
        }
        
        # Select questions for the interview
        questions = select_interview_questions(interview_type, difficulty, focus_area, duration)
        session["questions"] = questions
        session["total_questions"] = len(questions)
        
        INTERVIEW_SESSIONS[session_id] = session
        
        return jsonify({
            "success": True,
            "session_id": session_id,
            "first_question": questions[0] if questions else None,
            "total_questions": len(questions)
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ai_interview_bp.route("/ai-interview/<session_id>/next-question", methods=["GET"])
@jwt_required()
def get_next_question(session_id):
    """Get the next question in the interview"""
    user_id = get_jwt_identity()
    
    try:
        session = INTERVIEW_SESSIONS.get(session_id)
        if not session or session["user_id"] != user_id:
            return jsonify({"error": "Session not found"}), 404
        
        if session["status"] != "active":
            return jsonify({"error": "Session not active"}), 400
        
        current_index = session["current_question_index"]
        questions = session["questions"]
        
        if current_index >= len(questions):
            return jsonify({"message": "Interview completed"}), 200
        
        question = questions[current_index]
        
        return jsonify({
            "question": question,
            "question_number": current_index + 1,
            "total_questions": len(questions),
            "time_remaining": calculate_time_remaining(session)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ai_interview_bp.route("/ai-interview/<session_id>/submit-answer", methods=["POST"])
@jwt_required()
def submit_answer(session_id):
    """Submit an answer and get AI evaluation"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        session = INTERVIEW_SESSIONS.get(session_id)
        if not session or session["user_id"] != user_id:
            return jsonify({"error": "Session not found"}), 404
        
        if session["status"] != "active":
            return jsonify({"error": "Session not active"}), 400
        
        answer = data.get("answer", "")
        question_id = data.get("question_id")
        time_taken = data.get("time_taken", 0)
        
        # Get current question
        current_question = session["questions"][session["current_question_index"]]
        
        # Evaluate answer
        evaluation = evaluate_answer(current_question, answer, time_taken)
        
        # Store answer and evaluation
        answer_data = {
            "question_id": current_question["id"],
            "question": current_question["question"],
            "answer": answer,
            "time_taken": time_taken,
            "evaluation": evaluation,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        session["answers_given"].append(answer_data)
        session["questions_asked"].append(current_question["id"])
        session["current_question_index"] += 1
        
        # Update scores
        update_session_scores(session, evaluation)
        
        # Check if interview is complete
        if session["current_question_index"] >= len(session["questions"]):
            session["status"] = "completed"
            session["completed_at"] = datetime.utcnow().isoformat()
            
            # Generate final evaluation
            final_evaluation = generate_final_evaluation(session)
            session["final_evaluation"] = final_evaluation
            
            # Store results
            INTERVIEW_RESULTS[session_id] = final_evaluation
        
        # Get next question if available
        next_question = None
        if session["current_question_index"] < len(session["questions"]):
            next_question = session["questions"][session["current_question_index"]]
        
        return jsonify({
            "success": True,
            "evaluation": evaluation,
            "next_question": next_question,
            "interview_complete": session["status"] == "completed",
            "current_scores": session["evaluation"],
            "final_evaluation": session.get("final_evaluation")
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ai_interview_bp.route("/ai-interview/<session_id>/complete", methods=["POST"])
@jwt_required()
def complete_interview(session_id):
    """Complete the interview and get final results"""
    user_id = get_jwt_identity()
    
    try:
        session = INTERVIEW_SESSIONS.get(session_id)
        if not session or session["user_id"] != user_id:
            return jsonify({"error": "Session not found"}), 404
        
        if session["status"] != "active":
            return jsonify({"error": "Session not active"}), 400
        
        # Mark as completed
        session["status"] = "completed"
        session["completed_at"] = datetime.utcnow().isoformat()
        
        # Generate final evaluation
        final_evaluation = generate_final_evaluation(session)
        session["final_evaluation"] = final_evaluation
        
        # Store results
        INTERVIEW_RESULTS[session_id] = final_evaluation
        
        return jsonify({
            "success": True,
            "final_evaluation": final_evaluation,
            "session_summary": {
                "total_questions": len(session["questions"]),
                "questions_answered": len(session["answers_given"]),
                "duration": calculate_session_duration(session),
                "overall_score": final_evaluation["overall_score"]
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ai_interview_bp.route("/ai-interview/<session_id>/results", methods=["GET"])
@jwt_required()
def get_interview_results(session_id):
    """Get interview results and detailed analysis"""
    user_id = get_jwt_identity()
    
    try:
        session = INTERVIEW_SESSIONS.get(session_id)
        if not session or session["user_id"] != user_id:
            return jsonify({"error": "Session not found"}), 404
        
        if session["status"] != "completed":
            return jsonify({"error": "Interview not completed"}), 400
        
        results = INTERVIEW_RESULTS.get(session_id)
        if not results:
            return jsonify({"error": "Results not found"}), 404
        
        return jsonify({
            "session": session,
            "results": results,
            "detailed_analysis": generate_detailed_analysis(session, results)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ai_interview_bp.route("/ai-interview/history", methods=["GET"])
@jwt_required()
def get_interview_history():
    """Get user's interview history"""
    user_id = get_jwt_identity()
    
    try:
        # Get user's sessions
        user_sessions = [
            session for session in INTERVIEW_SESSIONS.values()
            if session["user_id"] == user_id and session["status"] == "completed"
        ]
        
        # Sort by completion date
        user_sessions.sort(key=lambda x: x.get("completed_at", ""), reverse=True)
        
        history = []
        for session in user_sessions:
            results = INTERVIEW_RESULTS.get(session["id"])
            history.append({
                "session_id": session["id"],
                "type": session["type"],
                "difficulty": session["difficulty"],
                "completed_at": session["completed_at"],
                "overall_score": results["overall_score"] if results else 0,
                "total_questions": len(session["questions"]),
                "questions_answered": len(session["answers_given"])
            })
        
        return jsonify({
            "history": history,
            "total_sessions": len(history)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ai_interview_bp.route("/ai-interview/analytics", methods=["GET"])
@jwt_required()
def get_interview_analytics():
    """Get interview performance analytics"""
    user_id = get_jwt_identity()
    
    try:
        # Get user's completed sessions
        user_sessions = [
            session for session in INTERVIEW_SESSIONS.values()
            if session["user_id"] == user_id and session["status"] == "completed"
        ]
        
        if not user_sessions:
            return jsonify({
                "total_sessions": 0,
                "average_score": 0,
                "improvement_trend": 0,
                "category_performance": {},
                "recommendations": []
            }), 200
        
        # Calculate analytics
        scores = []
        category_scores = {
            "technical": [],
            "behavioral": [],
            "situational": []
        }
        
        for session in user_sessions:
            results = INTERVIEW_RESULTS.get(session["id"])
            if results:
                scores.append(results["overall_score"])
                
                # Category performance
                for category, score in results.get("category_scores", {}).items():
                    if category in category_scores:
                        category_scores[category].append(score)
        
        average_score = sum(scores) / len(scores) if scores else 0
        
        # Calculate improvement trend
        improvement_trend = calculate_improvement_trend(scores)
        
        # Calculate category averages
        category_performance = {}
        for category, cat_scores in category_scores.items():
            if cat_scores:
                category_performance[category] = sum(cat_scores) / len(cat_scores)
        
        # Generate recommendations
        recommendations = generate_recommendations(category_performance, user_sessions)
        
        return jsonify({
            "total_sessions": len(user_sessions),
            "average_score": average_score,
            "improvement_trend": improvement_trend,
            "category_performance": category_performance,
            "recommendations": recommendations,
            "recent_sessions": user_sessions[:5]
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ai_interview_bp.route("/ai-interview/practice-questions", methods=["GET"])
@jwt_required()
def get_practice_questions():
    """Get practice questions for improvement"""
    user_id = get_jwt_identity()
    
    try:
        category = request.args.get("category", "all")
        difficulty = request.args.get("difficulty", "intermediate")
        limit = int(request.args.get("limit", 10))
        
        questions = []
        
        if category == "all":
            for cat_questions in INTERVIEW_QUESTION_BANK.values():
                for subcat_questions in cat_questions.values():
                    questions.extend(subcat_questions)
        else:
            if category in INTERVIEW_QUESTION_BANK:
                for subcat_questions in INTERVIEW_QUESTION_BANK[category].values():
                    questions.extend(subcat_questions)
        
        # Filter by difficulty
        if difficulty != "all":
            questions = [q for q in questions if q.get("difficulty") == difficulty]
        
        # Random selection
        random.shuffle(questions)
        questions = questions[:limit]
        
        return jsonify({
            "questions": questions,
            "total": len(questions)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Helper functions
def select_interview_questions(interview_type, difficulty, focus_area, duration):
    """Select appropriate questions for the interview"""
    questions = []
    
    if interview_type == "mixed":
        # Mix of all types
        all_questions = []
        for category in INTERVIEW_QUESTION_BANK.values():
            for subcat_questions in category.values():
                all_questions.extend(subcat_questions)
        
        # Filter by difficulty
        if difficulty != "all":
            all_questions = [q for q in all_questions if q.get("difficulty") == difficulty]
        
        # Filter by focus area
        if focus_area != "general":
            if focus_area in INTERVIEW_QUESTION_BANK.get("technical", {}):
                all_questions = [q for q in all_questions if q.get("category", "").lower() == focus_area.lower()]
        
        # Calculate number of questions based on duration
        num_questions = min(duration // 5, 10)  # 5 minutes per question, max 10 questions
        random.shuffle(all_questions)
        questions = all_questions[:num_questions]
    
    else:
        # Specific type
        if interview_type in INTERVIEW_QUESTION_BANK:
            for subcat_questions in INTERVIEW_QUESTION_BANK[interview_type].values():
                questions.extend(subcat_questions)
        
        # Filter by difficulty
        if difficulty != "all":
            questions = [q for q in questions if q.get("difficulty") == difficulty]
        
        # Limit questions
        num_questions = min(duration // 5, 10)
        random.shuffle(questions)
        questions = questions[:num_questions]
    
    return questions

def evaluate_answer(question, answer, time_taken):
    """Evaluate answer using AI analysis"""
    try:
        # Simulated AI evaluation (in production, use actual AI service)
        score = calculate_answer_score(question, answer, time_taken)
        
        evaluation = {
            "score": score,
            "feedback": generate_feedback(question, answer, score),
            "strengths": identify_strengths(question, answer),
            "improvements": identify_improvements(question, answer),
            "keywords_matched": check_keywords(question, answer),
            "time_appropriate": time_taken <= 300,  # 5 minutes max
            "clarity_score": calculate_clarity_score(answer),
            "completeness_score": calculate_completeness_score(question, answer)
        }
        
        return evaluation
        
    except Exception as e:
        return {
            "score": 50,
            "feedback": f"Evaluation error: {str(e)}",
            "strengths": [],
            "improvements": ["Please provide more detailed answers"],
            "keywords_matched": [],
            "time_appropriate": True,
            "clarity_score": 50,
            "completeness_score": 50
        }

def calculate_answer_score(question, answer, time_taken):
    """Calculate score for the answer"""
    base_score = 50
    
    # Keyword matching
    keywords = question.get("expected_keywords", [])
    matched_keywords = sum(1 for keyword in keywords if keyword.lower() in answer.lower())
    keyword_score = (matched_keywords / len(keywords)) * 30 if keywords else 0
    
    # Length and completeness
    length_score = min(len(answer.split()) / 50, 1) * 10  # Up to 10 points for length
    
    # Time appropriateness
    time_score = 10 if time_taken <= 300 else max(0, 10 - (time_taken - 300) / 60)
    
    total_score = base_score + keyword_score + length_score + time_score
    return min(100, max(0, total_score))

def generate_feedback(question, answer, score):
    """Generate feedback for the answer"""
    if score >= 80:
        return "Excellent answer! You demonstrated strong understanding and provided comprehensive details."
    elif score >= 60:
        return "Good answer with solid understanding. Consider adding more specific examples or details."
    elif score >= 40:
        return "Decent attempt, but your answer could be more detailed and specific. Try to include relevant examples."
    else:
        return "Your answer needs improvement. Focus on addressing the key aspects of the question and providing specific examples."

def identify_strengths(question, answer):
    """Identify strengths in the answer"""
    strengths = []
    
    if len(answer.split()) >= 30:
        strengths.append("Comprehensive response")
    
    if any(word in answer.lower() for word in ["example", "for instance", "specifically"]):
        strengths.append("Provided examples")
    
    if len(answer.split()) >= 50:
        strengths.append("Detailed explanation")
    
    return strengths

def identify_improvements(question, answer):
    """Identify areas for improvement"""
    improvements = []
    
    if len(answer.split()) < 20:
        improvements.append("Add more detail to your answer")
    
    if not any(word in answer.lower() for word in ["example", "for instance", "specifically"]):
        improvements.append("Include specific examples")
    
    if question.get("expected_keywords"):
        keywords = question["expected_keywords"]
        matched = sum(1 for keyword in keywords if keyword.lower() in answer.lower())
        if matched < len(keywords) / 2:
            improvements.append("Address key concepts mentioned in the question")
    
    return improvements

def check_keywords(question, answer):
    """Check if expected keywords are present in the answer"""
    keywords = question.get("expected_keywords", [])
    matched = []
    
    for keyword in keywords:
        if keyword.lower() in answer.lower():
            matched.append(keyword)
    
    return matched

def calculate_clarity_score(answer):
    """Calculate clarity score based on answer structure"""
    sentences = answer.split('.')
    if len(sentences) <= 1:
        return 40
    elif len(sentences) <= 3:
        return 70
    else:
        return 90

def calculate_completeness_score(question, answer):
    """Calculate completeness score"""
    base_score = 50
    
    # Check for key elements
    if "how" in question.lower() and any(word in answer.lower() for word in ["step", "process", "method"]):
        base_score += 25
    
    if "why" in question.lower() and any(word in answer.lower() for word in ["because", "reason", "due to"]):
        base_score += 25
    
    return min(100, base_score)

def update_session_scores(session, evaluation):
    """Update session scores with new evaluation"""
    current_scores = session["evaluation"]
    
    # Simple averaging (in production, use weighted scoring)
    current_scores["technical_score"] = (current_scores["technical_score"] + evaluation["score"]) / 2
    current_scores["behavioral_score"] = (current_scores["behavioral_score"] + evaluation["score"]) / 2
    current_scores["communication_score"] = (current_scores["communication_score"] + evaluation["clarity_score"]) / 2
    current_scores["overall_score"] = (current_scores["technical_score"] + current_scores["behavioral_score"] + current_scores["communication_score"]) / 3

def generate_final_evaluation(session):
    """Generate final evaluation for the interview"""
    answers = session["answers_given"]
    
    if not answers:
        return {
            "overall_score": 0,
            "category_scores": {},
            "strengths": [],
            "improvements": [],
            "recommendations": [],
            "next_steps": []
        }
    
    # Calculate category scores
    category_scores = {}
    total_score = 0
    
    for answer in answers:
        evaluation = answer["evaluation"]
        score = evaluation["score"]
        total_score += score
    
    # Overall score
    overall_score = total_score / len(answers) if answers else 0
    
    # Generate insights
    strengths = []
    improvements = []
    
    # Analyze patterns
    high_scoring_answers = [a for a in answers if a["evaluation"]["score"] >= 70]
    low_scoring_answers = [a for a in answers if a["evaluation"]["score"] < 50]
    
    if len(high_scoring_answers) > len(answers) / 2:
        strengths.append("Strong overall performance")
    
    if low_scoring_answers:
        improvements.append("Focus on providing more detailed answers")
    
    # Generate recommendations
    recommendations = []
    if overall_score < 60:
        recommendations.append("Practice with more technical questions")
        recommendations.append("Work on structuring your answers")
    elif overall_score < 80:
        recommendations.append("Focus on providing specific examples")
        recommendations.append("Practice timing your answers")
    else:
        recommendations.append("Excellent performance! Consider advanced topics")
    
    return {
        "overall_score": round(overall_score, 1),
        "category_scores": category_scores,
        "strengths": strengths,
        "improvements": improvements,
        "recommendations": recommendations,
        "next_steps": generate_next_steps(overall_score)
    }

def generate_next_steps(score):
    """Generate next steps based on score"""
    if score < 50:
        return [
            "Review fundamental concepts",
            "Practice with basic questions",
            "Focus on answer structure"
        ]
    elif score < 70:
        return [
            "Practice intermediate questions",
            "Work on providing examples",
            "Improve timing"
        ]
    else:
        return [
            "Try advanced questions",
            "Practice complex scenarios",
            "Prepare for follow-up questions"
        ]

def calculate_time_remaining(session):
    """Calculate remaining time for the interview"""
    started_at = datetime.fromisoformat(session["started_at"])
    duration_minutes = session["duration"]
    elapsed = (datetime.utcnow() - started_at).total_seconds() / 60
    remaining = max(0, duration_minutes - elapsed)
    return remaining

def calculate_session_duration(session):
    """Calculate total session duration"""
    started_at = datetime.fromisoformat(session["started_at"])
    completed_at = datetime.fromisoformat(session["completed_at"])
    return (completed_at - started_at).total_seconds() / 60

def generate_detailed_analysis(session, results):
    """Generate detailed analysis of the interview"""
    analysis = {
        "performance_trends": [],
        "category_analysis": {},
        "time_analysis": {},
        "improvement_areas": [],
        "strength_areas": []
    }
    
    # Analyze performance trends
    answers = session["answers_given"]
    for i, answer in enumerate(answers):
        analysis["performance_trends"].append({
            "question_number": i + 1,
            "score": answer["evaluation"]["score"],
            "time_taken": answer["time_taken"]
        })
    
    # Time analysis
    total_time = sum(a["time_taken"] for a in answers)
    avg_time = total_time / len(answers) if answers else 0
    
    analysis["time_analysis"] = {
        "total_time": total_time,
        "average_time_per_question": avg_time,
        "time_efficiency": "Good" if avg_time <= 180 else "Needs Improvement"
    }
    
    return analysis

def calculate_improvement_trend(scores):
    """Calculate improvement trend over time"""
    if len(scores) < 2:
        return 0
    
    # Simple linear regression
    n = len(scores)
    x = list(range(n))
    y = scores
    
    sum_x = sum(x)
    sum_y = sum(y)
    sum_xy = sum(x[i] * y[i] for i in range(n))
    sum_x2 = sum(x[i] ** 2 for i in range(n))
    
    slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x ** 2)
    
    return round(slope * 10, 2)  # Scale to meaningful range

def generate_recommendations(category_performance, sessions):
    """Generate personalized recommendations"""
    recommendations = []
    
    # Find weak areas
    weak_areas = [cat for cat, score in category_performance.items() if score < 60]
    
    if "technical" in weak_areas:
        recommendations.append("Focus on technical concepts and problem-solving")
    
    if "behavioral" in weak_areas:
        recommendations.append("Practice behavioral questions with STAR method")
    
    if "situational" in weak_areas:
        recommendations.append("Work on situational judgment and decision-making")
    
    # General recommendations
    if len(sessions) < 3:
        recommendations.append("Practice more interviews to improve consistency")
    
    return recommendations
