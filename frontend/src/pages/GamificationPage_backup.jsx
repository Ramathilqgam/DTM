import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosConfig';

export default function GamificationPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('achievements');
  const [achievements, setAchievements] = useState({ unlocked: [], locked: [] });
  const [leaderboard, setLeaderboard] = useState([]);
  const [profile, setProfile] = useState(null);
  const [rewards, setRewards] = useState({ rewards: [], user_points: 0 }); // ✅ FIX
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const fetchGamificationData = async () => {
    try {
      const [achievementsRes, leaderboardRes, profileRes, rewardsRes, streakRes] = await Promise.all([
        api.get('/gamification/achievements'),
        api.get('/gamification/leaderboard'),
        api.get('/gamification/profile'),
        api.get('/gamification/rewards'),
        api.get('/gamification/streak')
      ]);

      setAchievements(achievementsRes.data);
      setLeaderboard(leaderboardRes.data.leaderboard || []);
      setProfile(profileRes.data);
      setRewards(rewardsRes.data || { rewards: [], user_points: 0 }); // ✅ FIX
      setStreak(streakRes.data);
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (rewardId) => {
    try {
      await api.post('/gamification/claim-reward', { reward_id: rewardId });
      fetchGamificationData();
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      1: 'from-gray-600 to-gray-700',
      2: 'from-green-600 to-green-700',
      3: 'from-blue-600 to-blue-700',
      4: 'from-purple-600 to-purple-700',
      5: 'from-orange-600 to-orange-700',
      6: 'from-red-600 to-red-700',
      7: 'from-yellow-600 to-yellow-700',
      8: 'from-pink-600 to-pink-700'
    };
    return colors[level] || 'from-gray-600 to-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a2e] to-[#16213e] text-white">

      {/* HEADER */}
      <div className="border-b border-zinc-800/50 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between">
          <h1 className="text-2xl font-bold">Gamification & Achievements</h1>
          <nav className="flex gap-6">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/tasks">Tasks</Link>
          </nav>
        </div>
      </div>

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* PROFILE */}
        {profile && (
          <div className="mb-8">
            <h2 className="text-xl font-bold">
              Level {profile.user.level} - {profile.user.level_name}
            </h2>
            <p>{profile.user.current_points} points</p>
          </div>
        )}

        {/* TABS */}
        <div className="flex gap-2 mb-8">
          {['achievements', 'leaderboard', 'rewards', 'streak'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded ${
                activeTab === tab ? 'bg-indigo-600' : 'bg-zinc-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* CONTENT (✅ FIXED HERE) */}
        <div>

          {activeTab === 'achievements' && (
            <div>
              {achievements.unlocked.map(a => (
                <div key={a.id}>{a.name}</div>
              ))}
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div>
              {leaderboard.map((entry, i) => (
                <div key={entry.user.id}>
                  {i + 1}. {entry.user.name} - {entry.total_points}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'rewards' && (
            <div>
              <p>Your Points: {rewards.user_points}</p>

              {rewards.rewards.map(r => (
                <div key={r.id}>
                  {r.name} - {r.cost}
                  <button onClick={() => claimReward(r.id)} disabled={!r.can_afford}>
                    Claim
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'streak' && streak && (
            <div>
              🔥 {streak.current_streak} Day Streak
            </div>
          )}

        </div>

      </div>
    </div>
  );
}