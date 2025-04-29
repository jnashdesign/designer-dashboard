import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <button 
      onClick={toggleDarkMode}
      className="btn btn-outline-secondary"
      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
    >
      {isDarkMode ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
} 