import React from 'react';
import { Link } from 'react-router-dom';
import FaceLogin from '../components/FaceLogin';

export default function FaceLoginPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[30%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-4xl">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-4 shadow-lg shadow-indigo-500/25">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">Welcome to DTMS</h1>
          <p className="text-zinc-400 text-lg">Secure authentication using facial recognition</p>
        </div>

        {/* Face Login Component */}
        <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800/60 rounded-2xl p-8 shadow-2xl mb-6">
          <FaceLogin />
        </div>

        {/* Alternative Login Options */}
        <div className="text-center">
          <p className="text-zinc-500 text-sm mb-4">
            Prefer traditional login methods?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/login"
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl text-sm transition-all duration-200 border border-zinc-700"
            >
              Login with Email
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-500/20"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-zinc-600 text-xs">
            Having trouble with face login? Make sure you have good lighting and your camera is properly positioned.
          </p>
        </div>
      </div>
    </div>
  );
}
