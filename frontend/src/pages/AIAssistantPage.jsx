import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AIAssistant from "../components/AIAssistant";
import AudioRecorder from "../components/AudioRecorder";
import AITaskAssistant from "../components/AITaskAssistant";
import ProductivityInsights from "../components/ProductivityInsights";

export default function AIAssistantPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('chat');

  const handleTranscription = (transcription) => {
    console.log('Transcription received:', transcription);
    // You could automatically send this to the AI assistant
  };

  const handleAudioSaved = (audioUrl) => {
    console.log('Audio saved:', audioUrl);
  };

  const handleTasksGenerated = (tasks) => {
    console.log('Tasks generated:', tasks);
    // Could show a notification or update UI
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a2e] to-[#16213e] text-white">
      {/* Header */}
      <div className="border-b border-zinc-800/50 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xl font-bold">
                AI
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI Assistant & Voice Features</h1>
                <p className="text-sm text-gray-400">Get personalized guidance and record voice memos</p>
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <Link to="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link to="/tasks" className="text-zinc-400 hover:text-white transition-colors">
                Tasks
              </Link>
              <Link to="/skill-development" className="text-zinc-400 hover:text-white transition-colors">
                Skills
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-zinc-900/50 p-1 rounded-xl max-w-2xl">
          {[
            { id: 'chat', label: 'AI Chat', icon: 'chat' },
            { id: 'tasks', label: 'Task Assistant', icon: 'assignment' },
            { id: 'insights', label: 'Productivity Insights', icon: 'analytics' },
            { id: 'voice', label: 'Voice Features', icon: 'mic' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'chat' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Assistant */}
              <div className="space-y-6">
                <AIAssistant />
                
                {/* Quick Tips */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">AI Assistant Tips</h3>
                  <div className="space-y-3 text-sm text-zinc-300">
                    <div className="flex items-start gap-3">
                      <span className="text-indigo-400">1.</span>
                      <p>Ask about skill development and get personalized recommendations</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-indigo-400">2.</span>
                      <p>Get task suggestions based on your current progress</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-indigo-400">3.</span>
                      <p>Receive goal-setting assistance and action plans</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-indigo-400">4.</span>
                      <p>Chat about productivity and time management strategies</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Chat Features */}
              <div className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">AI Capabilities</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white">psychology</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Smart Analysis</p>
                        <p className="text-xs text-zinc-400">Analyzes your patterns and provides insights</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white">trending_up</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Skill Assessment</p>
                        <p className="text-xs text-zinc-400">Evaluates your current skill levels</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                        <span className="text-white">lightbulb</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Goal Planning</p>
                        <p className="text-xs text-zinc-400">Creates structured action plans</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <AITaskAssistant onTasksGenerated={handleTasksGenerated} />
          )}

          {activeTab === 'insights' && (
            <ProductivityInsights />
          )}

          {activeTab === 'voice' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Voice Recording */}
              <div className="space-y-6">
                <AudioRecorder 
                  onTranscriptionComplete={handleTranscription}
                  onAudioSaved={handleAudioSaved}
                />
                
                {/* Voice Features Info */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Voice Recording Features</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
                      <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Voice Memos</p>
                        <p className="text-xs text-zinc-400">Record ideas and thoughts instantly</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Auto-Transcription</p>
                        <p className="text-xs text-zinc-400">Convert voice to text automatically</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Task Creation</p>
                        <p className="text-xs text-zinc-400">Create tasks from voice memos</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Voice Integration Info */}
              <div className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Voice Integration</h3>
                  <div className="space-y-4 text-sm">
                    <div className="p-3 bg-zinc-800 rounded-lg">
                      <h4 className="font-medium text-white mb-2">Hands-Free Productivity</h4>
                      <p className="text-zinc-400">Record tasks and ideas while on the go, then let AI convert them to actionable items.</p>
                    </div>
                    
                    <div className="p-3 bg-zinc-800 rounded-lg">
                      <h4 className="font-medium text-white mb-2">Smart Transcription</h4>
                      <p className="text-zinc-400">Advanced speech recognition accurately converts your voice to text with context awareness.</p>
                    </div>
                    
                    <div className="p-3 bg-zinc-800 rounded-lg">
                      <h4 className="font-medium text-white mb-2">Multi-Language Support</h4>
                      <p className="text-zinc-400">Supports multiple languages for voice recording and transcription.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
