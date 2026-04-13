import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosConfig';

const AIInterviewMode = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('interview');
  const [currentSession, setCurrentSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [interviewAnalytics, setInterviewAnalytics] = useState(null);
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingInterview, setStartingInterview] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentResults, setCurrentResults] = useState(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchInterviewData();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentSession && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            completeInterview();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [currentSession, timeRemaining]);

  const fetchInterviewData = async () => {
    try {
      const [historyResponse, analyticsResponse, practiceResponse] = await Promise.all([
        api.get('/ai-interview/history'),
        api.get('/ai-interview/analytics'),
        api.get('/ai-interview/practice-questions', { params: { limit: 5 } })
      ]);

      setInterviewHistory(historyResponse.data.history);
      setInterviewAnalytics(analyticsResponse.data);
      setPracticeQuestions(practiceResponse.data.questions);
    } catch (error) {
      console.error('Error fetching interview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startInterview = async (interviewConfig) => {
    setStartingInterview(true);
    try {
      const response = await api.post('/ai-interview/start', interviewConfig);
      const session = response.data;
      
      setCurrentSession(session);
      setCurrentQuestion(session.first_question);
      setTimeRemaining(interviewConfig.duration * 60); // Convert to seconds
      setQuestionStartTime(Date.now());
      setActiveTab('interview');
      
      // Start timer for first question
      setQuestionStartTime(Date.now());
    } catch (error) {
      console.error('Error starting interview:', error);
      alert('Failed to start interview');
    } finally {
      setStartingInterview(false);
      setShowSetupModal(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) {
      alert('Please provide an answer before submitting');
      return;
    }

    setSubmittingAnswer(true);
    try {
      const timeTaken = questionStartTime ? (Date.now() - questionStartTime) / 1000 : 0;
      
      const response = await api.post(`/ai-interview/${currentSession.session_id}/submit-answer`, {
        question_id: currentQuestion.id,
        answer: userAnswer,
        time_taken: timeTaken
      });

      const { evaluation, next_question, interview_complete, final_evaluation } = response.data;

      // Store current results
      setCurrentResults(prev => ({
        ...prev,
        [currentQuestion.id]: evaluation
      }));

      if (interview_complete) {
        setCurrentResults(final_evaluation);
        setShowResults(true);
        setCurrentSession(null);
        setCurrentQuestion(null);
        fetchInterviewData();
      } else {
        setCurrentQuestion(next_question);
        setUserAnswer('');
        setQuestionStartTime(Date.now());
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const completeInterview = async () => {
    try {
      if (currentSession) {
        const response = await api.post(`/ai-interview/${currentSession.session_id}/complete`);
        setCurrentResults(response.data.final_evaluation);
        setShowResults(true);
        setCurrentSession(null);
        setCurrentQuestion(null);
        fetchInterviewData();
      }
    } catch (error) {
      console.error('Error completing interview:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // In a real implementation, you would send this to a speech-to-text service
        console.log('Audio recorded:', audioBlob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              AI Interview Mode
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Practice interviews with AI-powered evaluation and feedback
            </p>
          </div>
          <div className="flex items-center gap-3">
            {interviewAnalytics && (
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(interviewAnalytics.average_score)}`}>
                  {interviewAnalytics.average_score.toFixed(1)}%
                </p>
              </div>
            )}
            <button
              onClick={() => setShowSetupModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Start Interview
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex">
          {[
            { id: 'interview', label: 'Interview', icon: 'record_voice_over' },
            { id: 'history', label: 'History', icon: 'history' },
            { id: 'analytics', label: 'Analytics', icon: 'analytics' },
            { id: 'practice', label: 'Practice', icon: 'school' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'interview' && (
          <div className="space-y-6">
            {currentSession ? (
              /* Active Interview */
              <div className="space-y-6">
                {/* Interview Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Interview in Progress
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Question {currentSession.current_question_index + 1} of {currentSession.total_questions}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      Time: {formatTime(Math.floor(timeRemaining))}
                    </div>
                    <button
                      onClick={completeInterview}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      End Interview
                    </button>
                  </div>
                </div>

                {/* Current Question */}
                {currentQuestion && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-blue-500">help</span>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {currentQuestion.category}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        currentQuestion.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {currentQuestion.difficulty}
                      </span>
                    </div>
                    <p className="text-lg text-gray-900 dark:text-gray-100 mb-4">
                      {currentQuestion.question}
                    </p>
                  </div>
                )}

                {/* Answer Input */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Your Answer</h4>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          isRecording 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                      >
                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                      </button>
                    </div>
                  </div>
                  
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                    rows={6}
                    placeholder="Type your answer here or use voice recording..."
                  />
                  
                  <div className="flex gap-3">
                    <button
                      onClick={submitAnswer}
                      disabled={submittingAnswer || !userAnswer.trim()}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {submittingAnswer ? 'Submitting...' : 'Submit Answer'}
                    </button>
                    <button
                      onClick={() => setUserAnswer('')}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* No Active Interview */
              <div className="text-center py-12">
                <div className="text-6xl mb-4">record_voice_over</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Ready to Practice?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start an AI-powered interview to improve your skills
                </p>
                <button
                  onClick={() => setShowSetupModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Start Interview
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Interview History
            </h3>

            {interviewHistory.length > 0 ? (
              <div className="space-y-4">
                {interviewHistory.map((session) => (
                  <div
                    key={session.session_id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {session.type.charAt(0).toUpperCase() + session.type.slice(1)} Interview
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {session.difficulty} difficulty · {session.questions_answered} questions
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(session.completed_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getScoreColor(session.overall_score)}`}>
                          {session.overall_score.toFixed(1)}%
                        </p>
                        <button className="text-sm text-blue-600 hover:text-blue-800">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">history</div>
                <p className="text-gray-600 dark:text-gray-400">
                  No interview history yet. Start your first interview to see results here.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Performance Analytics
            </h3>

            {interviewAnalytics && interviewAnalytics.total_sessions > 0 ? (
              <>
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-blue-500">assessment</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        Total Sessions
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {interviewAnalytics.total_sessions}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-green-500">trending_up</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        Average Score
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {interviewAnalytics.average_score.toFixed(1)}%
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-purple-500">show_chart</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        Improvement Trend
                      </span>
                    </div>
                    <p className={`text-2xl font-bold ${
                      interviewAnalytics.improvement_trend > 0 ? 'text-green-600' : 
                      interviewAnalytics.improvement_trend < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {interviewAnalytics.improvement_trend > 0 ? '+' : ''}{interviewAnalytics.improvement_trend}%
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-yellow-500">psychology</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        Best Category
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {Object.keys(interviewAnalytics.category_performance)[0] || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Category Performance */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Category Performance
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(interviewAnalytics.category_performance).map(([category, score]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {category}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                score >= 80 ? 'bg-green-500' :
                                score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${score}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-medium ${getScoreColor(score)}`}>
                            {score.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                {interviewAnalytics.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                      Recommendations
                    </h4>
                    <div className="space-y-2">
                      {interviewAnalytics.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <span className="text-blue-500 mt-1">lightbulb</span>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">analytics</div>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete some interviews to see your performance analytics.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'practice' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Practice Questions
              </h3>
              <button
                onClick={() => fetchInterviewData()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Refresh Questions
              </button>
            </div>

            <div className="grid gap-4">
              {practiceQuestions.map((question, index) => (
                <div
                  key={question.id || index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-blue-500">help</span>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {question.category}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      question.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {question.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-900 dark:text-gray-100 mb-3">
                    {question.question}
                  </p>
                  <div className="flex items-center gap-3">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                      Practice Answer
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300 transition-colors">
                      View Sample
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interview Setup Modal */}
      {showSetupModal && (
        <InterviewSetupModal
          onClose={() => setShowSetupModal(false)}
          onStart={startInterview}
          loading={startingInterview}
        />
      )}

      {/* Results Modal */}
      {showResults && currentResults && (
        <ResultsModal
          results={currentResults}
          onClose={() => {
            setShowResults(false);
            setCurrentResults(null);
          }}
        />
      )}
    </div>
  );
};

// Interview Setup Modal Component
const InterviewSetupModal = ({ onClose, onStart, loading }) => {
  const [config, setConfig] = useState({
    type: 'mixed',
    difficulty: 'intermediate',
    duration: 30,
    focus_area: 'general'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onStart(config);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Interview Setup
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Interview Type
            </label>
            <select
              value={config.type}
              onChange={(e) => setConfig({ ...config, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="mixed">Mixed</option>
              <option value="technical">Technical</option>
              <option value="behavioral">Behavioral</option>
              <option value="situational">Situational</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Difficulty Level
            </label>
            <select
              value={config.difficulty}
              onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="easy">Easy</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={config.duration}
              onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              min="10"
              max="60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Focus Area
            </label>
            <select
              value={config.focus_area}
              onChange={(e) => setConfig({ ...config, focus_area: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="general">General</option>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Starting...' : 'Start Interview'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Results Modal Component
const ResultsModal = ({ results, onClose }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Interview Results
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            close
          </button>
        </div>

        <div className="space-y-6">
          {/* Overall Score */}
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreBackground(results.overall_score)}`}>
              <span className={`text-3xl font-bold ${getScoreColor(results.overall_score)}`}>
                {results.overall_score.toFixed(0)}%
              </span>
            </div>
            <p className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">
              Overall Score
            </p>
          </div>

          {/* Category Scores */}
          {results.category_scores && Object.keys(results.category_scores).length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                Category Performance
              </h4>
              <div className="space-y-3">
                {Object.entries(results.category_scores).map(([category, score]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {category}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            score >= 80 ? 'bg-green-500' :
                            score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${getScoreColor(score)}`}>
                        {score.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          {results.strengths && results.strengths.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                Strengths
              </h4>
              <div className="space-y-2">
                {results.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-green-500 mt-1">check_circle</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{strength}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Improvements */}
          {results.improvements && results.improvements.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                Areas for Improvement
              </h4>
              <div className="space-y-2">
                {results.improvements.map((improvement, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <span className="text-yellow-500 mt-1">trending_up</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{improvement}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {results.recommendations && results.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                Recommendations
              </h4>
              <div className="space-y-2">
                {results.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-blue-500 mt-1">lightbulb</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInterviewMode;
