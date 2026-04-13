import React, { useState, useRef, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';

const RealTimeFaceDetection = ({ onFaceDetected, onFaceQualityChange, autoCapture = false, captureDelay = 3000 }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const captureTimeoutRef = useRef(null);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [facePosition, setFacePosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [qualityScore, setQualityScore] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoCaptureTimer, setAutoCaptureTimer] = useState(0);
  const [detectionStats, setDetectionStats] = useState({
    framesProcessed: 0,
    facesDetected: 0,
    avgQuality: 0,
    fps: 0
  });
  const [lastFrameTime, setLastFrameTime] = useState(Date.now());

  useEffect(() => {
    return () => {
      stopCamera();
      stopDetection();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
        
        // Start real-time face detection
        startDetection();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setCameraActive(false);
      stopDetection();
    }
  };

  const startDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    
    detectionIntervalRef.current = setInterval(() => {
      detectFaceRealtime();
    }, 100); // Detect every 100ms for smooth real-time feedback
  };

  const stopDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    if (captureTimeoutRef.current) {
      clearTimeout(captureTimeoutRef.current);
      captureTimeoutRef.current = null;
    }
  };

  const detectFaceRealtime = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data for face detection
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    // Update FPS
    const currentTime = Date.now();
    const fps = 1000 / (currentTime - lastFrameTime);
    setLastFrameTime(currentTime);
    
    try {
      setIsProcessing(true);
      
      // Call face detection API
      const response = await api.post('/face-login/test', { image: imageData });
      const result = response.data;
      
      // Update detection stats
      setDetectionStats(prev => ({
        framesProcessed: prev.framesProcessed + 1,
        facesDetected: result.face_detected ? prev.facesDetected + 1 : prev.facesDetected,
        avgQuality: result.face_detected ? 
          ((prev.avgQuality * prev.facesDetected + result.quality_score) / (prev.facesDetected + 1)) : 
          prev.avgQuality,
        fps: Math.round(fps)
      }));
      
      if (result.face_detected) {
        setFaceDetected(true);
        setQualityScore(result.quality_score);
        
        // Simulate face position (in real implementation, this would come from the API)
        const mockPosition = {
          x: canvas.width * 0.3,
          y: canvas.height * 0.2,
          width: canvas.width * 0.4,
          height: canvas.height * 0.5
        };
        setFacePosition(mockPosition);
        
        // Notify parent component
        if (onFaceDetected) {
          onFaceDetected(true, result.quality_score);
        }
        
        if (onFaceQualityChange) {
          onFaceQualityChange(result.quality_score);
        }
        
        // Auto-capture functionality
        if (autoCapture && result.quality_score >= 0.7) {
          if (!captureTimeoutRef.current) {
            setAutoCaptureTimer(captureDelay / 1000);
            
            captureTimeoutRef.current = setTimeout(() => {
              captureImage();
            }, captureDelay);
            
            // Countdown timer
            const countdownInterval = setInterval(() => {
              setAutoCaptureTimer(prev => {
                if (prev <= 0.1) {
                  clearInterval(countdownInterval);
                  return 0;
                }
                return prev - 0.1;
              });
            }, 100);
          }
        }
      } else {
        setFaceDetected(false);
        setQualityScore(0);
        setFacePosition({ x: 0, y: 0, width: 0, height: 0 });
        
        // Clear auto-capture if face is lost
        if (captureTimeoutRef.current) {
          clearTimeout(captureTimeoutRef.current);
          captureTimeoutRef.current = null;
          setAutoCaptureTimer(0);
        }
        
        if (onFaceDetected) {
          onFaceDetected(false, 0);
        }
      }
    } catch (error) {
      console.error('Face detection error:', error);
      setFaceDetected(false);
      setQualityScore(0);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, onFaceDetected, onFaceQualityChange, autoCapture, captureDelay, lastFrameTime]);

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

  const getQualityColor = (score) => {
    if (score >= 0.8) return 'text-green-500';
    if (score >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getQualityMessage = (score) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Fair';
    return 'Poor';
  };

  const getQualityBgColor = (score) => {
    if (score >= 0.8) return 'bg-green-500/20 border-green-500/50';
    if (score >= 0.6) return 'bg-yellow-500/20 border-yellow-500/50';
    return 'bg-red-500/20 border-red-500/50';
  };

  return (
    <div className="relative">
      {/* Video Feed with Overlay */}
      <div className="relative bg-gray-900 rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
        {!cameraActive ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl text-gray-600 mb-4">camera_alt</div>
              <p className="text-gray-400 mb-4">Camera not active</p>
              <button
                onClick={startCamera}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-semibold transition-all duration-500 ease-out shadow-lg hover:shadow-blue-500/50 hover:-translate-y-0.5 hover:scale-105 transform"
              >
                Start Camera
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Face Detection Overlay */}
            {faceDetected && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Face Frame */}
                <div
                  className="absolute border-2 transition-all duration-200 ease-out"
                  style={{
                    left: `${facePosition.x}px`,
                    top: `${facePosition.y}px`,
                    width: `${facePosition.width}px`,
                    height: `${facePosition.height}px`,
                    borderColor: qualityScore >= 0.8 ? '#10b981' : qualityScore >= 0.6 ? '#eab308' : '#ef4444',
                    boxShadow: `0 0 20px ${qualityScore >= 0.8 ? '#10b981' : qualityScore >= 0.6 ? '#eab308' : '#ef4444'}40`
                  }}
                >
                  {/* Corner Markers */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: 'inherit' }}></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: 'inherit' }}></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: 'inherit' }}></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: 'inherit' }}></div>
                </div>
                
                {/* Quality Indicator */}
                <div className="absolute top-4 left-4 px-3 py-2 rounded-lg backdrop-blur-lg border text-sm font-medium"
                  style={{
                    backgroundColor: qualityScore >= 0.8 ? '#10b98120' : qualityScore >= 0.6 ? '#eab30820' : '#ef444420',
                    borderColor: qualityScore >= 0.8 ? '#10b981' : qualityScore >= 0.6 ? '#eab308' : '#ef4444',
                    color: qualityScore >= 0.8 ? '#10b981' : qualityScore >= 0.6 ? '#eab308' : '#ef4444'
                  }}
                >
                  Face Detected - {getQualityMessage(qualityScore)}
                </div>
                
                {/* Auto-Capture Countdown */}
                {autoCapture && autoCaptureTimer > 0 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center backdrop-blur-lg bg-white/20">
                      <span className="text-white text-2xl font-bold">{Math.ceil(autoCaptureTimer)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Detection Stats Overlay */}
            <div className="absolute top-4 right-4 text-xs text-gray-400 space-y-1">
              <div>FPS: {detectionStats.fps}</div>
              <div>Quality: {Math.round(qualityScore * 100)}%</div>
            </div>
          </>
        )}
        
        {/* Hidden Canvas for Image Processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Camera Controls */}
      {cameraActive && (
        <div className="flex gap-3 mt-4">
          <button
            onClick={stopCamera}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-semibold transition-all duration-500 ease-out shadow-lg hover:shadow-red-500/50 hover:-translate-y-0.5 hover:scale-105 transform"
          >
            Stop Camera
          </button>
          
          {autoCapture && (
            <div className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-300 ease-out ${getQualityBgColor(qualityScore)}`}
              style={{
                borderColor: qualityScore >= 0.8 ? '#10b981' : qualityScore >= 0.6 ? '#eab308' : '#ef4444',
                color: qualityScore >= 0.8 ? '#10b981' : qualityScore >= 0.6 ? '#eab308' : '#ef4444'
              }}
            >
              Auto-Capture: {autoCaptureTimer > 0 ? `${Math.ceil(autoCaptureTimer)}s` : 'Waiting...'}
            </div>
          )}
        </div>
      )}

      {/* Quality Meter */}
      {cameraActive && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Image Quality:</span>
            <span className={`font-bold ${getQualityColor(qualityScore)}`}>
              {getQualityMessage(qualityScore)} ({Math.round(qualityScore * 100)}%)
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                qualityScore >= 0.8 ? 'bg-gradient-to-r from-green-600 to-green-500' :
                qualityScore >= 0.6 ? 'bg-gradient-to-r from-yellow-600 to-yellow-500' : 
                'bg-gradient-to-r from-red-600 to-red-500'
              }`}
              style={{ width: `${qualityScore * 100}%` }}
            >
              <div className="h-full bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Detection Stats */}
      {cameraActive && detectionStats.framesProcessed > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-xl p-3">
            <div className="text-xs text-gray-400">Detection Rate</div>
            <div className="text-lg font-bold text-white">
              {detectionStats.framesProcessed > 0 ? 
                Math.round((detectionStats.facesDetected / detectionStats.framesProcessed) * 100) : 0}%
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-xl p-3">
            <div className="text-xs text-gray-400">Average Quality</div>
            <div className="text-lg font-bold text-white">
              {Math.round(detectionStats.avgQuality * 100)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeFaceDetection;
