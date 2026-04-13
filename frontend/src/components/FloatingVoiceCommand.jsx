import { useState, useEffect, useRef } from 'react';

export default function FloatingVoiceCommand() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      try {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true; // Enable interim results for better feedback
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onstart = () => {
          console.log('Speech recognition started');
          setTranscript('Listening...');
        };

        recognitionRef.current.onresult = (event) => {
          console.log('Speech result received:', event);
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript = transcript;
            } else {
              interimTranscript = transcript;
            }
          }

          if (finalTranscript) {
            setTranscript(finalTranscript);
            setIsListening(false);
            processVoiceCommand(finalTranscript);
          } else if (interimTranscript) {
            setTranscript(interimTranscript + '...');
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          
          let errorMessage = 'Speech recognition error';
          switch (event.error) {
            case 'no-speech':
              errorMessage = 'No speech detected. Please try again.';
              break;
            case 'audio-capture':
              errorMessage = 'Microphone not found or not allowed. Please check your microphone permissions.';
              break;
            case 'not-allowed':
              errorMessage = 'Microphone permission denied. Please allow microphone access in your browser.';
              break;
            case 'network':
              errorMessage = 'Network error. Please check your internet connection.';
              break;
            default:
              errorMessage = `Error: ${event.error}`;
          }
          
          setTranscript(errorMessage);
          setResponse(errorMessage);
        };

        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
        };

      } catch (error) {
        console.error('Error initializing speech recognition:', error);
        setTranscript('Failed to initialize speech recognition');
        setResponse('Please try using Chrome or Edge browsers for voice commands.');
      }
    } else {
      console.log('Speech recognition not supported');
      setTranscript('Speech recognition not supported');
      setResponse('Please try using Chrome or Edge browsers for voice commands.');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log('Speech recognition already stopped');
        }
      }
    };
  }, []);

  const generateLearningPlan = (topic, days) => {
    const plans = {
      'language': {
        title: 'Language Learning Plan',
        plan: [
          'Day 1: Learn basic greetings and introductions (Hello, Goodbye, Thank you)',
          'Day 2: Master numbers 1-20 and basic counting',
          'Day 3: Learn common phrases for ordering food and drinks',
          'Day 4: Study days of the week and months',
          'Day 5: Practice asking for directions and locations',
          'Day 6: Learn family members and relationships',
          'Day 7: Review week 1 vocabulary with flashcards',
          'Day 8: Learn basic verb conjugations (present tense)',
          'Day 9: Study colors and descriptive adjectives',
          'Day 10: Practice telling time and scheduling',
          'Day 11: Learn shopping vocabulary and phrases',
          'Day 12: Study transportation and travel terms',
          'Day 13: Practice weather expressions and small talk',
          'Day 14: Review week 2 and take practice quiz',
          'Day 15: Learn past tense verb forms',
          'Day 16: Study future tense and making plans',
          'Day 17: Learn medical and emergency phrases',
          'Day 18: Practice business and work vocabulary',
          'Day 19: Study cultural customs and etiquette',
          'Day 20: Review all tenses and complex sentences',
          'Day 21: Practice with native speaker or language exchange',
          'Day 22: Learn idioms and common expressions',
          'Day 23: Study slang and informal language',
          'Day 24: Practice listening comprehension with media',
          'Day 25: Learn writing skills and composition',
          'Day 26: Study advanced grammar concepts',
          'Day 27: Practice reading authentic materials',
          'Day 28: Final review and fluency assessment',
          'Day 29: Cultural immersion activities',
          'Day 30: Create language learning routine for continued growth'
        ]
      },
      'programming': {
        title: 'Programming Learning Plan',
        plan: [
          'Day 1: Set up development environment and tools',
          'Day 2: Learn basic syntax and data types',
          'Day 3: Master variables and operators',
          'Day 4: Study conditional statements (if/else)',
          'Day 5: Learn loops and iteration',
          'Day 6: Practice writing simple programs',
          'Day 7: Functions and parameters',
          'Day 8: Arrays and data structures basics',
          'Day 9: String manipulation methods',
          'Day 10: Error handling and debugging',
          'Day 11: Object-oriented programming concepts',
          'Day 12: Classes and objects',
          'Day 13: Inheritance and polymorphism',
          'Day 14: File I/O operations',
          'Day 15: Build a small project using learned concepts',
          'Day 16: API integration and web requests',
          'Day 17: Database basics and SQL',
          'Day 18: Version control with Git',
          'Day 19: Testing and unit testing',
          'Day 20: Code optimization and performance',
          'Day 21: Framework introduction',
          'Day 22: Build a web application',
          'Day 23: Authentication and security basics',
          'Day 24: Deployment and hosting',
          'Day 25: Advanced data structures',
          'Day 26: Algorithms and problem solving',
          'Day 27: Design patterns',
          'Day 28: Code review and refactoring',
          'Day 29: Contributing to open source',
          'Day 30: Portfolio project and continuous learning'
        ]
      },
      'music': {
        title: 'Music Learning Plan',
        plan: [
          'Day 1: Learn basic music theory (notes, scales)',
          'Day 2: Understand rhythm and time signatures',
          'Day 3: Practice proper posture and hand position',
          'Day 4: Learn basic chords (C, G, Am, F)',
          'Day 5: Practice chord transitions smoothly',
          'Day 6: Learn simple strumming patterns',
          'Day 7: Practice playing your first song',
          'Day 8: Learn barre chords basics',
          'Day 9: Practice fingerpicking patterns',
          'Day 10: Learn music reading fundamentals',
          'Day 11: Practice scales and finger exercises',
          'Day 12: Learn intermediate chords',
          'Day 13: Practice ear training exercises',
          'Day 14: Learn improvisation basics',
          'Day 15: Record yourself playing and analyze',
          'Day 16: Learn advanced techniques (hammer-ons, pull-offs)',
          'Day 17: Practice music theory application',
          'Day 18: Learn songs in different keys',
          'Day 19: Practice playing with a metronome',
          'Day 20: Learn music composition basics',
          'Day 21: Practice playing with others',
          'Day 22: Learn advanced rhythm patterns',
          'Day 23: Study different music genres',
          'Day 24: Practice performance skills',
          'Day 25: Learn music production basics',
          'Day 26: Practice sight-reading',
          'Day 27: Learn advanced music theory',
          'Day 28: Create original music',
          'Day 29: Performance preparation',
          'Day 30: Develop practice routine and goals'
        ]
      },
      'fitness': {
        title: 'Fitness Learning Plan',
        plan: [
          'Day 1: Assess current fitness level and set goals',
          'Day 2: Learn proper form for basic exercises',
          'Day 3: Create workout schedule and routine',
          'Day 4: Practice basic cardio exercises',
          'Day 5: Learn strength training fundamentals',
          'Day 6: Practice bodyweight exercises',
          'Day 7: Rest day and flexibility training',
          'Day 8: Learn nutrition basics',
          'Day 9: Meal planning and preparation',
          'Day 10: Practice progressive overload principles',
          'Day 11: Learn advanced cardio techniques',
          'Day 12: Practice weight training form',
          'Day 13: Learn muscle group targeting',
          'Day 14: Practice HIIT workouts',
          'Day 15: Assess progress and adjust goals',
          'Day 16: Learn recovery and injury prevention',
          'Day 17: Practice advanced strength exercises',
          'Day 18: Learn supplementation basics',
          'Day 19: Practice functional fitness movements',
          'Day 20: Learn sports-specific training',
          'Day 21: Practice mobility and flexibility',
          'Day 22: Learn advanced programming concepts',
          'Day 23: Practice periodization principles',
          'Day 24: Learn mental training techniques',
          'Day 25: Practice competition preparation',
          'Day 26: Learn advanced nutrition strategies',
          'Day 27: Practice performance testing',
          'Day 28: Learn long-term fitness planning',
          'Day 29: Create sustainable fitness lifestyle',
          'Day 30: Develop coaching and teaching skills'
        ]
      }
    };

    // Determine the best plan based on keywords
    let selectedPlan = null;
    const lowerTopic = topic.toLowerCase();

    if (lowerTopic.includes('language') || lowerTopic.includes('spanish') || lowerTopic.includes('french') || lowerTopic.includes('german') || lowerTopic.includes('italian') || lowerTopic.includes('chinese') || lowerTopic.includes('japanese')) {
      selectedPlan = plans.language;
    } else if (lowerTopic.includes('programming') || lowerTopic.includes('coding') || lowerTopic.includes('javascript') || lowerTopic.includes('python') || lowerTopic.includes('code')) {
      selectedPlan = plans.programming;
    } else if (lowerTopic.includes('music') || lowerTopic.includes('guitar') || lowerTopic.includes('piano') || lowerTopic.includes('singing') || lowerTopic.includes('instrument')) {
      selectedPlan = plans.music;
    } else if (lowerTopic.includes('fitness') || lowerTopic.includes('workout') || lowerTopic.includes('exercise') || lowerTopic.includes('gym') || lowerTopic.includes('training')) {
      selectedPlan = plans.fitness;
    } else {
      // Default to language learning if no specific match
      selectedPlan = plans.language;
    }

    // Adjust plan length based on requested days
    const adjustedPlan = selectedPlan.plan.slice(0, Math.min(days, selectedPlan.plan.length));

    return {
      title: selectedPlan.title,
      days: adjustedPlan,
      totalDays: days
    };
  };

  const processVoiceCommand = async (command) => {
    setIsProcessing(true);
    setResponse('Thinking...');
    
    try {
      const lowerCommand = command.toLowerCase();
      let aiResponse = '';

      // Learning plan requests
      if (lowerCommand.includes('plan') && (lowerCommand.includes('learning') || lowerCommand.includes('learn') || lowerCommand.includes('study'))) {
        // Extract topic and days from command
        const topicMatch = command.match(/(?:learn|study|learning|plan for|plan to)\s+([a-z\s]+)/i);
        const daysMatch = command.match(/(\d+)\s*(?:days?|day)/i);
        
        const topic = topicMatch ? topicMatch[1].trim() : 'language';
        const days = daysMatch ? parseInt(daysMatch[1]) : 30;
        
        const learningPlan = generateLearningPlan(topic, days);
        
        aiResponse = `${learningPlan.title} - ${learningPlan.totalDays} Days:\n\n${learningPlan.days.map((day, index) => `Day ${index + 1}: ${day}`).join('\n\n')}\n\nThis plan will help you master ${topic} step by step. Would you like me to break down any specific day in more detail?`;
      }
      // Task-related commands
      else if (lowerCommand.includes('create task') || lowerCommand.includes('add task')) {
        const taskTitle = command.replace(/create task|add task/i, '').trim();
        aiResponse = `I'll create a new task: "${taskTitle}". Task has been added to your list!`;
      }
      else if (lowerCommand.includes('show pending') || lowerCommand.includes('pending tasks')) {
        aiResponse = 'You have 3 pending tasks: "Finish project", "Review document", and "Call client". Would you like me to show more details?';
      }
      else if (lowerCommand.includes('complete task') || lowerCommand.includes('mark done')) {
        const taskTitle = command.replace(/complete task|mark done/i, '').trim();
        aiResponse = `Great! I've marked "${taskTitle}" as complete. Well done on your productivity!`;
      }
      // Question answering
      else if (lowerCommand.includes('what') || lowerCommand.includes('how') || lowerCommand.includes('when') || lowerCommand.includes('why') || lowerCommand.includes('where')) {
        if (lowerCommand.includes('weather')) {
          aiResponse = 'The weather today is sunny with a high of 75°F. Perfect weather for productive work!';
        }
        else if (lowerCommand.includes('time')) {
          const now = new Date();
          aiResponse = `The current time is ${now.toLocaleTimeString()}.`;
        }
        else if (lowerCommand.includes('tasks')) {
          aiResponse = 'You currently have 8 tasks total. 3 are pending, 2 are in progress, and 3 are completed. You\'re doing great!';
        }
        else {
          aiResponse = `That's an interesting question about "${command}". Based on your current tasks and schedule, I suggest focusing on your high-priority items first. Would you like me to help you organize your tasks?`;
        }
      }
      // Help command
      else if (lowerCommand.includes('help')) {
        aiResponse = 'I can help you with: creating tasks, showing pending tasks, completing tasks, generating learning plans, answering questions about your schedule, and providing productivity tips. Try asking "Give me a plan for learning Spanish" or "Create a 30-day programming plan"!';
      }
      // Greeting
      else if (lowerCommand.includes('hello') || lowerCommand.includes('hi') || lowerCommand.includes('hey')) {
        aiResponse = 'Hello! I\'m your voice assistant. I can help you create learning plans, manage tasks, and answer questions. What would you like to learn today?';
      }
      // Productivity tips
      else if (lowerCommand.includes('productivity') || lowerCommand.includes('focus') || lowerCommand.includes('motivation')) {
        aiResponse = 'Here\'s a productivity tip: Try the Pomodoro Technique - work for 25 minutes, then take a 5-minute break. It helps maintain focus and prevent burnout!';
      }
      // Default response
      else {
        aiResponse = `I heard: "${command}". I can help you create learning plans, manage tasks, and answer questions. Try asking me for a learning plan like "Give me a 30-day plan for learning guitar" or "Create a 15-day fitness plan". What would you like to do?`;
      }

      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResponse(aiResponse);
    } catch (error) {
      console.error('Error processing voice command:', error);
      setResponse('Sorry, I had trouble processing that. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const startListening = async () => {
    if (!recognitionRef.current) {
      setTranscript('Speech recognition not supported in this browser.');
      setResponse('Please try using Chrome or Edge browsers for voice commands.');
      return;
    }

    try {
      // Clear previous results
      setTranscript('');
      setResponse('');
      setIsListening(true);

      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start speech recognition
      recognitionRef.current.start();
      console.log('Speech recognition started successfully');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setTranscript('Microphone permission denied');
        setResponse('Please allow microphone access in your browser settings. Click the microphone icon in your browser address bar and select "Allow".');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setTranscript('No microphone found');
        setResponse('Please connect a microphone and ensure it\'s working properly.');
      } else {
        setTranscript('Failed to start recording');
        setResponse('Please check your microphone settings and try again.');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      setTranscript(manualInput.trim());
      processVoiceCommand(manualInput.trim());
      setManualInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleManualSubmit();
    }
  };

  return (
    <>
      {/* Floating Voice Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center group"
        >
          <div className="relative">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
            </svg>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            Voice Commands - Click to start!
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      )}

      {/* Voice Command Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-700 bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Voice Commands</h3>
                <p className="text-xs text-white/80">Create tasks with your voice</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Voice Control Area */}
          <div className="flex-1 p-6 flex flex-col">
            {/* Microphone Button */}
            <div className="flex justify-center mb-6">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isListening 
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                    : 'bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500'
                }`}
              >
                {isListening ? (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Status Text */}
            <div className="text-center mb-4">
              <p className="text-lg font-semibold text-white mb-2">
                {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Tap to start'}
              </p>
            </div>

            {/* Conversation Area */}
            <div className="flex-1 bg-zinc-800 rounded-lg p-4 overflow-y-auto max-h-64">
              {/* User Transcript */}
              {transcript && (
                <div className="mb-3">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-green-400 font-semibold mb-1">You:</p>
                      <p className="text-sm text-zinc-200">{transcript}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Response */}
              {response && (
                <div className="mb-3">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-blue-400 font-semibold mb-1">Assistant:</p>
                      <p className="text-sm text-zinc-200">{response}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Processing Indicator */}
              {isProcessing && !response && (
                <div className="flex items-center gap-2 text-zinc-400">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              )}

              {/* Welcome Message */}
              {!transcript && !response && !isProcessing && (
                <div className="text-center text-zinc-400">
                  <svg className="w-8 h-8 mx-auto mb-2 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                  </svg>
                  <p className="text-sm">Ask me anything about your tasks or schedule!</p>
                </div>
              )}
            </div>

            {/* Manual Input Fallback */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => setShowManualInput(!showManualInput)}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {showManualInput ? 'Hide' : 'Show'} text input
                </button>
                <span className="text-xs text-gray-500">if voice isn't working</span>
              </div>

              {showManualInput && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your question here..."
                    className="flex-1 bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleManualSubmit}
                    disabled={!manualInput.trim() || isProcessing}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Send
                  </button>
                </div>
              )}
            </div>

            {/* Example Commands */}
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-1">
                <span className="bg-zinc-700 px-2 py-1 rounded text-xs text-zinc-300">"What time is it?"</span>
                <span className="bg-zinc-700 px-2 py-1 rounded text-xs text-zinc-300">"Show my tasks"</span>
                <span className="bg-zinc-700 px-2 py-1 rounded text-xs text-zinc-300">"Create task"</span>
                <span className="bg-zinc-700 px-2 py-1 rounded text-xs text-zinc-300">"Help"</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
