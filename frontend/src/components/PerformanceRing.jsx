import React from 'react';

export default function PerformanceRing({ percentage }) {
  const radius = 60;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={radius * 2}
        height={radius * 2}
        className="transform -rotate-90"
      >
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-700"
        />
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-emerald-500 transition-all duration-500"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-white">{percentage}%</span>
      </div>
    </div>
  );
}
