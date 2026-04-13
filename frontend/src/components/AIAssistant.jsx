import { useState, useRef, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../hooks/useAuth';

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [contextData, setContextData] = useState({});
  const [typingSpeed, setTypingSpeed] = useState(30);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Initialize with enhanced welcome message
    setMessages([{
      id: 1,
      type: 'ai',
      content: "🚀 **Enhanced AI Assistant Online!**\n\nI'm your advanced AI companion with real-time capabilities! I can help you with:\n\n💬 **Instant Answers** - Real-time responses to any question\n📊 **Task Analysis** - Live insights from your current tasks\n🎯 **Goal Setting** - Dynamic goal recommendations\n📈 **Performance Tracking** - Real-time productivity metrics\n🤝 **Collaboration** - Team insights and suggestions\n\nI have access to your real-time data and can provide instant, personalized responses. Ask me anything!\n\n*Try: 'How am I performing today?' or 'What should I focus on right now?'*",
      timestamp: new Date().toISOString()
    }]);
    
    // Load initial context data
    loadContextData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadContextData = useCallback(async () => {
    try {
      const [tasksResponse, analyticsResponse] = await Promise.all([
        api.get('/tasks/'),
        api.get('/analytics/real-time')
      ]);
      
      setContextData({
        currentTasks: tasksResponse.data || [],
        analytics: analyticsResponse.data || {},
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.log('Context data loading failed, using cached data');
    }
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageContent = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      // Enhanced API call with real-time context
      const response = await api.post('/ai/enhanced-chat', {
        message: messageContent,
        context: {
          current_tasks: contextData.currentTasks,
          analytics: contextData.analytics,
          user_preferences: {
            real_time_enabled: isRealTimeEnabled,
            response_style: 'detailed',
            include_suggestions: true
          },
          timestamp: new Date().toISOString()
        }
      }, {
        signal: abortControllerRef.current.signal,
        timeout: 15000 // 15 second timeout for faster responses
      });

      // Simulate typing effect for better UX
      const aiResponse = response.data.response;
      await simulateTyping(aiResponse);

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: response.data.timestamp,
        metadata: {
          confidence: response.data.confidence,
          sources: response.data.sources,
          processing_time: response.data.processing_time
        }
      };

      setMessages(prev => [...prev, aiMessage]);
      setSuggestions(response.data.suggestions || []);
      
      // Update context data after successful interaction
      if (isRealTimeEnabled) {
        loadContextData();
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
        return;
      }
      
      console.error('Error sending message:', error);
      
      // Fallback to instant response with cached data
      const fallbackResponse = generateInstantResponse(messageContent);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: fallbackResponse,
        timestamp: new Date().toISOString(),
        is_fallback: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const simulateTyping = async (text) => {
    const words = text.split(' ');
    let currentText = '';
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];
      
      // Show partial message while typing
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.type === 'ai' && !lastMessage.isComplete) {
          lastMessage.content = currentText + '...';
        }
        return newMessages;
      });
      
      await new Promise(resolve => setTimeout(resolve, typingSpeed));
    }
    
    // Mark message as complete
    setMessages(prev => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage && lastMessage.type === 'ai') {
        lastMessage.content = text;
        lastMessage.isComplete = true;
      }
      return newMessages;
    });
  };

  const generateInstantResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    const currentTasks = contextData.currentTasks || [];
    const analytics = contextData.analytics || {};
    
    // Real-time task-based responses
    if (lowerMessage.includes('task') || lowerMessage.includes('todo')) {
      const pendingTasks = currentTasks.filter(task => task.status === 'pending');
      const inProgressTasks = currentTasks.filter(task => task.status === 'in_progress');
      const completedTasks = currentTasks.filter(task => task.status === 'completed');
      
      return `📊 **Real-time Task Overview**\n\n**Current Status:**\n• 🔄 In Progress: ${inProgressTasks.length}\n• ⏳ Pending: ${pendingTasks.length}\n• ✅ Completed: ${completedTasks.length}\n\n**Immediate Focus:**\n${inProgressTasks.slice(0, 3).map(task => `• ${task.title}`).join('\n')}\n\n**Recommendation:** ${pendingTasks.length > 0 ? 'Consider starting with high-priority pending tasks.' : 'Great job staying on top of your tasks!'}`;
    }
    
    // Performance-based responses
    if (lowerMessage.includes('performance') || lowerMessage.includes('how am i doing')) {
      const completionRate = analytics.completion_rate || 0;
      const productivity = analytics.productivity_score || 0;
      
      return `📈 **Performance Analytics**\n\n**Current Metrics:**\n• 🎯 Completion Rate: ${completionRate}%\n• ⚡ Productivity Score: ${productivity}/100\n• 📊 Tasks Today: ${analytics.tasks_today || 0}\n\n**Performance Level:** ${productivity >= 80 ? '🔥 Excellent!' : productivity >= 60 ? '👍 Good!' : '📈 Room for improvement!'}\n\n**Quick Tip:** ${productivity >= 80 ? 'Maintain this momentum!' : 'Focus on completing 1-2 high-priority tasks to boost your score.'}`;
    }
    
    // Goal-oriented responses
    if (lowerMessage.includes('goal') || lowerMessage.includes('focus')) {
      const highPriorityTasks = currentTasks.filter(task => task.priority === 'high');
      const overdueTasks = currentTasks.filter(task => {
        if (!task.due_date) return false;
        return new Date(task.due_date) < new Date() && task.status !== 'completed';
      });
      
      return `🎯 **Focus Recommendations**\n\n**Priority Actions:**\n${highPriorityTasks.slice(0, 3).map(task => `• 🔥 ${task.title} (${task.priority} priority)`).join('\n')}\n\n**Attention Needed:**\n${overdueTasks.length > 0 ? `⚠️ ${overdueTasks.length} overdue task(s) - review these first!` : '✅ No overdue tasks - well done!'}\n\n**Today's Focus:** Start with your highest priority task to maximize productivity.`;
    }
    
    // General intelligent response
    return `🤖 **Instant Analysis**\n\nBased on your current data:\n• 📝 You have ${currentTasks.length} total tasks\n• 🔄 ${currentTasks.filter(t => t.status === 'in_progress').length} in progress\n• ⏰ ${currentTasks.filter(t => t.status === 'pending').length} pending\n\n**Quick Insight:** ${currentTasks.length > 5 ? 'You have a busy schedule - consider prioritizing high-impact tasks.' : 'You have a manageable workload - focus on quality completion.'}\n\nAsk me about specific tasks, performance metrics, or goal setting for detailed guidance!`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getSkillAssessment = async () => {
    setIsLoading(true);
    
    try {
      const response = await api.get('/ai/skill-assessment');
      
      const assessmentMessage = {
        id: Date.now(),
        type: 'ai',
        content: `Based on your task patterns, here's your skill assessment:\n\n**Current Skills:**\n${Object.entries(response.data.current_skills).map(([skill, score]) => `-${skill}: ${score} tasks`).join('\n')}\n\n**Recommendations:**\n${response.data.recommendations.map(rec => `-${rec.category}: ${rec.reason}`).join('\n')}`,
        timestamp: response.data.assessment_date
      };

      setMessages(prev => [...prev, assessmentMessage]);

    } catch (error) {
      console.error('Error getting skill assessment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTaskRecommendations = async () => {
    setIsLoading(true);
    
    try {
      const response = await api.get('/ai/task-recommendations');
      
      const recommendationsMessage = {
        id: Date.now(),
        type: 'ai',
        content: `Here are some personalized task recommendations for you:\n\n${response.data.recommendations.map((rec, idx) => `${idx + 1}. ${rec}`).join('\n')}`,
        timestamp: response.data.timestamp
      };

      setMessages(prev => [...prev, recommendationsMessage]);

    } catch (error) {
      console.error('Error getting recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createPersonalizedGoals = async () => {
    setIsLoading(true);
    
    try {
      const response = await api.post('/ai/goal-setting', {
        goal_type: 'general',
        timeframe: 'monthly',
        interests: []
      });
      
      const goalsMessage = {
        id: Date.now(),
        type: 'ai',
        content: `I've created some personalized goals for you:\n\n**Goals:**\n${response.data.goals.map((goal, idx) => `${idx + 1}. ${goal.title} (Deadline: ${goal.deadline}, Difficulty: ${goal.difficulty})`).join('\n')}\n\n**Action Plan:**\n${response.data.action_plan.weekly_tasks.map((task, idx) => `- Week ${idx + 1}: ${task}`).join('\n')}\n\n${response.data.motivation}`,
        timestamp: response.data.created_at
      };

      setMessages(prev => [...prev, goalsMessage]);

    } catch (error) {
      console.error('Error creating goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRealTimeInsights = async () => {
    setIsLoading(true);
    
    try {
      await loadContextData();
      
      const insightsMessage = {
        id: Date.now(),
        type: 'ai',
        content: generateInstantResponse('how am i performing today'),
        timestamp: new Date().toISOString(),
        is_real_time: true
      };

      setMessages(prev => [...prev, insightsMessage]);

    } catch (error) {
      console.error('Error getting real-time insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getQuickRecommendations = async () => {
    setIsLoading(true);
    
    try {
      await loadContextData();
      
      const recommendationsMessage = {
        id: Date.now(),
        type: 'ai',
        content: generateInstantResponse('what should I focus on right now'),
        timestamp: new Date().toISOString(),
        is_real_time: true
      };

      setMessages(prev => [...prev, recommendationsMessage]);

    } catch (error) {
      console.error('Error getting recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRealTimeMode = () => {
    setIsRealTimeEnabled(!isRealTimeEnabled);
    
    const toggleMessage = {
      id: Date.now(),
      type: 'ai',
      content: `🔄 **Real-time Mode ${!isRealTimeEnabled ? 'Enabled' : 'Disabled'}**\n\n${!isRealTimeEnabled ? 'I now have access to your live data and can provide instant, up-to-the-minute responses!' : 'I\'m now using cached data for faster responses. Real-time updates are disabled.'}\n\n${!isRealTimeEnabled ? 'Ask me anything for instant insights!' : 'Enable real-time mode again for live data access.'}`,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, toggleMessage]);
  };

  
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            {isRealTimeEnabled && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-zinc-900"></div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              AI Assistant
              {isRealTimeEnabled && (
                <span className="px-2 py-0.5 bg-green-900/30 text-green-400 text-xs rounded-full border border-green-700/50">
                  Real-time
                </span>
              )}
            </h3>
            <p className="text-xs text-zinc-400">Enhanced AI with live data access</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400">Online</span>
          </div>
          {contextData.lastUpdated && (
            <div className="text-xs text-zinc-500">
              Updated: {new Date(contextData.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </div>

      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-800 text-zinc-300'
              }`}
            >
              <div>
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                  {message.is_real_time && (
                    <span className="px-2 py-0.5 bg-green-900/30 text-green-400 text-xs rounded-full border border-green-700/50">
                      Live
                    </span>
                  )}
                  {message.is_fallback && (
                    <span className="px-2 py-0.5 bg-yellow-900/30 text-yellow-400 text-xs rounded-full border border-yellow-700/50">
                      Offline
                    </span>
                  )}
                  {message.metadata && (
                    <span className="text-xs text-zinc-500">
                      ⚡ {message.metadata.processing_time || 'Fast'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 px-4 py-3 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3">
            <p className="text-xs text-zinc-400 mb-2">Suggestions:</p>
            <div className="space-y-1">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputMessage(suggestion)}
                  className="w-full text-left text-xs text-indigo-400 hover:text-indigo-300 p-2 rounded hover:bg-zinc-700/50 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Ask me anything! ${isRealTimeEnabled ? 'I have access to your live data' : 'Using cached data'}...`}
          className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 text-sm"
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !inputMessage.trim()}
          className={`px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white ${
            isRealTimeEnabled 
              ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 shadow-lg shadow-green-500/20'
              : 'bg-indigo-600 hover:bg-indigo-500'
          }`}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
