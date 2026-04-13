import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';

export default function VoiceCommands() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        setTranscript(command);
        processVoiceCommand(command);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setFeedback(`Error: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setIsSupported(false);
    }
  }, []);

  const processVoiceCommand = async (command) => {
    setFeedback('');
    
    // Task creation commands
    if (command.includes('create task') || command.includes('add task') || command.includes('new task')) {
      const taskMatch = command.match(/(?:task|add|create)(.+?)(.+?)(?:by|due|deadline)?(.+)?/i);
      if (taskMatch) {
        const taskTitle = taskMatch[2]?.trim() || 'New Task';
        const deadlineText = taskMatch[3]?.trim() || '';
        
        let dueDate = null;
        if (deadlineText) {
          const dateMatch = deadlineText.match(/(tomorrow|today|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
          if (dateMatch) {
            dueDate = parseRelativeDate(dateMatch[1]);
          }
        }

        try {
          await api.post('/tasks/', {
            title: taskTitle,
            description: `Created via voice command: "${command}"`,
            due_date: dueDate,
            priority: 'medium',
            status: 'pending'
          });
          setFeedback(`✅ Task created: "${taskTitle}"`);
        } catch (error) {
          setFeedback(`❌ Failed to create task: ${error.message}`);
        }
      }
    }
    
    // Task filtering commands
    else if (command.includes('show') || command.includes('filter')) {
      if (command.includes('pending')) {
        setFeedback('🔍 Showing pending tasks');
        // This would typically update a parent component's filter state
      } else if (command.includes('completed')) {
        setFeedback('✅ Showing completed tasks');
      } else if (command.includes('high priority')) {
        setFeedback('🔥 Showing high priority tasks');
      }
    }
    
    // Task completion commands
    else if (command.includes('complete') || command.includes('done')) {
      const taskMatch = command.match(/(?:complete|done)(.+?)(.+)/i);
      if (taskMatch) {
        const taskName = taskMatch[2]?.trim();
        setFeedback(`🎯 Marking "${taskName}" as complete`);
        // This would find and update the specific task
      }
    }
    
    // Help command
    else if (command.includes('help')) {
      setFeedback('🎤 Available commands: "Create task [title]", "Show pending", "Show completed", "Complete [task name]"');
    }
    
    else {
      setFeedback(`❓ Unknown command: "${command}". Say "help" for available commands.`);
    }
    
    // Clear transcript after processing
    setTimeout(() => setTranscript(''), 3000);
  };

  const parseRelativeDate = (dateText) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const dayMap = {
      'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4,
      'friday': 5, 'saturday': 6, 'sunday': 0
    };
    
    switch (dateText.toLowerCase()) {
      case 'today': return today.toISOString().split('T')[0];
      case 'tomorrow': return tomorrow.toISOString().split('T')[0];
      case 'next week': return nextWeek.toISOString().split('T')[0];
      default:
        if (dayMap[dateText.toLowerCase()] !== undefined) {
          const targetDate = new Date(today);
          const currentDay = today.getDay();
          const targetDay = dayMap[dateText.toLowerCase()];
          let daysToAdd = targetDay - currentDay;
          if (daysToAdd <= 0) daysToAdd += 7;
          targetDate.setDate(targetDate.getDate() + daysToAdd);
          return targetDate.toISOString().split('T')[0];
        }
        return null;
    }
  };

  const toggleListening = () => {
    if (!isSupported) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setFeedback('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  if (!isSupported) {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900/30 to-gray-950/20 border border-gray-700/30">
        <div className="text-center">
          <span className="text-4xl mb-4">🔇</span>
          <h3 className="text-lg font-bold text-gray-400 mb-2">Voice Commands Not Supported</h3>
          <p className="text-sm text-gray-500">Your browser doesn't support speech recognition. Try Chrome or Edge.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-green-900/30 to-green-950/20 border border-green-700/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎤</span>
          <div>
            <h3 className="text-xl font-bold">Voice Commands</h3>
            <p className="text-sm text-gray-400">Create tasks with your voice</p>
          </div>
        </div>
        
        <button
          onClick={toggleListening}
          disabled={!isSupported}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
            isListening 
              ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          } ${!isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isListening ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-white rounded-full animate-ping" />
              Listening...
            </span>
          ) : (
            'Start Listening'
          )}
        </button>
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="p-4 rounded-lg bg-green-950/40 border border-green-700/50 mb-4">
          <p className="text-sm text-gray-300 mb-2">You said:</p>
          <p className="text-white font-medium">"{transcript}"</p>
        </div>
      )}

      {/* Feedback Display */}
      {feedback && (
        <div className={`p-4 rounded-lg border mb-4 ${
          feedback.includes('✅') ? 'bg-green-950/40 border-green-700/50' :
          feedback.includes('❌') ? 'bg-red-950/40 border-red-700/50' :
          feedback.includes('❓') ? 'bg-yellow-950/40 border-yellow-700/50' :
          'bg-blue-950/40 border-blue-700/50'
        }`}>
          <p className="text-sm">{feedback}</p>
        </div>
      )}

      {/* Command Examples */}
      <div className="space-y-2">
        <h4 className="font-semibold text-white mb-3">Try these commands:</h4>
        <div className="space-y-2">
          <div className="p-3 rounded-lg bg-black/20 border border-green-700/50">
            <p className="text-sm text-green-300">"Create task Finish project by tomorrow"</p>
          </div>
          <div className="p-3 rounded-lg bg-black/20 border border-blue-700/50">
            <p className="text-sm text-blue-300">"Show pending tasks"</p>
          </div>
          <div className="p-3 rounded-lg bg-black/20 border border-orange-700/50">
            <p className="text-sm text-orange-300">"Complete task Review document"</p>
          </div>
          <div className="p-3 rounded-lg bg-black/20 border border-purple-700/50">
            <p className="text-sm text-purple-300">"Help"</p>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-400 text-center">
        <p>💡 Speak clearly and pause after each command</p>
        <p>Works best in Chrome or Edge browsers</p>
      </div>
    </div>
  );
}
