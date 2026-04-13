import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);
  const [attempts, setAttempts] = useState(3);
  
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate('/login');
      return;
    }
    
    // Start countdown timer
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
      setOtp(newOtp);
      
      // Focus the last filled input
      const lastFilledIndex = pastedData.length - 1;
      inputRefs.current[lastFilledIndex]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/otp/verify', {
        email: email,
        otp: otpValue
      });

      if (response.data.access_token) {
        setSuccess('OTP verified successfully! Redirecting...');
        
        // Store tokens and user data
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Redirect to dashboard after delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      const errorData = err.response?.data;
      
      if (errorData?.remaining_attempts !== undefined) {
        setAttempts(errorData.remaining_attempts);
        setError(`Invalid OTP. ${errorData.remaining_attempts} attempts remaining.`);
      } else {
        setError(errorData?.error || 'OTP verification failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/otp/resend', { email: email });
      
      if (response.data.expires_in) {
        setTimeRemaining(response.data.expires_in);
        setCanResend(false);
        setAttempts(3);
        setOtp(['', '', '', '', '', '']);
        setSuccess('OTP resent successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/login');
  };

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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Verify OTP</h1>
          <p className="text-zinc-500 text-sm mt-1">Enter the 6-digit code sent to your email</p>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800/60 rounded-2xl p-8 shadow-2xl">
          {/* Email Display */}
          <div className="mb-6 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Code sent to:</span>
              <span className="text-sm text-white font-medium">{email}</span>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-green-900/30 text-green-400 border border-green-800/50 text-sm font-medium">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-900/30 text-red-400 border border-red-800/50 text-sm font-medium">
              {error}
            </div>
          )}

          {/* OTP Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-400 mb-4">Enter OTP Code</label>
            <div className="flex gap-2 justify-between">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-12 text-center text-lg font-bold bg-zinc-800/60 border border-zinc-700/60 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/70 focus:bg-zinc-800 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                  placeholder="0"
                />
              ))}
            </div>
          </div>

          {/* Timer and Attempts */}
          <div className="mb-6 flex justify-between text-sm">
            <div className="text-zinc-400">
              {timeRemaining > 0 ? (
                <span>Time remaining: <span className="text-indigo-400 font-medium">{formatTime(timeRemaining)}</span></span>
              ) : (
                <span className="text-red-400">Code expired</span>
              )}
            </div>
            <div className="text-zinc-400">
              Attempts: <span className={`font-medium ${attempts <= 1 ? 'text-red-400' : 'text-indigo-400'}`}>{attempts}</span>
            </div>
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={isLoading || otp.join('').length !== 6}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 mb-4"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying...
              </span>
            ) : success ? (
              'Verified! Redirecting...'
            ) : (
              'Verify OTP'
            )}
          </button>

          {/* Resend OTP */}
          <div className="text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={isLoading}
                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
              >
                Resend OTP
              </button>
            ) : (
              <p className="text-zinc-500 text-sm">
                Didn't receive the code?{' '}
                <span className="text-zinc-600">Resend in {formatTime(timeRemaining)}</span>
              </p>
            )}
          </div>

          {/* Back Button */}
          <div className="mt-6 text-center">
            <button
              onClick={handleBack}
              className="text-zinc-500 hover:text-zinc-400 text-sm transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
