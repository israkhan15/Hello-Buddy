import { Sun, Moon } from 'lucide-react';
import { useEffect } from 'react';

interface ThemeSwitchProps {
  isDarkMode: boolean;
  onToggle: () => void;
  variant?: 'button' | 'toggle' | 'icon';
  showLabel?: boolean;
}

export function ThemeSwitch({ 
  isDarkMode, 
  onToggle, 
  variant = 'toggle',
  showLabel = true 
}: ThemeSwitchProps) {
  
  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  if (variant === 'icon') {
    return (
      <button
        onClick={onToggle}
        className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-300"
        aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDarkMode ? (
          <Sun className="text-yellow-500" size={20} />
        ) : (
          <Moon className="text-indigo-600" size={20} />
        )}
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-300"
      >
        {isDarkMode ? (
          <>
            <Sun className="text-yellow-500" size={20} />
            {showLabel && <span className="text-sm text-gray-700 dark:text-gray-300">Light Mode</span>}
          </>
        ) : (
          <>
            <Moon className="text-indigo-600" size={20} />
            {showLabel && <span className="text-sm text-gray-700 dark:text-gray-300">Dark Mode</span>}
          </>
        )}
      </button>
    );
  }

  // Toggle variant (default)
  return (
    <div className="flex items-center gap-3">
      {showLabel && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {isDarkMode ? 'Dark' : 'Light'}
        </span>
      )}
      <button
        onClick={onToggle}
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600' 
            : 'bg-gradient-to-r from-yellow-400 to-orange-400'
        }`}
        aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-all duration-300 flex items-center justify-center ${
            isDarkMode ? 'translate-x-7' : 'translate-x-1'
          }`}
        >
          {isDarkMode ? (
            <Moon className="text-indigo-600" size={14} />
          ) : (
            <Sun className="text-orange-500" size={14} />
          )}
        </span>
      </button>
    </div>
  );
}
