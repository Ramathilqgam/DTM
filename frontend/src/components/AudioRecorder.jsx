import { useState, useRef, useCallback } from 'react';
import api from '../api/axiosConfig';

export default function AudioRecorder({ onTranscriptionComplete, onAudioSaved }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [transcription, setTranscription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        
        // Save audio and get transcription
        await saveAudioAndTranscribe(audioBlob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      startTimer();
      
    } catch (err) {
      setError('Failed to access microphone. Please check permissions.');
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      stopTimer();
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      stopTimer();
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimer();
    }
  };

  const saveAudioAndTranscribe = async (audioBlob) => {
    setIsProcessing(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-memo.webm');
      
      // Save audio file
      const audioResponse = await api.post('/audio/save', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Get transcription
      const transcriptionResponse = await api.post('/audio/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const transcriptionText = transcriptionResponse.data.transcription;
      setTranscription(transcriptionText);
      
      // Callbacks
      if (onTranscriptionComplete) {
        onTranscriptionComplete(transcriptionText);
      }
      
      if (onAudioSaved) {
        onAudioSaved(audioResponse.data.audio_url);
      }
      
    } catch (err) {
      console.error('Error processing audio:', err);
      setError('Failed to process audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
      setAudioURL('');
      setTranscription('');
      setDuration(0);
    }
  };

  const createTaskFromTranscription = async () => {
    if (!transcription.trim()) return;
    
    try {
      const response = await api.post('/ai/task-from-voice', {
        transcription: transcription
      });
      
      // This would create a task from the voice memo
      console.log('Task created from voice:', response.data);
      
    } catch (err) {
      console.error('Error creating task from voice:', err);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Voice Memo</h3>
        {duration > 0 && (
          <span className="text-sm text-zinc-400">{formatDuration(duration)}</span>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-900/20 border border-red-700/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Recording Controls */}
      <div className="flex items-center justify-center gap-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="p-4 bg-red-600 hover:bg-red-500 rounded-full text-white transition-all transform hover:scale-105"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
            </svg>
          </button>
        ) : (
          <>
            <button
              onClick={isPaused ? resumeRecording : pauseRecording}
              className="p-3 bg-yellow-600 hover:bg-yellow-500 rounded-full text-white transition-all transform hover:scale-105"
            >
              {isPaused ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              )}
            </button>
            <button
              onClick={stopRecording}
              className="p-4 bg-red-600 hover:bg-red-500 rounded-full text-white transition-all transform hover:scale-105 animate-pulse"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" strokeWidth="2"/>
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Audio Player */}
      {audioURL && (
        <div className="space-y-3">
          <audio 
            ref={audioRef}
            controls 
            src={audioURL} 
            className="w-full"
          />
          
          {/* Transcription */}
          {transcription && (
            <div className="p-4 bg-zinc-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-white">Transcription</h4>
                <button
                  onClick={createTaskFromTranscription}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg transition-colors"
                >
                  Create Task
                </button>
              </div>
              <p className="text-sm text-zinc-300">{transcription}</p>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={deleteRecording}
              className="px-4 py-2 bg-red-900/40 hover:bg-red-900/60 border border-red-700/50 text-red-400 text-sm rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <div className="flex items-center justify-center py-4">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-3" />
          <span className="text-sm text-zinc-400">Processing audio...</span>
        </div>
      )}

      {/* Instructions */}
      {!audioURL && !isRecording && (
        <div className="text-center py-4">
          <p className="text-sm text-zinc-500">
            Click the red button to start recording. You can pause and resume as needed.
          </p>
        </div>
      )}
    </div>
  );
}
