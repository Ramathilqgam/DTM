import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosConfig';

const SkillTree = () => {
  const { user } = useAuth();
  const [skillTree, setSkillTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [upgradingSkill, setUpgradingSkill] = useState(null);
  const [xpHistory, setXpHistory] = useState(null);
  const [activeTab, setActiveTab] = useState('tree');

  useEffect(() => {
    fetchSkillTreeData();
  }, []);

  const fetchSkillTreeData = async () => {
    try {
      setLoading(true);
      const [skillTreeRes, xpHistoryRes] = await Promise.all([
        api.get('/gamification/skill-tree'),
        api.get('/gamification/xp-history')
      ]);

      setSkillTree(skillTreeRes.data);
      setXpHistory(xpHistoryRes.data);
      
      // Select first category by default
      if (skillTreeRes.data.skill_tree) {
        const firstCategory = Object.keys(skillTreeRes.data.skill_tree)[0];
        setSelectedCategory(firstCategory);
      }
    } catch (error) {
      console.error('Error fetching skill tree data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeSkill = async (skillId) => {
    try {
      setUpgradingSkill(skillId);
      const response = await api.post('/gamification/upgrade-skill', {
        skill_id: skillId
      });

      // Refresh skill tree data
      await fetchSkillTreeData();
      
      // Show success message
      alert(response.data.message);
    } catch (error) {
      console.error('Error upgrading skill:', error);
      alert('Error upgrading skill');
    } finally {
      setUpgradingSkill(null);
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-gray-300';
  };

  const getLevelColor = (level, maxLevel) => {
    if (level >= maxLevel) return 'text-green-600';
    if (level >= maxLevel * 0.6) return 'text-blue-600';
    if (level >= maxLevel * 0.3) return 'text-yellow-600';
    return 'text-gray-400';
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

  if (!skillTree) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-500">No skill tree data available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Skill Tree & XP System</h2>
            <p className="text-sm text-gray-600">Level up your skills and unlock powerful abilities</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-600">{skillTree.total_xp}</div>
            <p className="text-sm text-gray-500">Total XP</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {[
            { id: 'tree', label: 'Skill Tree', icon: 'account_tree' },
            { id: 'xp', label: 'XP History', icon: 'stars' },
            { id: 'progress', label: 'Progress', icon: 'trending_up' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'tree' && (
          <div className="space-y-6">
            {/* Overall Progress */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-purple-800">Overall Progress</h3>
                <span className="text-sm text-purple-600">{skillTree.overall_progress}% Complete</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                  style={{ width: `${skillTree.overall_progress}%` }}
                ></div>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 flex-wrap">
              {Object.entries(skillTree.skill_tree).map(([categoryId, category]) => (
                <button
                  key={categoryId}
                  onClick={() => setSelectedCategory(categoryId)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === categoryId
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>

            {/* Selected Category Skills */}
            {selectedCategory && skillTree.skill_tree[selectedCategory] && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {skillTree.skill_tree[selectedCategory].name}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {skillTree.skill_tree[selectedCategory].completed_levels}/{skillTree.skill_tree[selectedCategory].total_levels} levels
                  </span>
                </div>

                <div className="space-y-4">
                  {skillTree.skill_tree[selectedCategory].skills.map((skill) => (
                    <div
                      key={skill.id}
                      className={`border rounded-lg p-4 transition-all ${
                        skill.is_unlocked
                          ? 'border-purple-200 bg-purple-50 hover:shadow-md'
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{skill.icon}</span>
                            <div>
                              <h4 className="font-semibold text-gray-800">{skill.name}</h4>
                              <p className="text-sm text-gray-600">{skill.description}</p>
                            </div>
                          </div>
                          
                          {/* Level Display */}
                          <div className="flex items-center gap-4 mb-2">
                            <span className={`font-bold ${getLevelColor(skill.current_level, skill.max_level)}`}>
                              Level {skill.current_level}/{skill.max_level}
                            </span>
                            {skill.is_maxed && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                MAXED
                              </span>
                            )}
                            {!skill.is_unlocked && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                LOCKED
                              </span>
                            )}
                          </div>

                          {/* Requirements */}
                          {skill.requirements.length > 0 && !skill.is_unlocked && (
                            <div className="text-sm text-orange-600 mb-2">
                              Requires: {skill.requirements.join(', ')}
                            </div>
                          )}

                          {/* Benefits */}
                          {skill.current_level > 0 && (
                            <div className="text-sm text-green-600 mb-2">
                              Current benefits: {skill.benefits[skill.current_level - 1]}
                            </div>
                          )}
                        </div>

                        {/* XP Progress */}
                        <div className="text-right">
                          <div className="text-sm text-gray-500 mb-1">XP Progress</div>
                          <div className="font-medium text-purple-600">
                            {skill.current_xp}/{skill.xp_for_next_level}
                          </div>
                          {skill.is_maxed && (
                            <div className="text-green-600 font-medium">Complete!</div>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {!skill.is_maxed && (
                        <div className="mb-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${getProgressColor(skill.progress_percentage)}`}
                              style={{ width: `${skill.progress_percentage}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {skill.progress_percentage.toFixed(1)}% to next level
                          </div>
                        </div>
                      )}

                      {/* Upgrade Button */}
                      {skill.is_unlocked && !skill.is_maxed && skill.current_xp >= skill.xp_for_next_level && (
                        <button
                          onClick={() => handleUpgradeSkill(skill.id)}
                          disabled={upgradingSkill === skill.id}
                          className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {upgradingSkill === skill.id ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Upgrading...
                            </span>
                          ) : (
                            `Upgrade (Cost: ${skill.xp_for_next_level - skill.current_xp} XP)`
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'xp' && xpHistory && (
          <div className="space-y-6">
            {/* XP Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {xpHistory.total_stats.total_xp_earned}
                </div>
                <p className="text-sm text-purple-800">Total XP Earned</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {xpHistory.total_stats.xp_from_tasks}
                </div>
                <p className="text-sm text-blue-800">From Tasks</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {xpHistory.total_stats.xp_from_challenges}
                </div>
                <p className="text-sm text-green-800">From Challenges</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {xpHistory.total_stats.global_rank}
                </div>
                <p className="text-sm text-orange-800">Global Rank</p>
              </div>
            </div>

            {/* Daily XP History */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily XP History (Last 7 Days)</h3>
              <div className="space-y-2">
                {xpHistory.daily_xp.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-purple-600">calendar_today</span>
                      <div>
                        <div className="font-medium text-gray-800">{day.date}</div>
                        <div className="text-sm text-gray-600 capitalize">{day.source}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-purple-600">+{day.xp_earned} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Performance</h3>
              <div className="space-y-2">
                {xpHistory.weekly_summary.map((week, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-blue-600">date_range</span>
                      <div>
                        <div className="font-medium text-gray-800">{week.week}</div>
                        <div className="text-sm text-gray-600">Rank #{week.rank}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">{week.xp_earned} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6">
            {/* Category Progress */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Progress</h3>
              <div className="space-y-3">
                {Object.entries(skillTree.skill_tree).map(([categoryId, category]) => (
                  <div key={categoryId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <h4 className="font-medium text-gray-800">{category.name}</h4>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-purple-600">{category.category_progress}%</div>
                        <div className="text-sm text-gray-500">
                          {category.completed_levels}/{category.total_levels} levels
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                        style={{ width: `${category.category_progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Level Progress */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Level Progress</h3>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-orange-800">Current Level: {xpHistory.total_stats.current_level}</h4>
                  <span className="text-sm text-orange-600">
                    {xpHistory.total_stats.xp_to_next_level} XP to next level
                  </span>
                </div>
                <div className="w-full bg-orange-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min((xpHistory.total_stats.total_xp_earned % 100), 100)}%` }}
                  ></div>
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
            Earn XP by completing tasks, challenges, and missions to upgrade your skills
          </p>
          <button
            onClick={fetchSkillTreeData}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillTree;
