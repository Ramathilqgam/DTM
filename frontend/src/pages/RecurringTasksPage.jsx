import React from 'react';
import RecurringTasks from '../components/RecurringTasks';

export default function RecurringTasksPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Recurring Tasks</h1>
          <p className="text-gray-600">
            Automate your recurring tasks and maintain consistency
          </p>
        </div>
        
        <RecurringTasks />
      </div>
    </div>
  );
}
