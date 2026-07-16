import { Moon, Sun, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DailyTalkPractice } from './DailyTalkPractice';
import { ThemeSwitch } from './ThemeSwitch';
import { AppStats, getCurrentStreak, getStats, onStatsChanged } from '../lib/appStats';

interface DashboardProps {
  userName: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onNavigate: (screen: string) => void;
}

const motivationalQuotes = [
  "Every small step forward is progress. Keep going! 🌟",
  "Your potential is limitless. Believe in yourself! 💪",
  "Today is a new opportunity to grow and learn. ✨",
  "You are capable of amazing things! 🚀",
  "Progress, not perfection. You're doing great! 🌈",
  "Be kind to yourself. You're on a beautiful journey. 🌸"
];

export function Dashboard({ userName, isDarkMode, onToggleDarkMode, onNavigate }: DashboardProps) {
  const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  const [showDailyPractice, setShowDailyPractice] = useState(false);
  const [stats, setStats] = useState<AppStats>(() => getStats());
  const [streak, setStreak] = useState<number>(() => getCurrentStreak());

  useEffect(() => {
    const unsubscribe = onStatsChanged(() => {
      setStats(getStats());
      setStreak(getCurrentStreak());
    });
    return unsubscribe;
  }, []);

  const totalActions =
    stats.speechAnalysesCompleted +
    stats.cbtEntries +
    stats.sleepRecordsLogged +
    stats.tasksCompleted +
    stats.focusSessionsCompleted;
  const level = 1 + Math.floor(totalActions / 5);

  return (
    <div className="min-h-screen p-4 pb-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white">
              <User size={24} />
            </div>
            <div>
              <h1 className="text-gray-800 dark:text-white">Hello Buddy, Welcome Back!</h1>
              <p className="text-gray-600 dark:text-gray-300">{userName}</p>
            </div>
          </div>
          <ThemeSwitch 
            isDarkMode={isDarkMode} 
            onToggle={onToggleDarkMode}
            variant="toggle"
            showLabel={false}
          />
        </div>

        {/* Motivational Quote */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/80 dark:to-pink-900/80 p-6 rounded-2xl mb-8 shadow-md border border-purple-200 dark:border-[#2d2d2d] transition-colors duration-300">
          <p className="text-center text-gray-800 dark:text-white italic">
            "{quote}"
          </p>
        </div>

        {/* Daily Evening Talk Practice - Featured */}
        <div className="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-900/70 dark:via-purple-900/70 dark:to-pink-900/70 p-6 rounded-2xl mb-6 shadow-xl border-2 border-purple-200 dark:border-purple-700/50 transition-colors duration-300">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
              <span className="text-3xl">🌙</span>
            </div>
            <div className="flex-1">
              <h3 className="text-gray-800 dark:text-white mb-1">Evening Talk Practice</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Daily conversation before sleep • Improve speaking naturally
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDailyPractice(true)}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <span>Start Tonight's Session</span>
            <span className="text-xl">✨</span>
          </button>
          <p className="text-center text-xs text-gray-600 dark:text-gray-400 mt-3">
            🎯 Build confidence • 💬 Practice daily • 😴 Sleep peacefully
          </p>
        </div>

        {/* Main Feature Tiles */}
        <div className="space-y-4">
          {/* Study Mode */}
          <button
            onClick={() => onNavigate('study')}
            className="w-full bg-gradient-to-br from-blue-100 to-sky-100 dark:from-blue-900/60 dark:to-sky-900/60 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] text-left border border-blue-200 dark:border-[#2d2d2d] duration-300"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-2xl">
                📚
              </div>
              <div>
                <h2 className="text-blue-900 dark:text-blue-100">Study Mode</h2>
                <p className="text-blue-700 dark:text-blue-300 text-sm">Plan, focus & achieve your goals</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                Study Planner
              </span>
              <span className="px-3 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                Focus Lock
              </span>
              <span className="px-3 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                Progress Tracking
              </span>
            </div>
          </button>

          {/* Communication Booster */}
          <button
            onClick={() => onNavigate('communicate')}
            className="w-full bg-gradient-to-br from-green-100 to-mint-100 dark:from-green-900/60 dark:to-emerald-900/60 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] text-left border border-green-200 dark:border-[#2d2d2d] duration-300"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-2xl">
                💬
              </div>
              <div>
                <h2 className="text-green-900 dark:text-green-100">Communication Booster</h2>
                <p className="text-green-700 dark:text-green-300 text-sm">Practice & improve your speaking skills</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full text-xs">
                AI Speech Analysis
              </span>
              <span className="px-3 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full text-xs">
                Role-Play
              </span>
              <span className="px-3 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full text-xs">
                Voice Training
              </span>
            </div>
          </button>

          {/* Emotional Wellness */}
          <button
            onClick={() => onNavigate('wellness')}
            className="w-full bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/60 dark:to-purple-900/60 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] text-left border border-pink-200 dark:border-[#2d2d2d] duration-300"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 rounded-full bg-pink-500 flex items-center justify-center text-2xl">
                🌸
              </div>
              <div>
                <h2 className="text-pink-900 dark:text-pink-100">Emotional Wellness</h2>
                <p className="text-pink-700 dark:text-pink-300 text-sm">Mindfulness, support & self-care</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 bg-pink-200 dark:bg-pink-800 text-pink-800 dark:text-pink-200 rounded-full text-xs">
                Mindfulness
              </span>
              <span className="px-3 py-1 bg-pink-200 dark:bg-pink-800 text-pink-800 dark:text-pink-200 rounded-full text-xs">
                CBT Tools
              </span>
              <span className="px-3 py-1 bg-pink-200 dark:bg-pink-800 text-pink-800 dark:text-pink-200 rounded-full text-xs">
                Community
              </span>
            </div>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#121212] p-4 rounded-xl shadow border border-gray-200 dark:border-[#2d2d2d] text-center transition-colors duration-300">
            <div className="text-2xl mb-1">🔥</div>
            <p className="text-gray-600 dark:text-gray-300 text-xs">{streak} day streak</p>
          </div>
          <div className="bg-white dark:bg-[#121212] p-4 rounded-xl shadow border border-gray-200 dark:border-[#2d2d2d] text-center transition-colors duration-300">
            <div className="text-2xl mb-1">⭐</div>
            <p className="text-gray-600 dark:text-gray-300 text-xs">{totalActions} activities logged</p>
          </div>
          <div className="bg-white dark:bg-[#121212] p-4 rounded-xl shadow border border-gray-200 dark:border-[#2d2d2d] text-center transition-colors duration-300">
            <div className="text-2xl mb-1">📈</div>
            <p className="text-gray-600 dark:text-gray-300 text-xs">Level {level}</p>
          </div>
        </div>
      </div>

      {/* Daily Talk Practice Modal */}
      {showDailyPractice && (
        <DailyTalkPractice onClose={() => setShowDailyPractice(false)} />
      )}
    </div>
  );
}