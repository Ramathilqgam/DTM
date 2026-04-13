import React, { useState } from 'react';

export default function ThemeSettingsPage() {
  const [theme, setTheme] = useState('dark');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [fontSize, setFontSize] = useState('medium');

  const themes = [
    { id: 'dark', name: 'Dark', bg: 'bg-gray-900' },
    { id: 'light', name: 'Light', bg: 'bg-white' },
    { id: 'blue', name: 'Ocean Blue', bg: 'bg-blue-900' },
    { id: 'purple', name: 'Purple Night', bg: 'bg-purple-900' }
  ];

  const colors = [
    { id: 'indigo', name: 'Indigo', value: '#6366f1' },
    { id: 'blue', name: 'Blue', value: '#3b82f6' },
    { id: 'purple', name: 'Purple', value: '#8b5cf6' },
    { id: 'green', name: 'Green', value: '#10b981' },
    { id: 'red', name: 'Red', value: '#ef4444' }
  ];

  const fontSizes = [
    { id: 'small', name: 'Small', value: '14px' },
    { id: 'medium', name: 'Medium', value: '16px' },
    { id: 'large', name: 'Large', value: '18px' },
    { id: 'xlarge', name: 'Extra Large', value: '20px' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Theme Settings</h1>
          <p className="text-gray-600">
            Customize the appearance of your DTM application
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Theme Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Theme</h2>
            <div className="space-y-3">
              {themes.map((t) => (
                <div
                  key={t.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    theme === t.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setTheme(t.id)}
                >
                  <div className={`w-full h-16 rounded ${t.bg} mb-2`}></div>
                  <p className="font-medium">{t.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Primary Color</h2>
            <div className="space-y-3">
              {colors.map((color) => (
                <div
                  key={color.id}
                  className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    primaryColor === color.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPrimaryColor(color.value)}
                >
                  <div
                    className="w-8 h-8 rounded-full mr-3"
                    style={{ backgroundColor: color.value }}
                  ></div>
                  <p className="font-medium">{color.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Font Size Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Font Size</h2>
            <div className="space-y-3">
              {fontSizes.map((size) => (
                <div
                  key={size.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    fontSize === size.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFontSize(size.id)}
                >
                  <p className="font-medium" style={{ fontSize: size.value }}>
                    {size.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <div className="p-4 rounded-lg border-2 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Sample Dashboard</h3>
              <button
                className="px-4 py-2 rounded text-white font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                Sample Button
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 rounded bg-gray-100">
                <p className="font-medium">Task 1</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div className="p-3 rounded bg-gray-100">
                <p className="font-medium">Task 2</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
              <div className="p-3 rounded bg-gray-100">
                <p className="font-medium">Task 3</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            onClick={() => {
              // Save theme preferences
              alert('Theme settings saved successfully!');
            }}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
