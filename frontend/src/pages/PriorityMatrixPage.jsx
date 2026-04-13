import React from 'react';
import PriorityMatrix from '../components/PriorityMatrix';

export default function PriorityMatrixPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Priority Matrix</h1>
          <p className="text-gray-600">
            Use the Eisenhower Matrix to prioritize your tasks effectively
          </p>
        </div>
        
        <PriorityMatrix />
      </div>
    </div>
  );
}
