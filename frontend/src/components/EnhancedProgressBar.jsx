import React from 'react';

export default function EnhancedProgressBar({ percentage, size = 'medium', showLabel = true }) {
  const getProgressColor = (percentage) => {
    if (percentage <= 30) return 'from-red-500 to-red-600';
    if (percentage <= 70) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small': return 'h-2';
      case 'large': return 'h-4';
      default: return 'h-3';
    }
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Progress</span>
          <span className={`text-sm font-semibold ${
            percentage <= 30 ? 'text-red-400' : 
            percentage <= 70 ? 'text-yellow-400' : 
            'text-green-400'
          }`}>
            {percentage}%
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-700 rounded-full overflow-hidden ${getSizeClasses()}`}>
        <div
          className={`h-full bg-gradient-to-r ${getProgressColor(percentage)} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
