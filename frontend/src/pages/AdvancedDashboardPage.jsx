import React from 'react';
import AdvancedDashboard from '../components/AdvancedDashboard';

export default function AdvancedDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Dashboard</h1>
          <p className="text-gray-600">
            Comprehensive analytics, performance metrics, and productivity insights
          </p>
        </div>
        
        <AdvancedDashboard />
      </div>
    </div>
  );
}
