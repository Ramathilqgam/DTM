import React, { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (theme) => {
    const root = document.documentElement;
    
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      // Update CSS variables for light theme
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f3f4f6');
      root.style.setProperty('--bg-tertiary', '#e5e7eb');
      root.style.setProperty('--text-primary', '#1f2937');
      root.style.setProperty('--text-secondary', '#4b5563');
      root.style.setProperty('--text-tertiary', '#6b7280');
      root.style.setProperty('--border-color', '#d1d5db');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      // Update CSS variables for dark theme
      root.style.setProperty('--bg-primary', '#0a0a0f');
      root.style.setProperty('--bg-secondary', '#1a0a2e');
      root.style.setProperty('--bg-tertiary', '#16213e');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#d1d5db');
      root.style.setProperty('--text-tertiary', '#6b7280');
      root.style.setProperty('--border-color', '#374151');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900/30 to-indigo-950/20 border border-indigo-700/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{theme === 'dark' ? '🌙' : '☀️'}</span>
          <div>
            <h3 className="text-xl font-bold">Theme Settings</h3>
            <p className="text-sm text-gray-400">
              {theme === 'dark' ? 'Dark mode active' : 'Light mode active'}
            </p>
          </div>
        </div>
        
        <button
          onClick={toggleTheme}
          className="relative inline-flex h-8 w-14 items-center rounded-full bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-950/40 border border-indigo-700/50">
          <span className="text-sm text-gray-300">Current Theme</span>
          <span className="text-sm font-semibold text-white capitalize">{theme}</span>
        </div>
        
        <div className="text-xs text-gray-400 space-y-2">
          <p>💡 Pro tip: Dark mode reduces eye strain in low light</p>
          <p>☀️ Light mode is better for bright environments</p>
        </div>
      </div>
    </div>
  );
}
