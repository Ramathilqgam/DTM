import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Gamification({ user, tasks }) {
  const [userStats, setUserStats] = useState({
    points: 0,
    level: 1,
    badges: [],
    streak: 0,
    achievements: []
  });

  useEffect(() => {
    calculateGamificationStats();
  }, [tasks, user]);

  const calculateGamificationStats = () => {
    const completedTasks = tasks?.filter(t => t.status === 'completed') || [];
    const today = new Date();
    const thisWeek = completedTasks.filter(task => {
      const taskDate = new Date(task.updated_at || task.created_at);
      const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
      return taskDate >= weekStart && taskDate <= today;
    });

    // Calculate points
    let points = 0;
    thisWeek.forEach(task => {
      points += getTaskPoints(task);
    });

    // Calculate streak
    const streak = calculateStreak(completedTasks);
    
    // Calculate level
    const level = Math.floor(points / 100) + 1;
    
    // Calculate badges
    const badges = calculateBadges(completedTasks, streak);
    
    // Calculate achievements
    const achievements = calculateAchievements(completedTasks, points, streak);

    setUserStats({
      points,
      level,
      badges,
      streak,
      achievements
    });
  };

  const getTaskPoints = (task) => {
    let taskPoints = 10; // Base points
    
    // Priority bonus
    if (task.priority === 'high') taskPoints += 5;
    else if (task.priority === 'medium') taskPoints += 3;
    
    // Deadline bonus
    if (task.due_date) {
      const dueDate = new Date(task.due_date);
      const completedDate = new Date(task.updated_at || task.created_at);
      if (completedDate <= dueDate) {
        taskPoints += 5; // Completed on time bonus
      }
    }
    
    return taskPoints;
  };

  const calculateStreak = (completedTasks) => {
    if (completedTasks.length === 0) return 0;
    
    const sortedTasks = completedTasks.sort((a, b) => 
      new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
    );
    
    let streak = 1;
    const today = new Date().toDateString();
    
    for (let i = 0; i < sortedTasks.length - 1; i++) {
      const currentDate = new Date(sortedTasks[i].updated_at || sortedTasks[i].created_at).toDateString();
      const nextDate = new Date(sortedTasks[i + 1].updated_at || sortedTasks[i + 1].created_at).toDateString();
      
      if (currentDate === nextDate || currentDate === today) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateBadges = (completedTasks, streak) => {
    const badges = [];
    
    // First Task Badge
    if (completedTasks.length >= 1) {
      badges.push({
        id: 'first_task',
        name: 'First Task Completed',
        icon: '🎯',
        description: 'Completed your first task',
        earned: true
      });
    }
    
    // Streak Badges
    if (streak >= 3) {
      badges.push({
        id: 'streak_3',
        name: '3-Day Streak',
        icon: '🔥',
        description: 'Completed tasks for 3 days in a row',
        earned: true
      });
    }
    
    if (streak >= 7) {
      badges.push({
        id: 'streak_7',
        name: 'Week Warrior',
        icon: '💪',
        description: 'Completed tasks for 7 days in a row',
        earned: true
      });
    }
    
    // Productivity Badges
    if (completedTasks.length >= 10) {
      badges.push({
        id: 'productive_10',
        name: 'Productive Member',
        icon: '⭐',
        description: 'Completed 10 tasks',
        earned: true
      });
    }
    
    if (completedTasks.length >= 50) {
      badges.push({
        id: 'productive_50',
        name: 'Task Master',
        icon: '👑',
        description: 'Completed 50 tasks',
        earned: true
      });
    }
    
    return badges;
  };

  const calculateAchievements = (completedTasks, points, streak) => {
    const achievements = [];
    
    // Speed Achievement
    const recentTasks = completedTasks.slice(-5);
    if (recentTasks.length >= 5) {
      achievements.push({
        id: 'speed_demon',
        name: 'Speed Demon',
        icon: '⚡',
        description: 'Completed 5 tasks in recent activity',
        progress: 100
      });
    }
    
    // Consistency Achievement
    if (streak >= 5) {
      achievements.push({
        id: 'consistent',
        name: 'Consistent Performer',
        icon: '📅',
        description: 'Maintained a 5-day streak',
        progress: 100
      });
    }
    
    // Point Milestones
    if (points >= 100) {
      achievements.push({
        id: 'century',
        name: 'Century Club',
        icon: '💯',
        description: 'Earned 100+ points',
        progress: 100
      });
    }
    
    if (points >= 500) {
      achievements.push({
        id: 'elite',
        name: 'Elite Performer',
        icon: '👑',
        description: 'Earned 500+ points',
        progress: 100
      });
    }
    
    return achievements;
  };

  const getLevelProgress = () => {
    const currentLevelPoints = (userStats.level - 1) * 100;
    const nextLevelPoints = userStats.level * 100;
    const progress = ((userStats.points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    return Math.min(progress, 100);
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/30 to-purple-950/20 border border-purple-700/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <h3 className="text-xl font-bold">Gamification</h3>
            <p className="text-sm text-gray-400">Earn points and unlock achievements</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-purple-400">Lv. {userStats.level}</span>
        </div>
      </div>

      {/* Points and Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-700/50">
          <div className="text-center">
            <span className="text-3xl font-bold text-purple-400">{userStats.points}</span>
            <p className="text-sm text-gray-400">Total Points</p>
          </div>
        </div>
        
        <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-700/50">
          <div className="text-center">
            <span className="text-2xl font-bold text-orange-400">{userStats.streak}</span>
            <p className="text-sm text-gray-400">Day Streak 🔥</p>
          </div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Level {userStats.level} Progress</span>
          <span className="text-sm text-purple-400">
            {userStats.points - ((userStats.level - 1) * 100)} / 100 XP to next level
          </span>
        </div>
        <div className="w-full bg-purple-950/40 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
            style={{ width: `${getLevelProgress()}%` }}
          />
        </div>
      </div>

      {/* Badges */}
      <div className="mb-6">
        <h4 className="text-lg font-bold mb-4">🏅 Badges Earned</h4>
        {userStats.badges.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Complete tasks to earn badges!</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {userStats.badges.map((badge) => (
              <div
                key={badge.id}
                className="p-3 rounded-lg bg-purple-950/40 border border-purple-700/50 text-center hover:scale-105 transition-transform"
                title={badge.description}
              >
                <span className="text-2xl mb-1">{badge.icon}</span>
                <p className="text-xs text-gray-300">{badge.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Achievements */}
      <div>
        <h4 className="text-lg font-bold mb-4">🎯 Achievements</h4>
        {userStats.achievements.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Keep working to unlock achievements!</p>
        ) : (
          <div className="space-y-3">
            {userStats.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="p-4 rounded-xl bg-purple-950/40 border border-purple-700/50 flex items-center gap-3"
              >
                <span className="text-2xl">{achievement.icon}</span>
                <div className="flex-1">
                  <h5 className="font-semibold text-white">{achievement.name}</h5>
                  <p className="text-sm text-gray-400">{achievement.description}</p>
                  <div className="mt-2">
                    <div className="w-full bg-purple-950/40 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
