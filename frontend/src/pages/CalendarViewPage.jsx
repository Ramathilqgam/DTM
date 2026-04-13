import React from 'react';
import CalendarView from '../components/CalendarView';

export default function CalendarViewPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendar View</h1>
          <p className="text-gray-600">
            Visualize and manage your tasks with an interactive calendar interface
          </p>
        </div>
        
        <CalendarView />
      </div>
    </div>
  );
}
