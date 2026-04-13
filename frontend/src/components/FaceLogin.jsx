import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import RealTimeFaceDetection from './RealTimeFaceDetection';

const FaceLogin = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const [isRegistered, setIsRegistered] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [qualityScore, setQualityScore] = useState(0);
  const [loginStatus, setLoginStatus] = useState('');
  const [mode, setMode] = useState('register'); // 'register' or 'login'
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts] = useState(3);
  const [settings, setSettings] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const [autoCaptureEnabled, setAutoCaptureEnabled] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    if (user) {
      fetchFaceLoginStatus();
      fetchLoginHistory();
    }
    fetchSettings();
  }, [user]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const fetchFaceLoginStatus = async () => {
    try {
      const response = await api.get('/face-login/status');
      setIsRegistered(response.data.is_registered);
      setLoginHistory(response.data.login_attempts || []);
    } catch (error) {
      console.error('Error fetching face login status:', error);
    }
  };

  const fetchLoginHistory = async () => {
    try {
      const response = await api.get('/face-login/attempts');
      setLoginHistory(response.data.attempts || []);
    } catch (error) {
      console.error('Error fetching login history:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get('/face-login/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setLoginStatus('Camera access denied. Please grant camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setCameraActive(false);
    }
  };

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    return canvas.toDataURL('image/jpeg', 0.9);
  }, []);

  const handleAutoCapture = useCallback(() => {
    // This will be called by RealTimeFaceDetection when auto-capture is triggered
    // We'll use a canvas element to capture the current frame
    const tempCanvas = document.createElement('canvas');
    const tempContext = tempCanvas.getContext('2d');
    
    // Get the video element from RealTimeFaceDetection
    const videoElement = document.querySelector('video');
    if (videoElement) {
      tempCanvas.width = videoElement.videoWidth;
      tempCanvas.height = videoElement.videoHeight;
      tempContext.drawImage(videoElement, 0, 0, tempCanvas.width, tempCanvas.height);
      
      const imageData = tempCanvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageData);
      
      // Auto-register if in register mode
      if (mode === 'register' && !isProcessing) {
        registerFaceWithImage(imageData);
      }
    }
  }, [mode, isProcessing]);

  const registerFaceWithImage = async (imageData) => {
    setIsProcessing(true);
    setLoginStatus('Processing face data...');

    try {
      // Test face detection first
      const detectionResult = await detectFace(imageData);
      if (!detectionResult || !detectionResult.face_detected) {
        setLoginStatus('No face detected. Please position your face clearly in the camera.');
        setIsProcessing(false);
        return;
      }

      setQualityScore(detectionResult.quality_score);
      setFaceDetected(true);

      // Register face
      const response = await api.post('/face-login/register', { image: imageData });
      
      if (response.data.success) {
        setIsRegistered(true);
        setLoginStatus('Face registered successfully!');
        setMode('login');
        fetchFaceLoginStatus();
      }
    } catch (error) {
      console.error('Error registering face:', error);
      setLoginStatus(error.response?.data?.error || 'Registration failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const detectFace = async (imageData) => {
    try {
      const response = await api.post('/face-login/test', { image: imageData });
      return response.data;
    } catch (error) {
      console.error('Error detecting face:', error);
      return null;
    }
  };

  const registerFace = async () => {
    if (!cameraActive) {
      setLoginStatus('Please start camera first');
      return;
    }

    setIsProcessing(true);
    setLoginStatus('Processing face data...');

    try {
      const imageData = captureImage();
      if (!imageData) {
        setLoginStatus('Failed to capture image');
        return;
      }

      // Test face detection first
      const detectionResult = await detectFace(imageData);
      if (!detectionResult || !detectionResult.face_detected) {
        setLoginStatus('No face detected. Please position your face clearly in the camera.');
        setIsProcessing(false);
        return;
      }

      setQualityScore(detectionResult.quality_score);
      setFaceDetected(true);

      // Register face (simplified endpoint)
      const response = await api.post('/face-login/register', { image: imageData });
      
      if (response.data.success) {
        setIsRegistered(true);
        setLoginStatus('Face registered successfully! You can now use face login.');
        setMode('login');
        // Show success and allow immediate login
      }
    } catch (error) {
      console.error('Error registering face:', error);
      setLoginStatus(error.response?.data?.error || 'Registration failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const authenticateFace = async () => {
    if (!cameraActive) {
      setLoginStatus('Please start camera first');
      return;
    }

    if (attempts >= maxAttempts) {
      setLoginStatus('Maximum attempts reached. Please try again later.');
      return;
    }

    setIsProcessing(true);
    setLoginStatus('Authenticating...');

    try {
      const imageData = captureImage();
      if (!imageData) {
        setLoginStatus('Failed to capture image');
        return;
      }

      // Test face detection first
      const detectionResult = await detectFace(imageData);
      if (!detectionResult || !detectionResult.face_detected) {
        setLoginStatus('No face detected. Please position your face clearly in the camera.');
        setIsProcessing(false);
        return;
      }

      setQualityScore(detectionResult.quality_score);
      setFaceDetected(true);

      // Authenticate face
      const response = await api.post('/face-login/authenticate', { image: imageData });
      
      if (response.data.success) {
        setLoginStatus('Authentication successful!');
        setAttempts(0);
        
        // Login user
        await login(response.data.user, response.data.access_token, response.data.refresh_token);
        
        // Navigate to dashboard
        navigate('/dashboard');
        
        // Update login history
        fetchLoginHistory();
        fetchFaceLoginStatus();
      }
    } catch (error) {
      console.error('Error authenticating face:', error);
      setAttempts(prev => prev + 1);
      const errorMessage = error.response?.data?.error || `Authentication failed. Attempts: ${attempts + 1}/${maxAttempts}`;
      setLoginStatus(errorMessage);
      
      // If max attempts reached, show fallback option
      if (attempts + 1 >= maxAttempts) {
        setLoginStatus(`${errorMessage} Please try email verification or contact support.`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const updateFaceData = async () => {
    if (!cameraActive) {
      setLoginStatus('Please start camera first');
      return;
    }

    setIsProcessing(true);
    setLoginStatus('Updating face data...');

    try {
      const imageData = captureImage();
      if (!imageData) {
        setLoginStatus('Failed to capture image');
        return;
      }

      // Test face detection first
      const detectionResult = await detectFace(imageData);
      if (!detectionResult || !detectionResult.face_detected) {
        setLoginStatus('No face detected. Please position your face clearly in the camera.');
        setIsProcessing(false);
        return;
      }

      setQualityScore(detectionResult.quality_score);
      setFaceDetected(true);

      // Update face data
      const response = await api.put('/face-login/update', { image: imageData });
      
      if (response.data.success) {
        setLoginStatus('Face data updated successfully!');
        fetchFaceLoginStatus();
      }
    } catch (error) {
      console.error('Error updating face data:', error);
      setLoginStatus(error.response?.data?.error || 'Update failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFaceData = async () => {
    if (confirm('Are you sure you want to remove your face data? You will need to register again.')) {
      try {
        await api.delete('/face-login/remove');
        setIsRegistered(false);
        setLoginStatus('Face data removed successfully');
        setMode('register');
        fetchFaceLoginStatus();
      } catch (error) {
        console.error('Error removing face data:', error);
        setLoginStatus('Failed to remove face data');
      }
    }
  };

  const getQualityColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityMessage = (score) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="bg-zinc-900/90 backdrop-blur border border-zinc-800/60 rounded-2xl shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800/60">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Face Login</h2>
            <p className="text-sm text-zinc-400">
              Secure authentication using facial recognition
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isRegistered ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-zinc-400">
              {isRegistered ? 'Registered' : 'Not Registered'}
            </span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {showInstructions && (
        <div className="p-4 bg-indigo-900/30 border-b border-indigo-800/50">
          <div className="flex items-start gap-3">
            <div className="text-indigo-400 text-xl">info</div>
            <div className="flex-1">
              <h3 className="font-semibold text-indigo-200 mb-2">Face Login Instructions</h3>
              <ul className="text-sm text-indigo-300 space-y-1">
                <li>Ensure even lighting on your face</li>
                <li>Position camera at eye level (1-2 feet away)</li>
                <li>Look directly at camera with neutral expression</li>
                <li>Remove glasses or accessories if possible</li>
                <li>Ensure your face is clearly visible and centered</li>
              </ul>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-xs text-indigo-400 hover:text-indigo-300 mt-2"
              >
                Hide instructions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Mode Selection */}
        {user && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('register')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === 'register'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {isRegistered ? 'Update Face' : 'Register Face'}
            </button>
            {isRegistered && (
              <button
                onClick={() => setMode('login')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  mode === 'login'
                    ? 'bg-green-600 text-white'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                Login with Face
              </button>
            )}
            {isRegistered && (
              <button
                onClick={removeFaceData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Remove Face Data
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enhanced Camera Section with Real-time Detection */}
          <div className="space-y-4">
            <RealTimeFaceDetection
              onFaceDetected={(detected, quality) => {
                setFaceDetected(detected);
                setQualityScore(quality);
                if (detected && quality >= 0.7 && autoCaptureEnabled) {
                  // Auto-capture when face is detected with good quality
                  handleAutoCapture();
                }
              }}
              onFaceQualityChange={(quality) => setQualityScore(quality)}
              autoCapture={autoCaptureEnabled && mode === 'register'}
              captureDelay={3000}
            />

            {/* Mode Controls */}
            {user && (
              <div className="flex gap-2">
                {mode === 'register' && (
                  <button
                    onClick={registerFace}
                    disabled={!faceDetected || qualityScore < 0.6 || isProcessing}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-semibold transition-all duration-500 ease-out shadow-lg hover:shadow-blue-500/50 hover:-translate-y-0.5 hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Processing...' : 'Register Face'}
                  </button>
                )}
                {mode === 'login' && (
                  <button
                    onClick={authenticateFace}
                    disabled={!faceDetected || qualityScore < 0.6 || isProcessing}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-xl font-semibold transition-all duration-500 ease-out shadow-lg hover:shadow-green-500/50 hover:-translate-y-0.5 hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Authenticating...' : 'Login with Face'}
                  </button>
                )}
              </div>
            )}

            {/* Auto-Capture Toggle */}
            {mode === 'register' && (
              <div className="flex items-center justify-between p-3 bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-xl">
                <span className="text-sm text-gray-300">Auto-Capture</span>
                <button
                  onClick={() => setAutoCaptureEnabled(!autoCaptureEnabled)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 ease-out ${
                    autoCaptureEnabled ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 ease-out transform ${
                    autoCaptureEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}></div>
                </button>
              </div>
            )}

            {/* Status Message */}
            {loginStatus && (
              <div className={`p-4 rounded-xl text-sm font-medium transition-all duration-500 ease-out ${
                loginStatus.includes('success') || loginStatus.includes('successfully')
                  ? 'bg-green-900/30 text-green-400 border border-green-800/50'
                  : 'bg-red-900/30 text-red-400 border border-red-800/50'
              }`}>
                {loginStatus}
              </div>
            )}

            {/* Fallback Options */}
            {attempts >= maxAttempts && (
              <div className="p-4 bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-xl">
                <p className="text-gray-400 text-sm mb-3">Face authentication failed. Try this alternative:</p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white rounded-xl font-semibold transition-all duration-500 ease-out shadow-lg hover:shadow-gray-500/50 hover:-translate-y-0.5 hover:scale-105 transform"
                >
                  Login with Password
                </button>
              </div>
            )}

            {/* Captured Image Preview */}
            {capturedImage && (
              <div className="p-4 bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-xl">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Captured Image</h4>
                <img src={capturedImage} alt="Captured face" className="w-full rounded-lg" />
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="space-y-4">
            {/* Registration Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Registration Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${isRegistered ? 'text-green-600' : 'text-red-600'}`}>
                    {isRegistered ? 'Registered' : 'Not Registered'}
                  </span>
                </div>
                {isRegistered && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Login:</span>
                      <span className="text-gray-800">
                        {loginHistory.length > 0 ? 
                          new Date(loginHistory[0].timestamp).toLocaleString() : 
                          'Never'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Logins:</span>
                      <span className="text-gray-800">{loginHistory.length}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Recent Login Attempts */}
            {loginHistory.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Recent Login Attempts</h3>
                <div className="space-y-2">
                  {loginHistory.slice(0, 5).map((attempt, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          attempt.success ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-gray-600">
                          {new Date(attempt.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <span className={`font-medium ${
                        attempt.success ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {attempt.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings */}
            {settings && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">System Settings</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confidence Threshold:</span>
                    <span className="text-gray-800">{settings.config.confidence_threshold}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Attempts:</span>
                    <span className="text-gray-800">{settings.config.max_attempts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lockout Duration:</span>
                    <span className="text-gray-800">{settings.config.lockout_duration}s</span>
                  </div>
                </div>
              </div>
            )}

            {/* Help */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>Ensure good lighting conditions</li>
                <li>Remove glasses or face coverings</li>
                <li>Keep face centered in camera view</li>
                <li>Maintain neutral facial expression</li>
                <li>Hold still during capture</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Face login uses advanced facial recognition for secure authentication
          </p>
          <button
            onClick={() => setShowInstructions(true)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Show Instructions
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaceLogin;
