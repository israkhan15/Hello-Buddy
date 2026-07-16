import { useEffect, useState } from 'react';
import { User, Moon, Sun, Shield, Database, BarChart3, Award, LogOut, Settings } from 'lucide-react';
import { ThemeSwitch } from './ThemeSwitch';
import { AppStats, getCurrentStreak, getStats, onStatsChanged, recordVisitToday } from '../lib/appStats';

interface ProfileProps {
  userName: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
}

interface AchievementDef {
  emoji: string;
  title: string;
  description: string;
  target: number;
  progress: (stats: AppStats, streak: number) => number;
}

const ACHIEVEMENTS: AchievementDef[] = [
  {
    emoji: '🎯',
    title: 'Focus Master',
    description: 'Complete 10 focus sessions',
    target: 10,
    progress: stats => stats.focusSessionsCompleted
  },
  {
    emoji: '✅',
    title: 'Task Champion',
    description: 'Complete 20 study tasks',
    target: 20,
    progress: stats => stats.tasksCompleted
  },
  {
    emoji: '💬',
    title: 'Communication Pro',
    description: 'Complete 5 speech analyses',
    target: 5,
    progress: stats => stats.speechAnalysesCompleted
  },
  {
    emoji: '🧠',
    title: 'Mindful Journaler',
    description: 'Save 7 CBT thought entries',
    target: 7,
    progress: stats => stats.cbtEntries
  },
  {
    emoji: '🌙',
    title: 'Sleep Tracker',
    description: 'Log 5 nights of sleep',
    target: 5,
    progress: stats => stats.sleepRecordsLogged
  },
  {
    emoji: '🔥',
    title: 'Consistent Visitor',
    description: 'Open Hello Buddy 7 days in a row',
    target: 7,
    progress: (_stats, streak) => streak
  }
];

export function Profile({ userName, isDarkMode, onToggleDarkMode, onLogout }: ProfileProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [stats, setStats] = useState<AppStats>(() => getStats());
  const [streak, setStreak] = useState<number>(() => getCurrentStreak());

  useEffect(() => {
    recordVisitToday();
    setStats(getStats());
    setStreak(getCurrentStreak());

    const unsubscribe = onStatsChanged(() => {
      setStats(getStats());
      setStreak(getCurrentStreak());
    });
    return unsubscribe;
  }, []);

  const unlockedAchievements = ACHIEVEMENTS.filter(a => a.progress(stats, streak) >= a.target);
  const totalActions =
    stats.speechAnalysesCompleted +
    stats.cbtEntries +
    stats.sleepRecordsLogged +
    stats.tasksCompleted +
    stats.focusSessionsCompleted;
  const level = 1 + Math.floor(totalActions / 5);

  const memberSince = new Date(stats.joinedDate).toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen p-4 pb-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-gray-800 dark:text-white mb-2">Profile & Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your account and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 p-6 rounded-2xl shadow-lg mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-gray-800 dark:text-white">{userName}</h2>
              <p className="text-gray-600 dark:text-gray-300">Member since {memberSince}</p>
            </div>
          </div>

          {/* Stats - all derived from real activity, not fixed numbers */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white dark:bg-[#121212] p-3 rounded-xl text-center border border-gray-200 dark:border-[#2d2d2d] transition-colors duration-300">
              <p className="text-2xl mb-1">🔥</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{streak} Day Streak</p>
            </div>
            <div className="bg-white dark:bg-[#121212] p-3 rounded-xl text-center border border-gray-200 dark:border-[#2d2d2d] transition-colors duration-300">
              <p className="text-2xl mb-1">⭐</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Level {level}</p>
            </div>
            <div className="bg-white dark:bg-[#121212] p-3 rounded-xl text-center border border-gray-200 dark:border-[#2d2d2d] transition-colors duration-300">
              <p className="text-2xl mb-1">🏆</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{unlockedAchievements.length} Badges</p>
            </div>
          </div>
        </div>

        {/* Achievements - unlocked based on real thresholds */}
        <div className="bg-white dark:bg-[#121212] p-6 rounded-xl shadow mb-4 border border-gray-200 dark:border-[#2d2d2d] transition-colors duration-300">
          <h3 className="text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Award size={20} />
            Achievements
          </h3>
          <div className="space-y-3">
            {ACHIEVEMENTS.map(achievement => {
              const progress = achievement.progress(stats, streak);
              const unlocked = progress >= achievement.target;
              return (
                <AchievementBadge
                  key={achievement.title}
                  emoji={achievement.emoji}
                  title={achievement.title}
                  description={achievement.description}
                  progress={Math.min(progress, achievement.target)}
                  target={achievement.target}
                  unlocked={unlocked}
                />
              );
            })}
          </div>
        </div>

        {/* App Usage Stats - real counts pulled from things you've actually used */}
        <div className="bg-white dark:bg-[#121212] p-6 rounded-xl shadow mb-4 border border-gray-200 dark:border-[#2d2d2d] transition-colors duration-300">
          <h3 className="text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            Your Activity
          </h3>
          <div className="space-y-4">
            <UsageStat label="Focus Sessions Completed" value={stats.focusSessionsCompleted} color="blue" />
            <UsageStat label="Study Tasks Completed" value={stats.tasksCompleted} color="blue" />
            <UsageStat label="Speech Analyses" value={stats.speechAnalysesCompleted} color="green" />
            <UsageStat label="CBT Entries Logged" value={stats.cbtEntries} color="pink" />
            <UsageStat label="Sleep Records Logged" value={stats.sleepRecordsLogged} color="pink" />
            <UsageStat label="Active Reminders" value={stats.remindersActive} color="blue" />
          </div>
        </div>

        {/* Settings Section */}
        <div className="space-y-3">
          {/* Appearance */}
          <div className="bg-white dark:bg-[#121212] p-5 rounded-xl shadow border border-gray-200 dark:border-[#2d2d2d] transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                <div>
                  <p className="text-gray-800 dark:text-white">Appearance</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                  </p>
                </div>
              </div>
              <button
                onClick={onToggleDarkMode}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  isDarkMode ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    isDarkMode ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Safe Space Policy */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full bg-white dark:bg-[#121212] p-5 rounded-xl shadow text-left hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors border border-gray-200 dark:border-[#2d2d2d] duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="text-green-600" size={20} />
                <div>
                  <p className="text-gray-800 dark:text-white">Safe Space Policy</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Privacy & community guidelines
                  </p>
                </div>
              </div>
              <span className="text-gray-400">›</span>
            </div>
          </button>

          {showSettings && (
            <div className="bg-green-50 dark:bg-green-900 p-5 rounded-xl border-2 border-green-200 dark:border-green-700">
              <h4 className="text-green-900 dark:text-green-100 mb-3">Our Safe Space Commitment</h4>
              <ul className="text-sm text-green-800 dark:text-green-200 space-y-2">
                <li>✓ Your data is encrypted and secure</li>
                <li>✓ Community is moderated for kindness</li>
                <li>✓ No judgment, only support</li>
                <li>✓ Report inappropriate content anytime</li>
              </ul>
            </div>
          )}

          {/* Privacy Controls */}
          <button className="w-full bg-white dark:bg-[#121212] p-5 rounded-xl shadow text-left hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors border border-gray-200 dark:border-[#2d2d2d] duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="text-gray-600 dark:text-gray-400" size={20} />
                <div>
                  <p className="text-gray-800 dark:text-white">Privacy Controls</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage your data and permissions
                  </p>
                </div>
              </div>
              <span className="text-gray-400">›</span>
            </div>
          </button>

          {/* Backup & Sync */}
          <button className="w-full bg-white dark:bg-[#121212] p-5 rounded-xl shadow text-left hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors border border-gray-200 dark:border-[#2d2d2d] duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="text-blue-600 dark:text-blue-400" size={20} />
                <div>
                  <p className="text-gray-800 dark:text-white">Backup & Sync</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your progress is saved on this device
                  </p>
                </div>
              </div>
              <span className="text-gray-400">›</span>
            </div>
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full bg-red-50 dark:bg-red-900 p-5 rounded-xl shadow text-left hover:bg-red-100 dark:hover:bg-red-800 transition-colors border-2 border-red-200 dark:border-red-700"
          >
            <div className="flex items-center gap-3">
              <LogOut className="text-red-600 dark:text-red-400" size={20} />
              <div>
                <p className="text-red-900 dark:text-red-100">Logout</p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Sign out of your account
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* App Info */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Hello Buddy v1.0.0</p>
          <p className="mt-1">🌟 Your companion for growth and wellness 🌟</p>
        </div>
      </div>
    </div>
  );
}

function AchievementBadge({ emoji, title, description, progress, target, unlocked }: {
  emoji: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  unlocked: boolean;
}) {
  const percentage = Math.min(100, Math.round((progress / target) * 100));

  return (
    <div className={`flex items-center gap-4 p-3 rounded-lg ${
      unlocked
        ? 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900'
        : 'bg-gray-100 dark:bg-gray-700'
    }`}>
      <div className={`text-3xl ${!unlocked && 'grayscale opacity-60'}`}>
        {emoji}
      </div>
      <div className="flex-1">
        <p className="text-gray-800 dark:text-white">{title}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        {!unlocked && (
          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-purple-400 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
      </div>
      {unlocked ? (
        <span className="text-green-600 dark:text-green-400">✓</span>
      ) : (
        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
          {progress}/{target}
        </span>
      )}
    </div>
  );
}

function UsageStat({ label, value, color }: {
  label: string;
  value: number;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    pink: 'text-pink-600 dark:text-pink-400'
  };

  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <span className={colorClasses[color]}>{value}</span>
    </div>
  );
}
