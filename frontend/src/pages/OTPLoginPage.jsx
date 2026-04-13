import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

export default function OTPLoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOTP, setShowOTP] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.post('/otp/send', { email });
      
      if (response.data.message) {
        setSuccess('OTP sent successfully! Please check your email.');
        setShowOTP(true);
        
        // Navigate to OTP verification page after 2 seconds
        setTimeout(() => {
          navigate('/otp-verify', { state: { email } });
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[30%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-4 shadow-lg shadow-indigo-500/25">
            <EmailIcon />
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">OTP Login</h1>
          <p className="text-zinc-500 text-sm mt-1">Secure login with one-time password</p>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800/60 rounded-2xl p-8 shadow-2xl">
          {/* Success Message */}
          {success && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-green-900/30 border border-green-800/50 text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-900/30 border border-red-800/50 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2 tracking-wide uppercase">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                disabled={loading || showOTP}
                className="w-full px-4 py-3 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-indigo-500/70 focus:bg-zinc-800 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || showOTP || !email}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending OTP...
                </span>
              ) : showOTP ? (
                'OTP Sent Successfully!'
              ) : (
                'Send OTP'
              )}
            </button>
          </form>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
            <h3 className="text-sm font-medium text-zinc-300 mb-2">How it works:</h3>
            <ol className="text-xs text-zinc-400 space-y-1">
              <li>1. Enter your email address</li>
              <li>2. We'll send a 6-digit OTP code</li>
              <li>3. Enter the code to verify your identity</li>
              <li>4. Secure access to your account</li>
            </ol>
          </div>

          {/* Alternative Login Options */}
          <div className="mt-6 text-center">
            <p className="text-zinc-500 text-sm mb-4">Or continue with:</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/login"
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl text-sm transition-all duration-200 border border-zinc-700"
              >
                Password Login
              </Link>
              <Link
                to="/face-login"
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-500/20"
              >
                Face Login
              </Link>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-zinc-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
