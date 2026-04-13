import React from 'react';
import GoogleCalendarSync from '../components/GoogleCalendarSync';

export default function GoogleCalendarPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Google Calendar Integration
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sync your tasks with Google Calendar for seamless scheduling and time management
          </p>
        </div>
        
        <GoogleCalendarSync />
      </div>
    </div>
  );
}
