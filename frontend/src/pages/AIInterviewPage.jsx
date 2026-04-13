import React from 'react';
import AIInterviewMode from '../components/AIInterviewMode';

export default function AIInterviewPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            AI Interview Mode
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Practice interviews with AI-powered evaluation and personalized feedback
          </p>
        </div>
        
        <AIInterviewMode />
      </div>
    </div>
  );
}
