import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosConfig';

const DailyChallenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('challenges');
  const [history, setHistory] = useState(null);

  useEffect(() => {
    fetchChallengesAndMissions();
  }, []);

  const fetchChallengesAndMissions = async () => {
    try {
      setLoading(true);
      const [challengesRes, missionsRes, historyRes] = await Promise.all([
        api.get('/gamification/daily-challenges'),
        api.get('/gamification/weekly-missions'),
        api.get('/gamification/challenge-history')
      ]);

      setChallenges(challengesRes.data.challenges || []);
      setMissions(missionsRes.data.missions || []);
      setHistory(historyRes.data);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteChallenge = async (challengeId) => {
    try {
      const response = await api.post('/gamification/complete-challenge', {
        challenge_id: challengeId
      });

      // Refresh challenges after completion
      fetchChallengesAndMissions();
      
      // Show success message
      alert(response.data.message);
    } catch (error) {
      console.error('Error completing challenge:', error);
      alert('Error completing challenge');
    }
  };

  const handleCompleteMission = async (missionId) => {
    try {
      const response = await api.post('/gamification/complete-mission', {
        mission_id: missionId
      });

      // Refresh missions after completion
      fetchChallengesAndMissions();
      
      // Show success message
      alert(response.data.message);
    } catch (error) {
      console.error('Error completing mission:', error);
      alert('Error completing mission');
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      hard: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[difficulty] || colors.medium;
  };

  const getProgressColor = (progress, target) => {
    const percentage = (progress / target) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Daily Challenges & Weekly Missions</h2>
        <p className="text-sm text-gray-600">Complete challenges to earn points and unlock rewards</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {[
            { id: 'challenges', label: 'Daily Challenges', count: challenges.length },
            { id: 'missions', label: 'Weekly Missions', count: missions.length },
            { id: 'history', label: 'History', count: null }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'challenges' && (
          <div className="space-y-4">
            {/* Daily Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {challenges.filter(c => c.completed).length}/{challenges.length}
                </div>
                <p className="text-sm text-blue-800">Completed Today</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {challenges.reduce((sum, c) => sum + (c.completed ? c.points : 0), 0)}
                </div>
                <p className="text-sm text-green-800">Points Earned</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {history?.daily_challenges?.current_streak || 0}
                </div>
                <p className="text-sm text-purple-800">Day Streak</p>
              </div>
            </div>

            {/* Challenges List */}
            <div className="space-y-4">
              {challenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className={`border rounded-lg p-4 transition-all ${
                    challenge.completed
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{challenge.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-800">{challenge.name}</h3>
                          <p className="text-sm text-gray-600">{challenge.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                          {challenge.difficulty}
                        </span>
                        <span className="text-sm font-medium text-blue-600">
                          +{challenge.points} points
                        </span>
                      </div>
                    </div>
                    {challenge.completed && (
                      <span className="text-green-600 text-lg">check_circle</span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{challenge.current_value}/{challenge.target}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getProgressColor(challenge.current_value, challenge.target)}`}
                        style={{ width: `${Math.min((challenge.current_value / challenge.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Complete Button */}
                  {!challenge.completed && challenge.current_value >= challenge.target && (
                    <button
                      onClick={() => handleCompleteChallenge(challenge.id)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Claim Reward
                    </button>
                  )}
                </div>
              ))}
            </div>

            {challenges.length === 0 && (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">emoji_events</span>
                <p className="text-gray-500">No daily challenges available. Check back tomorrow!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'missions' && (
          <div className="space-y-4">
            {/* Weekly Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {missions.filter(m => m.completed).length}/{missions.length}
                </div>
                <p className="text-sm text-blue-800">Completed This Week</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {missions.reduce((sum, m) => sum + (m.completed ? m.points : 0), 0)}
                </div>
                <p className="text-sm text-green-800">Points Earned</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {history?.weekly_missions?.total_completed || 0}
                </div>
                <p className="text-sm text-orange-800">Total Missions</p>
              </div>
            </div>

            {/* Missions List */}
            <div className="space-y-4">
              {missions.map((mission) => (
                <div
                  key={mission.id}
                  className={`border rounded-lg p-4 transition-all ${
                    mission.completed
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{mission.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-800">{mission.name}</h3>
                          <p className="text-sm text-gray-600">{mission.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(mission.difficulty)}`}>
                          {mission.difficulty}
                        </span>
                        <span className="text-sm font-medium text-blue-600">
                          +{mission.points} points
                        </span>
                      </div>
                    </div>
                    {mission.completed && (
                      <span className="text-green-600 text-lg">check_circle</span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{mission.current_value}/{mission.target}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getProgressColor(mission.current_value, mission.target)}`}
                        style={{ width: `${Math.min((mission.current_value / mission.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Complete Button */}
                  {!mission.completed && mission.current_value >= mission.target && (
                    <button
                      onClick={() => handleCompleteMission(mission.id)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Claim Reward
                    </button>
                  )}
                </div>
              ))}
            </div>

            {missions.length === 0 && (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">military_tech</span>
                <p className="text-gray-500">No weekly missions available. Check back next week!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && history && (
          <div className="space-y-6">
            {/* Daily Challenges History */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Challenges History</h3>
              <div className="space-y-3">
                {history.daily_challenges.last_7_days.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">{day.date}</div>
                      <div className="text-sm text-gray-600">
                        {day.completed} of {day.total} challenges completed
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-blue-600">+{day.points} pts</div>
                      <div className="text-sm text-gray-500">
                        {Math.round((day.completed / day.total) * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Missions History */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Missions History</h3>
              <div className="space-y-3">
                {history.weekly_missions.last_4_weeks.map((week, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">Week of {week.week_start}</div>
                      <div className="text-sm text-gray-600">
                        {week.completed} of {week.total} missions completed
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-blue-600">+{week.points} pts</div>
                      <div className="text-sm text-gray-500">
                        {Math.round((week.completed / week.total) * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Daily Challenges</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-600">Total Completed:</span>
                    <span className="font-medium">{history.daily_challenges.total_completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">Current Streak:</span>
                    <span className="font-medium">{history.daily_challenges.current_streak} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">Longest Streak:</span>
                    <span className="font-medium">{history.daily_challenges.longest_streak} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">Total Points:</span>
                    <span className="font-medium">{history.daily_challenges.total_points}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Weekly Missions</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-600">Total Completed:</span>
                    <span className="font-medium">{history.weekly_missions.total_completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">This Week:</span>
                    <span className="font-medium">{history.weekly_missions.current_week_completed}/{history.weekly_missions.current_week_total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Completion Rate:</span>
                    <span className="font-medium">
                      {Math.round((history.weekly_missions.current_week_completed / history.weekly_missions.current_week_total) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Total Points:</span>
                    <span className="font-medium">{history.weekly_missions.total_points}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Challenges reset daily at midnight | Missions reset weekly on Monday
          </p>
          <button
            onClick={fetchChallengesAndMissions}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyChallenges;
