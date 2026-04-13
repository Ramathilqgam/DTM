import React from 'react';
import SmartReminders from '../components/SmartReminders';

export default function SmartRemindersPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Reminders</h1>
          <p className="text-gray-600">
            Set up intelligent reminders and manage your notifications
          </p>
        </div>
        
        <SmartReminders />
      </div>
    </div>
  );
}
