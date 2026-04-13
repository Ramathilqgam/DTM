import React from 'react';

export default function MiniChart({ data, color }) {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue;

  return (
    <div className="flex items-end justify-between h-16">
      {data.map((value, index) => {
        const height = range > 0 ? ((value - minValue) / range) * 100 : 0;
        return (
          <div
            key={index}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div
              className={`w-full ${color} rounded-t transition-all duration-300`}
              style={{ height: `${height}%`, minHeight: '2px' }}
            />
            <span className="text-xs text-gray-400 mt-1">
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
