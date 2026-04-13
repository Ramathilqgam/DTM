import React from 'react';
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import SmartAutomation from '../components/SmartAutomation';

export default function SmartAutomationPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Enhanced Animated Dark Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-3xl opacity-40 animate-pulse transition-all duration-2000 ease-in-out" />
        <div className="absolute bottom-[-30%] left-[-10%] w-80 h-80 bg-purple-600/10 rounded-full blur-3xl opacity-30 animate-pulse transition-all duration-3000 ease-in-out" />
        <div className="absolute top-[40%] left-[50%] w-72 h-72 bg-indigo-600/5 rounded-full blur-3xl opacity-20 animate-pulse transition-all duration-2500 ease-in-out" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-black/20 to-black/40 transition-all duration-1000 ease-in-out" />
      </div>

      <div className="relative z-10">
        {/* Enhanced Dark Header with glassmorphism */}
        <div className="border-b border-gray-800/50 backdrop-blur-xl bg-black/30 transition-all duration-700 ease-in-out">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xl font-bold shadow-xl hover:shadow-blue-500/50 transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-105">
                  <svg className="w-7 h-7 text-white transition-transform duration-300 ease-in-out hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div className="transform transition-all duration-500 ease-in-out hover:translate-x-1">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent bg-clip-text transition-all duration-700 ease-in-out hover:from-blue-300 hover:to-purple-300">
                    Smart Automation
                  </h1>
                  <p className="text-gray-400 transition-all duration-500 ease-in-out hover:text-gray-300">Configure automated workflows and intelligent task management</p>
                </div>
              </div>
              <nav className="flex items-center gap-6">
                <Link to="/dashboard" className="text-gray-400 hover:text-white transition-all duration-300 ease-in-out font-medium hover:scale-105 hover:text-blue-400 transform">
                  Dashboard
                </Link>
                <Link to="/tasks" className="text-gray-400 hover:text-white transition-all duration-300 ease-in-out font-medium hover:scale-105 hover:text-blue-400 transform">
                  Tasks
                </Link>
                <Link to="/ai-assistant" className="text-gray-400 hover:text-white transition-all duration-300 ease-in-out font-medium hover:scale-105 hover:text-blue-400 transform">
                  AI Assistant
                </Link>
                <button
                  onClick={logout}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl text-sm font-semibold transition-all duration-500 ease-out shadow-lg hover:shadow-red-500/50 hover:-translate-y-0.5 hover:scale-105 transform"
                >
                  Logout
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <SmartAutomation />
          
          {/* Enhanced Additional Information Section */}
          <div className="mt-12">
            <div className="text-center mb-8 transform transition-all duration-700 ease-in-out hover:scale-105">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent bg-clip-text mb-4 transition-all duration-500 ease-in-out hover:from-blue-300 hover:to-purple-300">
                Why Use Smart Automation?
              </h2>
              <p className="text-gray-400 transition-all duration-500 ease-in-out hover:text-gray-300">Streamline your workflow and boost productivity with intelligent automation</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-2 hover:scale-105 transform">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ease-out shadow-lg group-hover:shadow-blue-500/50 transform">
                  <svg className="w-8 h-8 text-white transition-transform duration-300 ease-in-out group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 transition-all duration-300 ease-in-out group-hover:text-blue-400 transform group-hover:translate-x-1">Save Time</h3>
                <p className="text-gray-400 mb-6 transition-all duration-300 ease-in-out group-hover:text-gray-300">Automate repetitive tasks and focus on what matters most</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-300 transition-all duration-300 ease-in-out group-hover:text-gray-200">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span>Reduce manual work by 80%</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300 transition-all duration-300 ease-in-out group-hover:text-gray-200">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span>Eliminate human errors</span>
                  </div>
                </div>
              </div>
              
              <div className="group bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-purple-500/30 hover:-translate-y-2 hover:scale-105 transform">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ease-out shadow-lg group-hover:shadow-purple-500/50 transform">
                  <svg className="w-8 h-8 text-white transition-transform duration-300 ease-in-out group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 transition-all duration-300 ease-in-out group-hover:text-purple-400 transform group-hover:translate-x-1">Smart Workflows</h3>
                <p className="text-gray-400 mb-6 transition-all duration-300 ease-in-out group-hover:text-gray-300">Create intelligent workflows that adapt to your needs</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-300 transition-all duration-300 ease-in-out group-hover:text-gray-200">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span>Trigger-based automation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300 transition-all duration-300 ease-in-out group-hover:text-gray-200">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span>Conditional logic support</span>
                  </div>
                </div>
              </div>
              
              <div className="group bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-green-500/30 hover:-translate-y-2 hover:scale-105 transform">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ease-out shadow-lg group-hover:shadow-green-500/50 transform">
                  <svg className="w-8 h-8 text-white transition-transform duration-300 ease-in-out group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 transition-all duration-300 ease-in-out group-hover:text-green-400 transform group-hover:translate-x-1">Never Miss Deadlines</h3>
                <p className="text-gray-400 mb-6 transition-all duration-300 ease-in-out group-hover:text-gray-300">Automatic reminders and escalations for important tasks</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-300 transition-all duration-300 ease-in-out group-hover:text-gray-200">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span>Smart notifications</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300 transition-all duration-300 ease-in-out group-hover:text-gray-200">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span>Automatic escalations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
