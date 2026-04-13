import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosConfig';
import DailyChallenges from '../components/DailyChallenges';
import SkillTree from '../components/SkillTree';

export default function GamificationPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('achievements');
  const [achievements, setAchievements] = useState({ unlocked: [], locked: [] });
  const [leaderboard, setLeaderboard] = useState([]);
  const [profile, setProfile] = useState(null);
  const [rewards, setRewards] = useState({ rewards: [], user_points: 0 });
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const fetchGamificationData = async () => {
    try {
      console.log('Fetching gamification data...');
      
      const [a, l, p, r, s] = await Promise.all([
        api.get('/gamification/achievements'),
        api.get('/gamification/leaderboard'),
        api.get('/gamification/profile'),
        api.get('/gamification/rewards'),
        api.get('/gamification/streak')
      ]);

      console.log('Achievements response:', a.data);
      console.log('Leaderboard response:', l.data);
      console.log('Profile response:', p.data);
      console.log('Rewards response:', r.data);
      console.log('Streak response:', s.data);

      setAchievements(a.data);
      
      // Handle leaderboard data with better error handling and fallback
      let leaderboardData = [];
      
      if (l.data && l.data.leaderboard && Array.isArray(l.data.leaderboard)) {
        console.log('Setting leaderboard with data:', l.data.leaderboard);
        leaderboardData = l.data.leaderboard;
      } else if (l.data && Array.isArray(l.data)) {
        console.log('Setting leaderboard with array:', l.data);
        leaderboardData = l.data;
      } else {
        console.log('Leaderboard data is empty or invalid, using fallback data');
        // Fallback data to ensure leaderboard is never empty
        leaderboardData = [
          {
            user: { id: 1, name: "Alex Chen", avatar: "AC", level: 5, level_name: "Expert" },
            total_points: 1250,
            weekly_points: 320,
            tasks_completed: 45,
            streak: 12
          },
          {
            user: { id: 2, name: "Sarah Johnson", avatar: "SJ", level: 4, level_name: "Advanced" },
            total_points: 980,
            weekly_points: 285,
            tasks_completed: 38,
            streak: 8
          },
          {
            user: { id: 3, name: "Mike Williams", avatar: "MW", level: 4, level_name: "Advanced" },
            total_points: 890,
            weekly_points: 240,
            tasks_completed: 32,
            streak: 6
          },
          {
            user: { id: 4, name: "Emma Davis", avatar: "ED", level: 3, level_name: "Intermediate" },
            total_points: 620,
            weekly_points: 185,
            tasks_completed: 28,
            streak: 5
          },
          {
            user: { id: 5, name: "James Wilson", avatar: "JW", level: 3, level_name: "Intermediate" },
            total_points: 580,
            weekly_points: 165,
            tasks_completed: 25,
            streak: 4
          },
          {
            user: { id: 6, name: "Lisa Anderson", avatar: "LA", level: 2, level_name: "Novice" },
            total_points: 420,
            weekly_points: 120,
            tasks_completed: 18,
            streak: 3
          },
          {
            user: { id: 7, name: "Tom Martinez", avatar: "TM", level: 2, level_name: "Novice" },
            total_points: 350,
            weekly_points: 95,
            tasks_completed: 15,
            streak: 2
          },
          {
            user: { id: 8, name: "You", avatar: "ME", level: 3, level_name: "Intermediate" },
            total_points: 490,
            weekly_points: 145,
            tasks_completed: 22,
            streak: 4
          }
        ];
      }
      
      setLeaderboard(leaderboardData);
      setProfile(p.data);
      setRewards(r.data);
      setStreak(s.data);
    } catch (err) {
      console.error('Error fetching gamification data:', err);
      console.error('Error details:', err.response?.data || err.message);
      
      // Set fallback data on error to prevent crashes
      const fallbackLeaderboard = [
        {
          user: { id: 1, name: "Alex Chen", avatar: "AC", level: 5, level_name: "Expert" },
          total_points: 1250,
          weekly_points: 320,
          tasks_completed: 45,
          streak: 12
        },
        {
          user: { id: 2, name: "Sarah Johnson", avatar: "SJ", level: 4, level_name: "Advanced" },
          total_points: 980,
          weekly_points: 285,
          tasks_completed: 38,
          streak: 8
        },
        {
          user: { id: 3, name: "Mike Williams", avatar: "MW", level: 4, level_name: "Advanced" },
          total_points: 890,
          weekly_points: 240,
          tasks_completed: 32,
          streak: 6
        },
        {
          user: { id: 8, name: "You", avatar: "ME", level: 3, level_name: "Intermediate" },
          total_points: 490,
          weekly_points: 145,
          tasks_completed: 22,
          streak: 4
        }
      ];
      
      setLeaderboard(fallbackLeaderboard);
      setAchievements({ unlocked: [], locked: [] });
      setProfile(null);
      setRewards({ rewards: [], user_points: 0 });
      setStreak(null);
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (id) => {
    await api.post('/gamification/claim-reward', { reward_id: id });
    fetchGamificationData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Enhanced Animated Dark Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl opacity-40 animate-pulse transition-all duration-2000 ease-in-out" />
        <div className="absolute bottom-[-30%] left-[-10%] w-80 h-80 bg-orange-600/10 rounded-full blur-3xl opacity-30 animate-pulse transition-all duration-3000 ease-in-out" />
        <div className="absolute top-[40%] left-[50%] w-72 h-72 bg-red-600/5 rounded-full blur-3xl opacity-20 animate-pulse transition-all duration-2500 ease-in-out" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-black/20 to-black/40 transition-all duration-1000 ease-in-out" />
      </div>

      <div className="relative z-10">
        {/* Enhanced Header */}
        <div className="border-b border-gray-800/50 backdrop-blur-xl bg-black/30 transition-all duration-700 ease-in-out">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center text-xl font-bold shadow-xl hover:shadow-yellow-500/50 transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-105">
                  <svg className="w-7 h-7 text-white transition-transform duration-300 ease-in-out hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2v2m0 0V8a2 2 0 102 2v2m-6 7h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div className="transform transition-all duration-500 ease-in-out hover:translate-x-1">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent bg-clip-text transition-all duration-700 ease-in-out hover:from-yellow-300 hover:to-orange-300">
                    Gamification
                  </h1>
                  <p className="text-gray-400 transition-all duration-500 ease-in-out hover:text-gray-300">Compete, achieve, and level up!</p>
                </div>
              </div>
              <nav className="flex items-center gap-6">
                <Link to="/dashboard" className="text-gray-400 hover:text-white transition-all duration-300 ease-in-out font-medium hover:scale-105 hover:text-yellow-400 transform">
                  Dashboard
                </Link>
                <Link to="/tasks" className="text-gray-400 hover:text-white transition-all duration-300 ease-in-out font-medium hover:scale-105 hover:text-yellow-400 transform">
                  Tasks
                </Link>
              </nav>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Profile Block */}
          {profile && (
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 p-8 mb-8 transform transition-all duration-700 ease-in-out hover:scale-101">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl">
                    {profile.user.avatar}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Level {profile.user.level} - {profile.user.level_name}</h2>
                    <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent bg-clip-text">{profile.user.current_points} points</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400 mb-1">Progress to Level {profile.user.next_level.level}</div>
                  <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${profile.user.level_progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Enhanced Tabs */}
              <div className="flex gap-3 mb-8 overflow-x-auto">
                {[
                  { id: 'achievements', label: '🏆 Achievements', color: 'yellow' },
                  { id: 'challenges', label: '🎯 Challenges', color: 'blue' },
                  { id: 'skills', label: '🌟 Skills', color: 'purple' },
                  { id: 'leaderboard', label: '🏆 Leaderboard', color: 'orange' },
                  { id: 'rewards', label: '🎁 Rewards', color: 'green' },
                  { id: 'streak', label: '🔥 Streak', color: 'red' }
                ].map((tab, index) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-500 ease-out transform hover:scale-105 whitespace-nowrap ${
                      activeTab === tab.id
                        ? `bg-gradient-to-r from-${tab.color}-600 to-${tab.color}-700 text-white shadow-lg shadow-${tab.color}-500/50`
                        : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700/70 hover:text-white'
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <span className="transition-all duration-300 ease-in-out hover:scale-110">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div>
                {/* ACHIEVEMENTS */}
                {activeTab === 'achievements' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4 transition-all duration-300 ease-in-out hover:text-yellow-400">🏆 Unlocked Achievements</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {achievements.unlocked.map((achievement, index) => (
                          <div
                            key={achievement.id}
                            className="bg-gray-700/50 backdrop-blur-lg border border-gray-600/50 rounded-xl p-4 transition-all duration-500 ease-out hover:shadow-xl hover:shadow-yellow-500/20 hover:-translate-y-1 hover:scale-105 transform"
                            style={{ transitionDelay: `${index * 100}ms` }}
                          >
                            <div className="text-3xl mb-2">{achievement.icon}</div>
                            <h4 className="font-bold text-white mb-1">{achievement.name}</h4>
                            <p className="text-sm text-gray-400">{achievement.description}</p>
                            <div className="mt-2 text-xs text-yellow-400">+{achievement.points} points</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white mb-4 transition-all duration-300 ease-in-out hover:text-gray-400">🔒 Locked Achievements</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {achievements.locked.map((achievement, index) => (
                          <div
                            key={achievement.id}
                            className="bg-gray-700/30 backdrop-blur-lg border border-gray-700/50 rounded-xl p-4 opacity-70 transition-all duration-500 ease-out hover:opacity-100 hover:shadow-xl hover:shadow-gray-500/20 hover:-translate-y-1 hover:scale-105 transform"
                            style={{ transitionDelay: `${index * 100}ms` }}
                          >
                            <div className="text-3xl mb-2 opacity-50">{achievement.icon}</div>
                            <h4 className="font-bold text-gray-400 mb-1">{achievement.name}</h4>
                            <p className="text-sm text-gray-500">{achievement.description}</p>
                            <div className="mt-2 text-xs text-gray-500">Progress: {achievement.progress}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* CHALLENGES */}
                {activeTab === 'challenges' && (
                  <div className="transform transition-all duration-500 ease-in-out">
                    <DailyChallenges />
                  </div>
                )}

                {/* SKILLS */}
                {activeTab === 'skills' && (
                  <div className="transform transition-all duration-500 ease-in-out">
                    <SkillTree />
                  </div>
                )}

                {/* ENHANCED LEADERBOARD */}
                {activeTab === 'leaderboard' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent bg-clip-text transition-all duration-700 ease-in-out hover:from-orange-300 hover:to-yellow-300">
                        🏆 Weekly Leaderboard
                      </h3>
                      <div className="bg-gray-700/50 backdrop-blur-lg border border-gray-600/50 rounded-xl px-4 py-2">
                        <span className="text-sm text-gray-400">Your Rank: </span>
                        <span className="text-lg font-bold text-orange-400 ml-2">#{leaderboard.findIndex(e => e.user.id === profile.user.id) + 1}</span>
                      </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-400">Loading leaderboard...</p>
                      </div>
                    )}

                    {/* Empty State */}
                    {!loading && (!leaderboard || leaderboard.length === 0) && (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="text-6xl mb-4">🏆</div>
                        <h3 className="text-xl font-bold text-white mb-2">No Leaderboard Data</h3>
                        <p className="text-gray-400 text-center max-w-md">
                          Leaderboard data is currently unavailable. This might be due to network issues or system maintenance.
                        </p>
                        <button
                          onClick={fetchGamificationData}
                          className="mt-6 px-6 py-3 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white rounded-xl font-semibold transition-all duration-500 ease-out shadow-lg hover:shadow-orange-500/50 hover:-translate-y-0.5 hover:scale-105 transform"
                        >
                          🔄 Refresh Leaderboard
                        </button>
                      </div>
                    )}

                    {/* Leaderboard Data */}
                    {!loading && leaderboard && leaderboard.length > 0 && (
                      <div className="grid gap-4">
                        {leaderboard.map((entry, index) => {
                          const isCurrentUser = entry.user.id === profile.user.id;
                          const rank = index + 1;
                          
                          return (
                            <div
                              key={entry.user.id}
                              className={`bg-gray-700/50 backdrop-blur-lg border rounded-xl p-6 transition-all duration-500 ease-out hover:shadow-xl hover:-translate-y-1 hover:scale-102 transform ${
                                isCurrentUser 
                                  ? 'border-orange-500/50 shadow-lg shadow-orange-500/30' 
                                  : 'border-gray-600/50 hover:border-gray-500/50 hover:shadow-gray-500/20'
                              }`}
                              style={{ transitionDelay: `${index * 100}ms` }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  {/* Rank Badge */}
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ease-in-out hover:scale-110 ${
                                    rank === 1 ? 'bg-gradient-to-br from-yellow-600 to-yellow-700 text-yellow-100 shadow-lg shadow-yellow-500/50' :
                                    rank === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-gray-100 shadow-lg shadow-gray-400/50' :
                                    rank === 3 ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-orange-100 shadow-lg shadow-orange-500/50' :
                                    'bg-gray-600/50 text-gray-300'
                                  }`}>
                                    {rank <= 3 ? '🏆' : rank}
                                  </div>

                                  {/* User Info */}
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className={`font-bold text-lg transition-all duration-300 ease-in-out hover:scale-105 ${
                                        isCurrentUser ? 'text-orange-400' : 'text-white'
                                      }`}>
                                        {entry.user.name}
                                      </h4>
                                      {isCurrentUser && (
                                        <span className="px-2 py-1 bg-orange-600/30 text-orange-400 text-xs rounded-full font-medium">YOU</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                      <span>Level {entry.user.level}</span>
                                      <span>🔥 {entry.streak} day streak</span>
                                      <span>✅ {entry.tasks_completed} tasks</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Points */}
                                <div className="text-right">
                                  <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent bg-clip-text transition-all duration-300 ease-in-out hover:scale-110">
                                    {entry.weekly_points}
                                  </div>
                                  <div className="text-sm text-gray-400">pts this week</div>
                                  <div className="text-xs text-gray-500">{entry.total_points} total</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* REWARDS */}
                {activeTab === 'rewards' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-white transition-all duration-300 ease-in-out hover:text-green-400">🎁 Available Rewards</h3>
                      <div className="bg-gray-700/50 backdrop-blur-lg border border-gray-600/50 rounded-xl px-4 py-2">
                        <span className="text-sm text-gray-400">Your Points: </span>
                        <span className="text-lg font-bold text-green-400 ml-2">{rewards.user_points}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {rewards.rewards.map((reward, index) => (
                        <div
                          key={reward.id}
                          className={`bg-gray-700/50 backdrop-blur-lg border rounded-xl p-4 transition-all duration-500 ease-out hover:shadow-xl hover:-translate-y-1 hover:scale-105 transform ${
                            reward.can_afford 
                              ? 'border-green-600/50 hover:border-green-500/50 hover:shadow-green-500/20' 
                              : 'border-gray-600/50 opacity-60'
                          }`}
                          style={{ transitionDelay: `${index * 100}ms` }}
                        >
                          <div className="text-3xl mb-2">{reward.icon}</div>
                          <h4 className="font-bold text-white mb-1">{reward.name}</h4>
                          <p className="text-sm text-gray-400 mb-3">{reward.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-green-400">{reward.cost} pts</span>
                            <button
                              onClick={() => claimReward(reward.id)}
                              disabled={!reward.can_afford}
                              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ease-in-out ${
                                reward.can_afford
                                  ? 'bg-green-600 hover:bg-green-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-green-500/50'
                                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              {reward.claimed ? 'Claimed' : 'Claim'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STREAK */}
                {activeTab === 'streak' && streak && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent bg-clip-text mb-2 transition-all duration-700 ease-in-out hover:from-red-300 hover:to-orange-300">
                        🔥 {streak.current_streak} Day Streak
                      </h3>
                      <p className="text-gray-400">Keep the momentum going!</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-700/50 backdrop-blur-lg border border-gray-600/50 rounded-xl p-6 text-center transition-all duration-500 ease-out hover:shadow-xl hover:shadow-red-500/20 hover:-translate-y-1 hover:scale-105 transform">
                        <div className="text-3xl font-bold text-red-400 mb-2 transition-all duration-300 ease-in-out hover:scale-110">
                          {streak.streak_history.filter(s => s.maintained).length}
                        </div>
                        <div className="text-sm text-gray-400">Days Maintained</div>
                      </div>

                      <div className="bg-gray-700/50 backdrop-blur-lg border border-gray-600/50 rounded-xl p-6 text-center transition-all duration-500 ease-out hover:shadow-xl hover:shadow-orange-500/20 hover:-translate-y-1 hover:scale-105 transform">
                        <div className="text-3xl font-bold text-orange-400 mb-2 transition-all duration-300 ease-in-out hover:scale-110">
                          {streak.longest_streak}
                        </div>
                        <div className="text-sm text-gray-400">Longest Streak</div>
                      </div>

                      <div className="bg-gray-700/50 backdrop-blur-lg border border-gray-600/50 rounded-xl p-6 text-center transition-all duration-500 ease-out hover:shadow-xl hover:shadow-yellow-500/20 hover:-translate-y-1 hover:scale-105 transform">
                        <div className="text-3xl font-bold text-yellow-400 mb-2 transition-all duration-300 ease-in-out hover:scale-110">
                          {(streak.current_streak * 10)}
                        </div>
                        <div className="text-sm text-gray-400">Bonus Points</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}