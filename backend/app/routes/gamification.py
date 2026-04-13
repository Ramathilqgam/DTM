from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import random
from ..models.user import User
from ..models.task import Task

gamification_bp = Blueprint("gamification", __name__)

# Achievement definitions
ACHIEVEMENTS = {
    "first_task": {
        "id": "first_task",
        "name": "Task Beginner",
        "description": "Complete your first task",
        "icon": "target",
        "points": 10,
        "category": "milestone"
    },
    "task_master": {
        "id": "task_master",
        "name": "Task Master",
        "description": "Complete 50 tasks",
        "icon": "trophy",
        "points": 100,
        "category": "milestone"
    },
    "productivity_champion": {
        "id": "productivity_champion",
        "name": "Productivity Champion",
        "description": "Maintain 90% task completion rate for a month",
        "icon": "flash_on",
        "points": 200,
        "category": "performance"
    },
    "skill_learner": {
        "id": "skill_learner",
        "name": "Skill Learner",
        "description": "Complete 5 skill development tasks",
        "icon": "school",
        "points": 75,
        "category": "learning"
    },
    "team_player": {
        "id": "team_player",
        "name": "Team Player",
        "description": "Help 10 team members with their tasks",
        "icon": "handshake",
        "points": 150,
        "category": "collaboration"
    },
    "streak_warrior": {
        "id": "streak_warrior",
        "name": "Streak Warrior",
        "description": "Complete tasks for 7 consecutive days",
        "icon": "local_fire_department",
        "points": 125,
        "category": "consistency"
    },
    "early_bird": {
        "id": "early_bird",
        "name": "Early Bird",
        "description": "Complete a task before 9 AM",
        "icon": "wb_sunny",
        "points": 25,
        "category": "time"
    },
    "night_owl": {
        "id": "night_owl",
        "name": "Night Owl",
        "description": "Complete a task after 10 PM",
        "icon": "nights_stay",
        "points": 25,
        "category": "time"
    },
    "speed_demon": {
        "id": "speed_demon",
        "name": "Speed Demon",
        "description": "Complete 5 tasks in one day",
        "icon": "speed",
        "points": 80,
        "category": "performance"
    },
    "perfectionist": {
        "id": "perfectionist",
        "name": "Perfectionist",
        "description": "Complete 10 tasks without any revisions",
        "icon": "auto_awesome",
        "points": 90,
        "category": "quality"
    },
    "daily_champion": {
        "id": "daily_champion",
        "name": "Daily Champion",
        "description": "Complete all daily challenges for 7 days",
        "icon": "emoji_events",
        "points": 150,
        "category": "challenges"
    },
    "mission_master": {
        "id": "mission_master",
        "name": "Mission Master",
        "description": "Complete 10 weekly missions",
        "icon": "military_tech",
        "points": 200,
        "category": "missions"
    },
    "challenge_seeker": {
        "id": "challenge_seeker",
        "name": "Challenge Seeker",
        "description": "Complete 50 daily challenges",
        "icon": "explore",
        "points": 175,
        "category": "challenges"
    }
}

# Daily Challenges definitions
DAILY_CHALLENGES = [
    {
        "id": "complete_3_tasks",
        "name": "Task Triplet",
        "description": "Complete 3 tasks today",
        "icon": "check_circle",
        "points": 15,
        "difficulty": "easy",
        "category": "completion",
        "type": "count",
        "target": 3,
        "metric": "tasks_completed"
    },
    {
        "id": "complete_priority_task",
        "name": "Priority Focus",
        "description": "Complete 1 high priority task",
        "icon": "priority_high",
        "points": 20,
        "difficulty": "medium",
        "category": "priority",
        "type": "specific",
        "target": 1,
        "metric": "high_priority_completed"
    },
    {
        "id": "complete_5_tasks",
        "name": "Productivity Power",
        "description": "Complete 5 tasks today",
        "icon": "workspace_premium",
        "points": 30,
        "difficulty": "medium",
        "category": "completion",
        "type": "count",
        "target": 5,
        "metric": "tasks_completed"
    },
    {
        "id": "early_bird_special",
        "name": "Early Bird Special",
        "description": "Complete a task before 9 AM",
        "icon": "wb_sunny",
        "points": 25,
        "difficulty": "medium",
        "category": "time",
        "type": "time_based",
        "target": 1,
        "metric": "tasks_before_9am"
    },
    {
        "id": "skill_development",
        "name": "Skill Builder",
        "description": "Complete 2 skill development tasks",
        "icon": "school",
        "points": 35,
        "difficulty": "medium",
        "category": "learning",
        "type": "category",
        "target": 2,
        "metric": "skill_tasks_completed"
    },
    {
        "id": "deadline_crusher",
        "name": "Deadline Crusher",
        "description": "Complete 2 tasks due today",
        "icon": "event_available",
        "points": 40,
        "difficulty": "hard",
        "category": "deadline",
        "type": "deadline",
        "target": 2,
        "metric": "tasks_due_today_completed"
    },
    {
        "id": "variety_master",
        "name": "Variety Master",
        "description": "Complete tasks from 3 different categories",
        "icon": "category",
        "points": 45,
        "difficulty": "hard",
        "category": "variety",
        "type": "diversity",
        "target": 3,
        "metric": "categories_completed"
    },
    {
        "id": "speed_demon_daily",
        "name": "Speed Demon",
        "description": "Complete 7 tasks today",
        "icon": "speed",
        "points": 50,
        "difficulty": "hard",
        "category": "speed",
        "type": "count",
        "target": 7,
        "metric": "tasks_completed"
    }
]

# Weekly Missions definitions
WEEKLY_MISSIONS = [
    {
        "id": "weekly_completion_master",
        "name": "Weekly Completion Master",
        "description": "Complete 20 tasks this week",
        "icon": "assignment_turned_in",
        "points": 100,
        "difficulty": "medium",
        "category": "completion",
        "type": "weekly_count",
        "target": 20,
        "metric": "weekly_tasks_completed"
    },
    {
        "id": "priority_week",
        "name": "Priority Week",
        "description": "Complete 8 high priority tasks this week",
        "icon": "priority_high",
        "points": 120,
        "difficulty": "hard",
        "category": "priority",
        "type": "weekly_specific",
        "target": 8,
        "metric": "weekly_high_priority_completed"
    },
    {
        "id": "consistency_warrior",
        "name": "Consistency Warrior",
        "description": "Complete at least 1 task every day this week",
        "icon": "local_fire_department",
        "points": 150,
        "difficulty": "hard",
        "category": "consistency",
        "type": "daily_streak",
        "target": 7,
        "metric": "daily_completion_streak"
    },
    {
        "id": "skill_week",
        "name": "Skill Development Week",
        "description": "Complete 10 skill development tasks this week",
        "icon": "school",
        "points": 130,
        "difficulty": "medium",
        "category": "learning",
        "type": "weekly_category",
        "target": 10,
        "metric": "weekly_skill_tasks_completed"
    },
    {
        "id": "deadline_week",
        "name": "Deadline Week",
        "description": "Complete all tasks due this week",
        "icon": "event_available",
        "points": 140,
        "difficulty": "hard",
        "category": "deadline",
        "type": "weekly_deadline",
        "target": 0,  # All tasks due this week
        "metric": "weekly_deadline_completion"
    },
    {
        "id": "variety_explorer",
        "name": "Variety Explorer",
        "description": "Complete tasks from 5 different categories this week",
        "icon": "category",
        "points": 110,
        "difficulty": "medium",
        "category": "variety",
        "type": "weekly_diversity",
        "target": 5,
        "metric": "weekly_categories_completed"
    },
    {
        "id": "productivity_week",
        "name": "Productivity Week",
        "description": "Maintain 80% daily completion rate this week",
        "icon": "trending_up",
        "points": 160,
        "difficulty": "hard",
        "category": "performance",
        "type": "weekly_rate",
        "target": 80,
        "metric": "weekly_completion_rate"
    }
]

# Challenge and Mission rewards
REWARD_TYPES = {
    "points": {"name": "Points", "icon": "stars"},
    "badge": {"name": "Badge", "icon": "military_tech"},
    "title": {"name": "Title", "icon": "workspace_premium"},
    "avatar": {"name": "Avatar", "icon": "face"},
    "theme": {"name": "Theme", "icon": "palette"}
}

# Special rewards for completing challenges and missions
SPECIAL_REWARDS = {
    "daily_streak_7": {"type": "title", "value": "Week Warrior", "points": 50},
    "daily_streak_30": {"type": "badge", "value": "Monthly Master", "points": 200},
    "mission_master_10": {"type": "avatar", "value": "Elite Avatar", "points": 300},
    "challenge_master_50": {"type": "theme", "value": "Premium Theme", "points": 250}
}

# Skill Tree System
SKILL_CATEGORIES = {
    "productivity": {
        "name": "Productivity Master",
        "icon": "speed",
        "description": "Complete tasks efficiently and maintain high productivity",
        "color": "#4CAF50",
        "skills": [
            {
                "id": "time_management",
                "name": "Time Management",
                "description": "Complete tasks on time consistently",
                "max_level": 5,
                "xp_per_level": [100, 250, 500, 1000, 2000],
                "requirements": [],
                "benefits": [
                    "+5% task completion speed",
                    "+10% task completion speed",
                    "+15% task completion speed",
                    "+25% task completion speed",
                    "+50% task completion speed"
                ]
            },
            {
                "id": "focus_master",
                "name": "Focus Master",
                "description": "Maintain focus on high-priority tasks",
                "max_level": 5,
                "xp_per_level": [150, 300, 600, 1200, 2400],
                "requirements": ["time_management:2"],
                "benefits": [
                    "+10% priority task points",
                    "+20% priority task points",
                    "+30% priority task points",
                    "+50% priority task points",
                    "+100% priority task points"
                ]
            },
            {
                "id": "efficiency_expert",
                "name": "Efficiency Expert",
                "description": "Complete tasks with optimal resource usage",
                "max_level": 3,
                "xp_per_level": [500, 1000, 2000],
                "requirements": ["time_management:3", "focus_master:2"],
                "benefits": [
                    "+15% daily challenge bonus",
                    "+25% daily challenge bonus",
                    "+50% daily challenge bonus"
                ]
            }
        ]
    },
    "consistency": {
        "name": "Consistency Champion",
        "icon": "local_fire_department",
        "description": "Maintain regular task completion habits",
        "color": "#FF9800",
        "skills": [
            {
                "id": "daily_habit",
                "name": "Daily Habit",
                "description": "Complete tasks every day",
                "max_level": 5,
                "xp_per_level": [80, 200, 400, 800, 1600],
                "requirements": [],
                "benefits": [
                    "+5% streak bonus points",
                    "+10% streak bonus points",
                    "+15% streak bonus points",
                    "+25% streak bonus points",
                    "+40% streak bonus points"
                ]
            },
            {
                "id": "week_warrior",
                "name": "Week Warrior",
                "description": "Complete all weekly missions consistently",
                "max_level": 3,
                "xp_per_level": [300, 750, 1500],
                "requirements": ["daily_habit:3"],
                "benefits": [
                    "+20% weekly mission points",
                    "+35% weekly mission points",
                    "+60% weekly mission points"
                ]
            },
            {
                "id": "marathon_runner",
                "name": "Marathon Runner",
                "description": "Maintain long-term consistency",
                "max_level": 3,
                "xp_per_level": [600, 1200, 2400],
                "requirements": ["daily_habit:4", "week_warrior:2"],
                "benefits": [
                    "+30% all challenge points",
                    "+50% all challenge points",
                    "+100% all challenge points"
                ]
            }
        ]
    },
    "learning": {
        "name": "Learning Expert",
        "icon": "school",
        "description": "Develop new skills through task-based learning",
        "color": "#2196F3",
        "skills": [
            {
                "id": "skill_development",
                "name": "Skill Development",
                "description": "Complete skill-building tasks",
                "max_level": 5,
                "xp_per_level": [120, 300, 600, 1200, 2400],
                "requirements": [],
                "benefits": [
                    "+10% skill task points",
                    "+20% skill task points",
                    "+30% skill task points",
                    "+45% skill task points",
                    "+75% skill task points"
                ]
            },
            {
                "id": "quick_learner",
                "name": "Quick Learner",
                "description": "Learn new skills rapidly",
                "max_level": 3,
                "xp_per_level": [400, 1000, 2000],
                "requirements": ["skill_development:3"],
                "benefits": [
                    "+25% learning speed",
                    "+50% learning speed",
                    "+100% learning speed"
                ]
            },
            {
                "id": "knowledge_master",
                "name": "Knowledge Master",
                "description": "Master multiple skill areas",
                "max_level": 3,
                "xp_per_level": [800, 1600, 3200],
                "requirements": ["skill_development:4", "quick_learner:2"],
                "benefits": [
                    "Unlock advanced skill categories",
                    "Unlock expert skill categories",
                    "Unlock master skill categories"
                ]
            }
        ]
    },
    "collaboration": {
        "name": "Team Collaborator",
        "icon": "groups",
        "description": "Excel in team-based tasks and collaboration",
        "color": "#9C27B0",
        "skills": [
            {
                "id": "team_player",
                "name": "Team Player",
                "description": "Participate in team tasks",
                "max_level": 5,
                "xp_per_level": [100, 250, 500, 1000, 2000],
                "requirements": [],
                "benefits": [
                    "+10% team task points",
                    "+20% team task points",
                    "+30% team task points",
                    "+45% team task points",
                    "+75% team task points"
                ]
            },
            {
                "id": "mentor",
                "name": "Mentor",
                "description": "Help others complete tasks",
                "max_level": 3,
                "xp_per_level": [300, 750, 1500],
                "requirements": ["team_player:3"],
                "benefits": [
                    "+50% mentor bonus points",
                    "+100% mentor bonus points",
                    "+200% mentor bonus points"
                ]
            },
            {
                "id": "leader",
                "name": "Leader",
                "description": "Lead team projects successfully",
                "max_level": 3,
                "xp_per_level": [600, 1200, 2400],
                "requirements": ["team_player:4", "mentor:2"],
                "benefits": [
                    "+25% leadership bonus",
                    "+50% leadership bonus",
                    "+100% leadership bonus"
                ]
            }
        ]
    },
    "quality": {
        "name": "Quality Expert",
        "icon": "verified",
        "description": "Maintain high quality in task completion",
        "color": "#F44336",
        "skills": [
            {
                "id": "perfectionist",
                "name": "Perfectionist",
                "description": "Complete tasks without revisions",
                "max_level": 5,
                "xp_per_level": [150, 375, 750, 1500, 3000],
                "requirements": [],
                "benefits": [
                    "+15% quality bonus points",
                    "+30% quality bonus points",
                    "+45% quality bonus points",
                    "+75% quality bonus points",
                    "+125% quality bonus points"
                ]
            },
            {
                "id": "detail_oriented",
                "name": "Detail Oriented",
                "description": "Pay attention to task details",
                "max_level": 3,
                "xp_per_level": [500, 1250, 2500],
                "requirements": ["perfectionist:3"],
                "benefits": [
                    "+20% detail bonus",
                    "+40% detail bonus",
                    "+80% detail bonus"
                ]
            },
            {
                "id": "excellence_master",
                "name": "Excellence Master",
                "description": "Achieve excellence in all tasks",
                "max_level": 3,
                "xp_per_level": [1000, 2000, 4000],
                "requirements": ["perfectionist:4", "detail_oriented:2"],
                "benefits": [
                    "+50% excellence multiplier",
                    "+100% excellence multiplier",
                    "+200% excellence multiplier"
                ]
            }
        ]
    }
}

# XP calculation rules
XP_RULES = {
    "task_completion": {
        "base": 10,
        "priority_multipliers": {
            "low": 0.8,
            "medium": 1.0,
            "high": 1.5
        },
        "difficulty_multipliers": {
            "low": 0.7,
            "medium": 1.0,
            "high": 1.3
        },
        "category_multipliers": {
            "learning": 1.2,
            "collaboration": 1.1,
            "general": 1.0
        }
    },
    "challenge_completion": {
        "base_multiplier": 1.5,
        "difficulty_multipliers": {
            "easy": 1.0,
            "medium": 1.3,
            "hard": 1.8
        }
    },
    "mission_completion": {
        "base_multiplier": 2.0,
        "difficulty_multipliers": {
            "easy": 1.0,
            "medium": 1.4,
            "hard": 2.0
        }
    },
    "streak_bonuses": {
        "daily": {
            "3_days": 1.1,
            "7_days": 1.25,
            "14_days": 1.5,
            "30_days": 2.0
        },
        "weekly": {
            "2_weeks": 1.15,
            "4_weeks": 1.35,
            "8_weeks": 1.75,
            "12_weeks": 2.5
        }
    }
}

# Level definitions
LEVELS = [
    {"level": 1, "name": "Beginner", "min_points": 0, "icon": "🌱"},
    {"level": 2, "name": "Novice", "min_points": 50, "icon": "🌿"},
    {"level": 3, "name": "Intermediate", "min_points": 150, "icon": "🌳"},
    {"level": 4, "name": "Advanced", "min_points": 300, "icon": "🌲"},
    {"level": 5, "name": "Expert", "min_points": 600, "icon": "🌳"},
    {"level": 6, "name": "Master", "min_points": 1000, "icon": "🌴"},
    {"level": 7, "name": "Legend", "min_points": 1500, "icon": "🌵"},
    {"level": 8, "name": "Mythic", "min_points": 2500, "icon": "🌶"}
]

# Mock user progress data
user_progress = {}

@gamification_bp.route("/achievements", methods=["GET"])
@jwt_required()
def get_achievements():
    """Get user's achievements"""
    user_id = get_jwt_identity()
    
    # Mock user achievements (in real app, this would come from database)
    unlocked_achievements = [
        {
            "achievement_id": "first_task",
            "unlocked_at": "2024-01-10T10:30:00Z",
            "progress": 100
        },
        {
            "achievement_id": "task_master",
            "unlocked_at": "2024-01-12T15:45:00Z",
            "progress": 100
        },
        {
            "achievement_id": "skill_learner",
            "unlocked_at": "2024-01-14T09:20:00Z",
            "progress": 100
        }
    ]
    
    # Get achievement details
    achievements_data = []
    for unlocked in unlocked_achievements:
        achievement = ACHIEVEMENTS.get(unlocked["achievement_id"])
        if achievement:
            achievements_data.append({
                **achievement,
                "unlocked_at": unlocked["unlocked_at"],
                "progress": unlocked["progress"]
            })
    
    # Get locked achievements with progress
    locked_achievements = []
    for achievement_id, achievement in ACHIEVEMENTS.items():
        if achievement_id not in [a["achievement_id"] for a in unlocked_achievements]:
            # Calculate mock progress
            progress = random.randint(0, 80) if achievement_id != "first_task" else 100
            locked_achievements.append({
                **achievement,
                "progress": progress,
                "locked": True
            })
    
    return jsonify({
        "unlocked": achievements_data,
        "locked": locked_achievements
    })

@gamification_bp.route("/leaderboard", methods=["GET"])
@jwt_required()
def get_leaderboard():
    """Get weekly leaderboard"""
    user_id = get_jwt_identity()
    
    # Mock leaderboard data with weekly points
    leaderboard_data = [
        {
            "user": {
                "id": 1,
                "name": "Alex Chen",
                "avatar": "AC",
                "level": 5,
                "level_name": "Expert"
            },
            "total_points": 1250,
            "weekly_points": 320,
            "tasks_completed": 45,
            "streak": 12
        },
        {
            "user": {
                "id": 2,
                "name": "Sarah Johnson",
                "avatar": "SJ",
                "level": 4,
                "level_name": "Advanced"
            },
            "total_points": 980,
            "weekly_points": 285,
            "tasks_completed": 38,
            "streak": 8
        },
        {
            "user": {
                "id": 3,
                "name": "Mike Williams",
                "avatar": "MW",
                "level": 4,
                "level_name": "Advanced"
            },
            "total_points": 890,
            "weekly_points": 240,
            "tasks_completed": 32,
            "streak": 6
        },
        {
            "user": {
                "id": user_id,
                "name": "You",
                "avatar": "ME",
                "level": 3,
                "level_name": "Intermediate"
            },
            "total_points": 420,
            "weekly_points": 85,
            "tasks_completed": 28,
            "streak": 5
        },
        {
            "user": {
                "id": 5,
                "name": "Emma Davis",
                "avatar": "ED",
                "level": 3,
                "level_name": "Intermediate"
            },
            "total_points": 380,
            "weekly_points": 75,
            "tasks_completed": 25,
            "streak": 4
        },
        {
            "user": {
                "id": 6,
                "name": "James Wilson",
                "avatar": "JW",
                "level": 2,
                "level_name": "Novice"
            },
            "total_points": 290,
            "weekly_points": 60,
            "tasks_completed": 18,
            "streak": 3
        },
        {
            "user": {
                "id": 7,
                "name": "Lisa Anderson",
                "avatar": "LA",
                "level": 2,
                "level_name": "Novice"
            },
            "total_points": 210,
            "weekly_points": 45,
            "tasks_completed": 15,
            "streak": 2
        },
        {
            "user": {
                "id": 8,
                "name": "Tom Martinez",
                "avatar": "TM",
                "level": 1,
                "level_name": "Beginner"
            },
            "total_points": 150,
            "weekly_points": 30,
            "tasks_completed": 12,
            "streak": 1
        }
    ]
    
    # Find user's rank
    your_rank = next((i + 1 for i, entry in enumerate(leaderboard_data) if entry["user"]["id"] == user_id), 4)
    
    return jsonify({
        "leaderboard": leaderboard_data,
        "your_rank": your_rank,
        "total_users": len(leaderboard_data)
    }), 200

@gamification_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_gamification_profile():
    """Get user's gamification profile"""
    user_id = get_jwt_identity()
    
    # Mock user profile data
    profile = {
        "user": {
            "id": user_id,
            "name": "You",
            "avatar": "ME",
            "level": 3,
            "level_name": "Intermediate",
            "current_points": 420,
            "total_points": 420,
            "level_progress": 40,  # Percentage to next level
            "next_level": {
                "level": 4,
                "name": "Advanced",
                "min_points": 300,
                "points_needed": 300 - 420,  # Negative means already passed
                "icon": "🌲"
            }
        },
        "stats": {
            "tasks_completed": 28,
            "total_tasks": 35,
            "completion_rate": 80,
            "current_streak": 5,
            "longest_streak": 12,
            "achievements_unlocked": 5,
            "total_achievements": len(ACHIEVEMENTS),
            "points_this_week": 85,
            "points_this_month": 320,
            "favorite_category": "milestone"
        },
        "badges": [
            {
                "id": "task_master",
                "name": "Task Master",
                "icon": "🏆",
                "earned_at": "2024-01-12T15:45:00Z"
            },
            {
                "id": "skill_learner",
                "name": "Skill Learner", 
                "icon": "📚",
                "earned_at": "2024-01-14T09:20:00Z"
            }
        ]
    }
    
    return jsonify(profile), 200

@gamification_bp.route("/rewards", methods=["GET"])
@jwt_required()
def get_rewards():
    """Get available rewards"""
    user_id = get_jwt_identity()
    
    # Mock rewards catalog
    rewards = [
        {
            "id": "reward1",
            "name": "Extra Day Off",
            "description": "Take an extra day off with pay",
            "cost": 500,
            "category": "benefit",
            "icon": "🏖️",
            "available": True,
            "claimed": False
        },
        {
            "id": "reward2",
            "name": "Lunch with CEO",
            "description": "Have lunch with the company CEO",
            "cost": 1000,
            "category": "experience",
            "icon": "🍽",
            "available": True,
            "claimed": False
        },
        {
            "id": "reward3",
            "name": "Premium Course Access",
            "description": "Free access to any premium online course",
            "cost": 300,
            "category": "learning",
            "icon": "🎓",
            "available": True,
            "claimed": False
        },
        {
            "id": "reward4",
            "name": "Team Lunch",
            "description": "Free lunch for your entire team",
            "cost": 750,
            "category": "team",
            "icon": "🍕",
            "available": True,
            "claimed": False
        },
        {
            "id": "reward5",
            "name": "Home Office Setup",
            "description": "Budget for home office equipment",
            "cost": 1500,
            "category": "equipment",
            "icon": "💻",
            "available": True,
            "claimed": False
        }
    ]
    
    # Get user's current points
    user_points = 420  # Mock user points
    
    # Mark rewards that user can afford
    for reward in rewards:
        reward["can_afford"] = user_points >= reward["cost"]
    
    return jsonify({
        "rewards": rewards,
        "user_points": user_points,
        "total_available": len([r for r in rewards if r["available"]])
    }), 200

@gamification_bp.route("/claim-reward", methods=["POST"])
@jwt_required()
def claim_reward():
    """Claim a reward"""
    user_id = get_jwt_identity()
    
    data = request.get_json()
    reward_id = data.get("reward_id")
    
    if not reward_id:
        return jsonify({"error": "Reward ID is required"}), 400
    
    # Mock reward claiming logic
    user_points = 420
    reward_cost = 300  # Mock cost
    
    if user_points < reward_cost:
        return jsonify({"error": "Insufficient points"}), 400
    
    return jsonify({
        "message": "Reward claimed successfully!",
        "reward_id": reward_id,
        "points_deducted": reward_cost,
        "remaining_points": user_points - reward_cost
    }), 200

# Helper functions for Daily Challenges and Weekly Missions
def calculate_challenge_progress(challenge, tasks):
    """Calculate progress for a daily challenge"""
    today = datetime.now().date()
    today_tasks = [t for t in tasks if t.get("created_at") and 
                   datetime.fromisoformat(t["created_at"].replace('Z', '+00:00')).date() == today]
    
    completed_today = [t for t in today_tasks if t.get("status") == "completed"]
    
    if challenge["metric"] == "tasks_completed":
        return len(completed_today)
    elif challenge["metric"] == "high_priority_completed":
        return len([t for t in completed_today if t.get("priority") == "high"])
    elif challenge["metric"] == "tasks_before_9am":
        return len([t for t in completed_today if t.get("completed_at") and 
                   datetime.fromisoformat(t["completed_at"].replace('Z', '+00:00')).hour < 9])
    elif challenge["metric"] == "skill_tasks_completed":
        return len([t for t in completed_today if t.get("category") == "learning"])
    elif challenge["metric"] == "tasks_due_today_completed":
        return len([t for t in completed_today if t.get("deadline") and 
                   datetime.fromisoformat(t["deadline"].replace('Z', '+00:00')).date() == today])
    elif challenge["metric"] == "categories_completed":
        categories = set(t.get("category", "general") for t in completed_today)
        return len(categories)
    else:
        return 0

def calculate_mission_progress(mission, tasks):
    """Calculate progress for a weekly mission"""
    today = datetime.now()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)
    
    # Get tasks from this week
    week_tasks = [t for t in tasks if t.get("created_at") and 
                  week_start.date() <= datetime.fromisoformat(t["created_at"].replace('Z', '+00:00')).date() <= week_end.date()]
    
    completed_week = [t for t in week_tasks if t.get("status") == "completed"]
    
    if mission["metric"] == "weekly_tasks_completed":
        return len(completed_week)
    elif mission["metric"] == "weekly_high_priority_completed":
        return len([t for t in completed_week if t.get("priority") == "high"])
    elif mission["metric"] == "daily_completion_streak":
        # Calculate days with at least one completed task
        completed_days = set()
        for task in completed_week:
            if task.get("completed_at"):
                completed_date = datetime.fromisoformat(task["completed_at"].replace('Z', '+00:00')).date()
                completed_days.add(completed_date)
        return len(completed_days)
    elif mission["metric"] == "weekly_skill_tasks_completed":
        return len([t for t in completed_week if t.get("category") == "learning"])
    elif mission["metric"] == "weekly_deadline_completion":
        # Check if all tasks due this week are completed
        due_week_tasks = [t for t in week_tasks if t.get("deadline") and 
                         week_start.date() <= datetime.fromisoformat(t["deadline"].replace('Z', '+00:00')).date() <= week_end.date()]
        if not due_week_tasks:
            return 100  # No tasks due this week
        completed_due = len([t for t in due_week_tasks if t.get("status") == "completed"])
        return int((completed_due / len(due_week_tasks)) * 100)
    elif mission["metric"] == "weekly_categories_completed":
        categories = set(t.get("category", "general") for t in completed_week)
        return len(categories)
    elif mission["metric"] == "weekly_completion_rate":
        if not week_tasks:
            return 0
        return int((len(completed_week) / len(week_tasks)) * 100)
    else:
        return 0

def calculate_daily_streak_bonus(user_id):
    """Calculate bonus points for daily challenge streak"""
    # Mock implementation - in real app, would check database
    return 25  # Bonus points for maintaining streak

def calculate_weekly_completion_bonus(missions):
    """Calculate bonus points for completing all weekly missions"""
    completed_all = all(m["completed"] for m in missions)
    return 50 if completed_all else 0

def check_challenge_milestones(user_id, challenge_id):
    """Check if user has reached any challenge milestones"""
    milestones = []
    
    # Mock milestone checking
    # In real implementation, would check user's challenge history
    
    return milestones

def check_mission_milestones(user_id, mission_id):
    """Check if user has reached any mission milestones"""
    milestones = []
    
    # Mock milestone checking
    # In real implementation, would check user's mission history
    
    return milestones

# XP and Skill Tree Helper Functions
def get_user_skills(user_id):
    """Get user's current skill levels and XP (mock implementation)"""
    # In real implementation, would fetch from database
    return {
        "total_xp": 2450,
        "skill_points": 5,
        "time_management": 2,
        "time_management_xp": 150,
        "focus_master": 1,
        "focus_master_xp": 75,
        "daily_habit": 3,
        "daily_habit_xp": 200,
        "skill_development": 2,
        "skill_development_xp": 180,
        "team_player": 1,
        "team_player_xp": 50,
        "perfectionist": 1,
        "perfectionist_xp": 100
    }

def find_skill_by_id(skill_id):
    """Find skill by ID across all categories"""
    for category_data in SKILL_CATEGORIES.values():
        for skill in category_data["skills"]:
            if skill["id"] == skill_id:
                return skill
    return None

def check_skill_requirements(skill, user_skills):
    """Check if user meets skill requirements"""
    for requirement in skill["requirements"]:
        req_skill_id, req_level = requirement.split(":")
        req_level = int(req_level)
        if user_skills.get(req_skill_id, 0) < req_level:
            return False
    return True

def calculate_category_progress(skills):
    """Calculate overall progress for a skill category"""
    if not skills:
        return 0
    
    total_levels = sum(skill["max_level"] for skill in skills)
    completed_levels = sum(skill["current_level"] for skill in skills)
    
    return int((completed_levels / total_levels) * 100) if total_levels > 0 else 0

def calculate_overall_skill_progress(skill_tree):
    """Calculate overall skill tree progress"""
    if not skill_tree:
        return 0
    
    total_categories = len(skill_tree)
    total_progress = sum(category["category_progress"] for category in skill_tree.values())
    
    return int(total_progress / total_categories) if total_categories > 0 else 0

def apply_skill_benefits(skill_id, new_level, user_id):
    """Apply benefits when skill is upgraded"""
    skill = find_skill_by_id(skill_id)
    if not skill or new_level > len(skill["benefits"]):
        return []
    
    benefits = skill["benefits"][:new_level]
    
    # In real implementation, would apply these benefits to user's account
    # For now, just return the benefits for display
    
    return benefits

def calculate_xp_for_action(action, task_data, user_id):
    """Calculate XP awarded for different actions"""
    base_xp = 0
    
    if action == "task_completion":
        rules = XP_RULES["task_completion"]
        base_xp = rules["base"]
        
        # Apply priority multiplier
        priority = task_data.get("priority", "medium")
        base_xp *= rules["priority_multipliers"].get(priority, 1.0)
        
        # Apply difficulty multiplier
        difficulty = task_data.get("difficulty", "medium")
        base_xp *= rules["difficulty_multipliers"].get(difficulty, 1.0)
        
        # Apply category multiplier
        category = task_data.get("category", "general")
        base_xp *= rules["category_multipliers"].get(category, 1.0)
        
    elif action == "challenge_completion":
        rules = XP_RULES["challenge_completion"]
        base_xp = 15 * rules["base_multiplier"]  # Base challenge points
        
        difficulty = task_data.get("difficulty", "medium")
        base_xp *= rules["difficulty_multipliers"].get(difficulty, 1.0)
        
    elif action == "mission_completion":
        rules = XP_RULES["mission_completion"]
        base_xp = 100 * rules["base_multiplier"]  # Base mission points
        
        difficulty = task_data.get("difficulty", "medium")
        base_xp *= rules["difficulty_multipliers"].get(difficulty, 1.0)
    
    # Apply streak bonuses
    user_skills = get_user_skills(user_id)
    streak_bonus = calculate_streak_bonus(user_skills)
    base_xp *= streak_bonus
    
    return int(base_xp)

def calculate_streak_bonus(user_skills):
    """Calculate streak bonus multiplier"""
    # Mock implementation - would check actual streak data
    current_streak = 5  # Mock current daily streak
    
    bonuses = XP_RULES["streak_bonuses"]["daily"]
    
    if current_streak >= 30:
        return bonuses["30_days"]
    elif current_streak >= 14:
        return bonuses["14_days"]
    elif current_streak >= 7:
        return bonuses["7_days"]
    elif current_streak >= 3:
        return bonuses["3_days"]
    else:
        return 1.0

def check_level_ups(total_xp):
    """Check for level ups based on total XP"""
    level_ups = []
    
    for level_data in LEVELS:
        if total_xp >= level_data["min_points"]:
            level_ups.append({
                "level": level_data["level"],
                "name": level_data["name"],
                "icon": level_data["icon"]
            })
    
    return level_ups

def award_skill_xp(user_id, skill_id, xp_amount):
    """Award XP to a specific skill"""
    user_skills = get_user_skills(user_id)
    skill = find_skill_by_id(skill_id)
    
    if not skill:
        return False
    
    current_level = user_skills.get(skill_id, 0)
    if current_level >= skill["max_level"]:
        return False  # Skill already maxed
    
    current_xp = user_skills.get(f"{skill_id}_xp", 0)
    xp_needed = skill["xp_per_level"][current_level]
    
    # Add XP
    new_xp = current_xp + xp_amount
    levels_gained = 0
    
    # Check for level ups
    while new_xp >= xp_needed and current_level < skill["max_level"]:
        new_xp -= xp_needed
        current_level += 1
        levels_gained += 1
        
        if current_level < skill["max_level"]:
            xp_needed = skill["xp_per_level"][current_level]
    
    # Update user skills
    user_skills[skill_id] = current_level
    user_skills[f"{skill_id}_xp"] = new_xp
    
    return {
        "levels_gained": levels_gained,
        "new_level": current_level,
        "remaining_xp": new_xp
    }

@gamification_bp.route("/streak", methods=["GET"])
@jwt_required()
def get_streak():
    """Get user's current streak"""
    user_id = get_jwt_identity()
    
    try:
        # Mock streak data
        streak_data = {
            "current_streak": 5,
            "longest_streak": 12,
            "streak_history": [3, 5, 2, 8, 5],  # Last 5 weeks
            "next_milestone": 7,
            "streak_bonus": 25
        }
        
        return jsonify(streak_data), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@gamification_bp.route("/daily-challenges", methods=["GET"])
@jwt_required()
def get_daily_challenges():
    """Get today's daily challenges for the user"""
    user_id = get_jwt_identity()
    
    return jsonify(streak_info), 200
