import { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../hooks/useAuth';

export default function SkillDevelopment() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('assessment');
  const [skillAssessment, setSkillAssessment] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [roadmap, setRoadmap] = useState(null);
  const [goals, setGoals] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [skillTree, setSkillTree] = useState(null);
  const [learningPath, setLearningPath] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [competencyLevel, setCompetencyLevel] = useState(null);
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const canvasRef = useRef(null);
  const [animationFrame, setAnimationFrame] = useState(0);

  const skillCategories = {
    technical: {
      name: 'Technical Skills',
      icon: 'code',
      color: 'from-blue-500 to-cyan-500',
      skills: ['Programming', 'Data Analysis', 'Machine Learning', 'Cloud Computing', 'DevOps', 'Cybersecurity']
    },
    soft_skills: {
      name: 'Soft Skills',
      icon: 'users',
      color: 'from-purple-500 to-pink-500',
      skills: ['Communication', 'Leadership', 'Time Management', 'Problem Solving', 'Teamwork', 'Creativity']
    },
    business: {
      name: 'Business Skills',
      icon: 'briefcase',
      color: 'from-green-500 to-emerald-500',
      skills: ['Project Management', 'Marketing', 'Sales', 'Financial Planning', 'Strategic Thinking', 'Networking']
    },
    personal_development: {
      name: 'Personal Development',
      icon: 'heart',
      color: 'from-orange-500 to-red-500',
      skills: ['Mindfulness', 'Health & Fitness', 'Reading', 'Learning Languages', 'Creative Writing', 'Public Speaking']
    }
  };

  useEffect(() => {
    if (activeTab === 'assessment') {
      fetchSkillAssessment();
    } else if (activeTab === 'roadmap') {
      fetchDevelopmentRoadmap();
    } else if (activeTab === 'goals') {
      fetchGoals();
    }
  }, [activeTab]);

  const fetchSkillAssessment = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockAssessment = {
        'Programming': 7,
        'Data Analysis': 6,
        'Communication': 5,
        'Leadership': 4,
        'Project Management': 6,
        'Time Management': 7,
        'Problem Solving': 8,
        'Teamwork': 6,
        'Creativity': 5,
        'Marketing': 3,
        'Financial Planning': 4,
        'Mindfulness': 6
      };
      
      const mockRecommendations = [
        {
          category: 'technical',
          priority: 'high',
          reason: 'Based on your task patterns, technical skills could be strengthened',
          suggested_tasks: [
            'Complete an online course on Python/JavaScript',
            'Build a personal project',
            'Contribute to open source'
          ]
        },
        {
          category: 'soft_skills',
          priority: 'medium',
          reason: 'Communication and teamwork are essential for career growth',
          suggested_tasks: [
            'Join a public speaking group',
            'Lead a team project',
            'Practice active listening exercises'
          ]
        },
        {
          category: 'personal_development',
          priority: 'low',
          reason: 'Continuous learning is key to long-term success',
          suggested_tasks: [
            'Start a meditation practice',
            'Create a workout routine',
            'Read 10 pages daily'
          ]
        }
      ];
      
      const mockRoadmap = {
        short_term: [
          'Complete Python fundamentals course',
          'Build 2 small projects',
          'Join a coding community'
        ],
        medium_term: [
          'Learn advanced algorithms',
          'Contribute to open source',
          'Get first freelance client'
        ],
        long_term: [
          'Become senior developer',
          'Lead development team',
          'Start tech company'
        ]
      };
      
      setSkillAssessment(mockAssessment);
      setRecommendations(mockRecommendations);
      setRoadmap(mockRoadmap);
    } catch (error) {
      console.error('Error fetching skill assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDevelopmentRoadmap = async () => {
    setLoading(true);
    try {
      const response = await api.get('/ai/skill-assessment');
      setRoadmap(response.data.roadmap);
    } catch (error) {
      console.error('Error fetching roadmap:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const response = await api.post('/ai/goal-setting', {
        goal_type: 'skills',
        timeframe: 'monthly',
        interests: []
      });
      setGoals(response.data.goals);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = (skill, value) => {
    setProgress(prev => ({
      ...prev,
      [skill]: value
    }));
  };

  const getSkillLevel = (score) => {
    if (score >= 8) return { level: 'Expert', color: 'text-green-400' };
    if (score >= 5) return { level: 'Intermediate', color: 'text-yellow-400' };
    return { level: 'Beginner', color: 'text-red-400' };
  };

  const SkillProgressBar = ({ skill, score, maxScore = 10 }) => {
    const percentage = (score / maxScore) * 100;
    const skillInfo = getSkillLevel(score);
    const [isHovered, setIsHovered] = useState(false);
    
    return (
      <div 
        className="bg-gray-700/50 backdrop-blur-sm rounded-xl p-4 border border-gray-600/50 hover:border-gray-500/50 transition-all duration-500 ease-out hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-1 hover:scale-105 transform"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:scale-110 hover:text-purple-400 transform">{skill}</span>
          <span className={`px-2 py-1 text-xs rounded-full font-medium transition-all duration-300 ease-in-out hover:scale-110 transform ${
            skillInfo.level === 'Expert' ? 'bg-green-900/50 text-green-400 hover:bg-green-800/50' :
            skillInfo.level === 'Intermediate' ? 'bg-yellow-900/50 text-yellow-400 hover:bg-yellow-800/50' :
            'bg-red-900/50 text-red-400 hover:bg-red-800/50'
          }`}>{skillInfo.level}</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-3 overflow-hidden transition-all duration-300 ease-in-out hover:bg-gray-500">
          <div
            className={`h-full transition-all duration-1000 ease-out rounded-full hover:shadow-lg ${
              skillInfo.level === 'Expert' ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400' :
              skillInfo.level === 'Intermediate' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400' :
              'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400'
            }`}
            style={{ 
              width: isHovered ? `${Math.min(percentage + 5, 100)}%` : `${percentage}%`,
              transitionDuration: isHovered ? '300ms' : '1000ms'
            }}
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-400 transition-all duration-300 ease-in-out hover:text-gray-300">Score: {score}/{maxScore}</span>
          <span className="text-xs font-medium text-gray-300 transition-all duration-300 ease-in-out hover:text-gray-200">{percentage.toFixed(0)}% Complete</span>
        </div>
      </div>
    );
  };

  const RecommendationCard = ({ recommendation }) => {
    const category = skillCategories[recommendation.category];
    
    return (
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300`}>
            <span className="text-white text-xl">{category.icon}</span>
          </div>
          <div>
            <h4 className="font-bold text-white text-lg">{category.name}</h4>
            <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
              recommendation.priority === 'high' ? 'bg-red-900/50 text-red-400' :
              recommendation.priority === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
              'bg-green-900/50 text-green-400'
            }`}>{recommendation.priority} priority</span>
          </div>
        </div>
        
        <p className="text-gray-300 mb-4 font-medium">{recommendation.reason}</p>
        
        <div className="space-y-3">
          <p className="text-sm font-semibold text-white">Suggested Tasks:</p>
          <div className="space-y-2">
            {recommendation.suggested_tasks.map((task, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500 focus:ring-2"
                />
                <span className="text-sm text-gray-300">{task}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Enhanced 3D Skill Visualization Component with Smooth Animations
  const SkillVisualization3D = ({ skills }) => {
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [isAnimating, setIsAnimating] = useState(true);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    
    useEffect(() => {
      if (isAnimating) {
        const interval = setInterval(() => {
          setRotation(prev => ({ 
            x: prev.x + 0.3, 
            y: prev.y + 0.8 
          }));
        }, 50);
        return () => clearInterval(interval);
      }
    }, [isAnimating]);
    
    const handleMouseMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -30;
      setMousePosition({ x, y });
    };
    
    const skillEntries = Object.entries(skills);
    const radius = 150;
    
    return (
      <div className="relative w-full h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-gray-700 transition-all duration-500 ease-in-out hover:border-gray-600">
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="relative w-80 h-80 transition-transform duration-300 ease-out"
            style={{ 
              transform: `rotateX(${rotation.x + mousePosition.y}deg) rotateY(${rotation.y + mousePosition.x}deg)`, 
              transformStyle: 'preserve-3d' 
            }}
            onMouseEnter={() => setIsAnimating(false)}
            onMouseLeave={() => {
              setIsAnimating(true);
              setMousePosition({ x: 0, y: 0 });
            }}
            onMouseMove={handleMouseMove}
          >
            {skillEntries.map(([skill, score], index) => {
              const angle = (index / skillEntries.length) * 2 * Math.PI;
              const x = Math.cos(angle) * radius;
              const z = Math.sin(angle) * radius;
              const y = (score / 10 - 0.5) * 100;
              
              return (
                <div
                  key={skill}
                  className="absolute w-20 h-20 bg-gray-700/90 backdrop-blur-lg rounded-xl border-2 border-gray-600/50 shadow-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-500 ease-out hover:scale-125 hover:shadow-2xl hover:shadow-purple-500/30"
                  style={{
                    transform: `translate3d(${x}px, ${y}px, ${z}px)`,
                    left: '50%',
                    top: '50%',
                    marginLeft: '-40px',
                    marginTop: '-40px',
                    transitionDelay: `${index * 50}ms`
                  }}
                  onMouseEnter={() => setHoveredSkill(skill)}
                  onMouseLeave={() => setHoveredSkill(null)}
                >
                  <div className="text-xs font-bold text-white text-center transition-all duration-300 ease-in-out hover:scale-110">{skill}</div>
                  <div className={`text-lg font-bold transition-all duration-300 ease-in-out hover:scale-110 ${
                    score >= 8 ? 'text-green-400 hover:text-green-300' :
                    score >= 5 ? 'text-yellow-400 hover:text-yellow-300' :
                    'text-red-400 hover:text-red-300'
                  }`}>{score}</div>
                </div>
              );
            })}
            
            {/* Enhanced center sphere */}
            <div className="absolute w-24 h-24 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full shadow-2xl transition-all duration-500 ease-out hover:scale-110 hover:shadow-purple-500/50" 
                 style={{
                   transform: 'translate3d(0, 0, 0)',
                   left: '50%',
                   top: '50%',
                   marginLeft: '-48px',
                   marginTop: '-48px'
                 }}>
              <div className="w-full h-full flex items-center justify-center transition-all duration-300 ease-in-out">
                <div className="text-white text-center">
                  <div className="text-2xl font-bold transition-all duration-300 ease-in-out hover:scale-110">Skills</div>
                  <div className="text-xs transition-all duration-300 ease-in-out hover:scale-110">3D View</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {hoveredSkill && (
          <div className="absolute top-4 right-4 bg-gray-800/95 backdrop-blur-lg rounded-xl p-4 shadow-xl border border-gray-600 transition-all duration-300 ease-in-out transform scale-100 hover:scale-105">
            <h3 className="font-bold text-white mb-2 transition-all duration-300 ease-in-out hover:text-purple-400">{hoveredSkill}</h3>
            <div className="text-sm text-gray-300 transition-all duration-300 ease-in-out hover:text-gray-200">Level: {getSkillLevel(skills[hoveredSkill]).level}</div>
            <div className="text-sm text-gray-300 transition-all duration-300 ease-in-out hover:text-gray-200">Score: {skills[hoveredSkill]}/10</div>
          </div>
        )}
      </div>
    );
  };

  // AI Insights Component
  const AIInsightsPanel = () => {
    const insights = {
      overall_score: 6.5,
      growth_potential: 85,
      recommended_focus: 'Technical Skills',
      learning_velocity: 'Fast',
      skill_gaps: ['Marketing', 'Financial Planning'],
      strengths: ['Problem Solving', 'Programming'],
      next_milestone: 'Advanced Developer',
      estimated_timeline: '6 months'
    };
    
    return (
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent bg-clip-text mb-6">
          AI-Powered Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Overall Score</span>
              <span className="text-2xl font-bold text-indigo-400">{insights.overall_score}/10</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
          
          <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Growth Potential</span>
              <span className="text-2xl font-bold text-green-400">{insights.growth_potential}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
          
          <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50">
            <div className="text-sm font-medium text-gray-300 mb-2">Recommended Focus</div>
            <div className="text-lg font-bold text-purple-400">{insights.recommended_focus}</div>
          </div>
          
          <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50">
            <div className="text-sm font-medium text-gray-300 mb-2">Learning Velocity</div>
            <div className="text-lg font-bold text-orange-400">{insights.learning_velocity}</div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-red-900/50 to-red-800/50 rounded-xl p-4 border border-red-700/50">
            <h4 className="text-sm font-bold text-red-400 mb-2">Skill Gaps</h4>
            <div className="space-y-1">
              {insights.skill_gaps.map((gap, idx) => (
                <div key={idx} className="text-xs text-red-300">- {gap}</div>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 rounded-xl p-4 border border-green-700/50">
            <h4 className="text-sm font-bold text-green-400 mb-2">Strengths</h4>
            <div className="space-y-1">
              {insights.strengths.map((strength, idx) => (
                <div key={idx} className="text-xs text-green-300">- {strength}</div>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 rounded-xl p-4 border border-blue-700/50">
            <h4 className="text-sm font-bold text-blue-400 mb-2">Next Milestone</h4>
            <div className="text-xs text-blue-300">{insights.next_milestone}</div>
            <div className="text-xs text-blue-400 mt-1">{insights.estimated_timeline}</div>
          </div>
        </div>
      </div>
    );
  };

  const RoadmapTimeline = ({ roadmap }) => {
    const timelineItems = [
      { title: 'Short Term', items: roadmap?.short_term || [], color: 'from-green-500 to-emerald-500' },
      { title: 'Medium Term', items: roadmap?.medium_term || [], color: 'from-blue-500 to-cyan-500' },
      { title: 'Long Term', items: roadmap?.long_term || [], color: 'from-purple-500 to-pink-500' }
    ];

    return (
      <div className="space-y-6">
        {timelineItems.map((phase, idx) => (
          <div key={idx} className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 bg-gradient-to-br ${phase.color} rounded-full flex items-center justify-center`}>
                <span className="text-white text-sm font-bold">{idx + 1}</span>
              </div>
              <h3 className="text-lg font-semibold text-white">{phase.title}</h3>
            </div>
            
            <div className="ml-11 space-y-2">
              {phase.items.map((item, itemIdx) => (
                <div key={itemIdx} className="flex items-start gap-3 p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
                  <div className={`w-2 h-2 bg-gradient-to-br ${phase.color} rounded-full mt-1.5`}></div>
                  <p className="text-sm text-zinc-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const GoalCard = ({ goal }) => {
    const difficultyColors = {
      low: 'from-green-500 to-emerald-500',
      medium: 'from-yellow-500 to-orange-500',
      high: 'from-red-500 to-pink-500'
    };

    return (
      <div className="p-4 bg-zinc-800 border border-zinc-700 rounded-xl space-y-3">
        <div className="flex items-start justify-between">
          <h4 className="font-semibold text-white">{goal.title}</h4>
          <span className={`px-2 py-1 text-xs rounded-full bg-gradient-to-r ${difficultyColors[goal.difficulty]} text-white`}>
            {goal.difficulty}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            {goal.deadline}
          </span>
        </div>
        
        <div className="w-full bg-zinc-700 rounded-full h-2">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: '30%' }}></div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 p-8 transform transition-all duration-700 ease-in-out hover:scale-101">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent bg-clip-text transition-all duration-700 ease-in-out hover:from-purple-300 hover:to-indigo-300">
          Ultra-Advanced Skill Development Center
        </h2>
        <div className="flex gap-3">
          {Object.entries(skillCategories).map(([key, category], index) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 text-sm rounded-xl border transition-all duration-500 ease-out font-medium transform ${
                activeTab === key
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-500 text-white shadow-lg hover:shadow-purple-500/50 hover:-translate-y-1 hover:scale-105'
                  : 'bg-gray-700/50 border-gray-600/50 text-gray-400 hover:text-white hover:bg-gray-700/70 hover:scale-105'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <span className="flex items-center gap-2 transition-transform duration-300 ease-in-out hover:scale-110">
                <span className="text-lg transition-transform duration-300 ease-in-out hover:rotate-12">{category.icon}</span>
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && activeTab === 'assessment' && (
        <div className="space-y-8">
          {/* 3D Skill Visualization */}
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent bg-clip-text mb-4">
              Interactive 3D Skill Visualization
            </h3>
            <SkillVisualization3D skills={skillAssessment || {}} />
          </div>

          {/* AI Insights Panel */}
          <AIInsightsPanel />

          {/* Traditional Assessment */}
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent bg-clip-text mb-4">
              Detailed Skills Assessment
            </h3>
            {skillAssessment && Object.keys(skillAssessment).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(skillAssessment).map(([skill, score]) => (
                  <SkillProgressBar key={skill} skill={skill} score={score} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Complete more tasks to get your skill assessment</p>
              </div>
            )}
          </div>

          {recommendations.length > 0 && (
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent bg-clip-text mb-4">
                AI-Powered Personalized Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec, idx) => (
                  <RecommendationCard key={idx} recommendation={rec} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && activeTab === 'roadmap' && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-6">Development Roadmap</h3>
          {roadmap ? (
            <RoadmapTimeline roadmap={roadmap} />
          ) : (
            <div className="text-center py-8">
              <p className="text-zinc-400">Your personalized roadmap is being generated...</p>
            </div>
          )}
        </div>
      )}

      {!loading && activeTab === 'goals' && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Skill Development Goals</h3>
          {goals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal, idx) => (
                <GoalCard key={idx} goal={goal} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-zinc-400">Setting up your personalized goals...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
