import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import SkillDevelopment from "../components/SkillDevelopment";

export default function SkillDevelopmentPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 transition-all duration-1000 ease-in-out">
      {/* Enhanced Animated Dark Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-purple-600/10 rounded-full blur-3xl opacity-40 animate-pulse transition-all duration-2000 ease-in-out" />
        <div className="absolute bottom-[-30%] left-[-10%] w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl opacity-30 animate-pulse transition-all duration-3000 ease-in-out" />
        <div className="absolute top-[40%] left-[50%] w-72 h-72 bg-pink-600/5 rounded-full blur-3xl opacity-20 animate-pulse transition-all duration-2500 ease-in-out" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-black/20 to-black/40 transition-all duration-1000 ease-in-out" />
      </div>

      <div className="relative z-10">
        {/* Enhanced Dark Header with glassmorphism */}
        <div className="border-b border-gray-800/50 backdrop-blur-xl bg-black/30 transition-all duration-700 ease-in-out">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-xl font-bold shadow-xl hover:shadow-purple-500/50 transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-105">
                  <svg className="w-7 h-7 text-white transition-transform duration-300 ease-in-out hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <div className="transform transition-all duration-500 ease-in-out hover:translate-x-1">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent bg-clip-text transition-all duration-700 ease-in-out">
                    Skill Development
                  </h1>
                  <p className="text-gray-400 transition-all duration-500 ease-in-out hover:text-gray-300">Track your skills and get personalized AI-powered development plans</p>
                </div>
              </div>
              <nav className="flex items-center gap-6">
                <Link to="/dashboard" className="text-gray-400 hover:text-white transition-all duration-300 ease-in-out font-medium hover:scale-105 hover:text-purple-400 transform">
                  Dashboard
                </Link>
                <Link to="/tasks" className="text-gray-400 hover:text-white transition-all duration-300 ease-in-out font-medium hover:scale-105 hover:text-purple-400 transform">
                  Tasks
                </Link>
                <Link to="/ai-assistant" className="text-gray-400 hover:text-white transition-all duration-300 ease-in-out font-medium hover:scale-105 hover:text-purple-400 transform">
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
          <SkillDevelopment />
          
          {/* Enhanced Additional Resources - Dark Mode with Smooth Animations */}
          <div className="mt-12">
            <div className="text-center mb-8 transform transition-all duration-700 ease-in-out hover:scale-105">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent bg-clip-text mb-4 transition-all duration-500 ease-in-out hover:from-purple-300 hover:to-indigo-300">
                Additional Learning Resources
              </h2>
              <p className="text-gray-400 transition-all duration-500 ease-in-out hover:text-gray-300">Expand your knowledge with curated materials and community support</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-2 hover:scale-105 transform">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ease-out shadow-lg group-hover:shadow-blue-500/50 transform">
                  <svg className="w-8 h-8 text-white transition-transform duration-300 ease-in-out group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 transition-all duration-300 ease-in-out group-hover:text-blue-400 transform group-hover:translate-x-1">Learning Resources</h3>
                <p className="text-gray-400 mb-6 transition-all duration-300 ease-in-out group-hover:text-gray-300">Access curated learning materials and courses from industry experts</p>
                <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-semibold transition-all duration-500 ease-out shadow-lg hover:shadow-blue-500/70 hover:-translate-y-1 hover:scale-105 transform">
                  Explore Resources
                </button>
              </div>
              
              <div className="group bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-purple-500/30 hover:-translate-y-2 hover:scale-105 transform">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ease-out shadow-lg group-hover:shadow-purple-500/50 transform">
                  <svg className="w-8 h-8 text-white transition-transform duration-300 ease-in-out group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 transition-all duration-300 ease-in-out group-hover:text-purple-400 transform group-hover:translate-x-1">Community</h3>
                <p className="text-gray-400 mb-6 transition-all duration-300 ease-in-out group-hover:text-gray-300">Connect with peers, share experiences, and learn from others</p>
                <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-500 ease-out shadow-lg hover:shadow-purple-500/70 hover:-translate-y-1 hover:scale-105 transform">
                  Join Community
                </button>
              </div>
              
              <div className="group bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-green-500/30 hover:-translate-y-2 hover:scale-105 transform">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ease-out shadow-lg group-hover:shadow-green-500/50 transform">
                  <svg className="w-8 h-8 text-white transition-transform duration-300 ease-in-out group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 transition-all duration-300 ease-in-out group-hover:text-green-400 transform group-hover:translate-x-1">Progress Analytics</h3>
                <p className="text-gray-400 mb-6 transition-all duration-300 ease-in-out group-hover:text-gray-300">Detailed insights into your learning journey and skill progression</p>
                <button className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-xl font-semibold transition-all duration-500 ease-out shadow-lg hover:shadow-green-500/70 hover:-translate-y-1 hover:scale-105 transform">
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
