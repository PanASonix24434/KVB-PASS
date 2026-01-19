import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';

const DarkModeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useDarkMode();

  return (
    <button
      onClick={toggleTheme}
      className={`
        inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium
        transition-all duration-300 ease-in-out
        ${isDark 
          ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
        }
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${isDark ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}
      `}
      title={isDark ? 'Tukar ke Mode Terang' : 'Tukar ke Mode Gelap'}
      aria-label={isDark ? 'Tukar ke Mode Terang' : 'Tukar ke Mode Gelap'}
    >
      <span className="transition-transform duration-300 ease-in-out">
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </span>
      <span className="hidden sm:inline">
        {isDark ? 'Mode Terang' : 'Mode Gelap'}
      </span>
    </button>
  );
};

export default DarkModeToggle;