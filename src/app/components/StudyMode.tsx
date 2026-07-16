import { useState, useEffect, useRef } from 'react';
import { Plus, Clock, Lock, Play, Pause, CheckCircle, Calendar, Bell, Edit2, Trash2, X, Trophy, Target, Zap, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { ReminderPopup } from './ReminderPopup';
import { bumpStat, setStat } from '../lib/appStats';

interface Reminder {
  id: number;
  title: string;
  time: string;
  enabled: boolean;
  days: string[];
}

interface Task {
  id: number;
  text: string;
  completed: boolean;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  category?: string;
}

export function StudyMode() {
  const [activeTab, setActiveTab] = useState<'planner' | 'focus' | 'reminders'>('planner');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [isFocusActive, setIsFocusActive] = useState(false);
  const [focusTime, setFocusTime] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  
  // Reminder states
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);

  // The reminder currently showing as a full-screen popup with ringtone.
  // Stays set (and the popup stays on screen) until the person hits Decline.
  const [activePopupReminder, setActivePopupReminder] = useState<Reminder | null>(null);

  // Keep the Profile screen's "active reminders" stat in sync with reality.
  useEffect(() => {
    setStat('remindersActive', reminders.filter(r => r.enabled).length);
  }, [reminders]);

  // Tracks "reminderId:HH:MM" keys that have already fired, so a reminder
  // only notifies once per matching minute even though we now check more often.
  const firedThisMinuteRef = useRef<Set<string>>(new Set());

  // Whether the browser Notification API is available at all AND whether
  // permission has been granted. Some environments (sandboxed iframes,
  // certain in-app webviews, older browsers) don't expose `Notification`
  // at all, so we never read the global directly during render - that was
  // crashing the Reminders tab with a ReferenceError in those environments.
  const notificationsSupported = typeof window !== 'undefined' && 'Notification' in window;
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(
    notificationsSupported ? Notification.permission : 'unsupported'
  );

  // Request notification permission on mount
  useEffect(() => {
    if (notificationsSupported && Notification.permission === 'default') {
      Notification.requestPermission()
        .then((permission) => setNotificationPermission(permission))
        .catch(() => {
          // Permission prompt dismissed or blocked - reminders will still
          // show as in-app toast notifications below.
        });
    }
  }, [notificationsSupported]);

  const requestNotificationPermission = () => {
    if (!notificationsSupported) return;
    Notification.requestPermission()
      .then((permission) => {
        setNotificationPermission(permission);
        if (permission === 'granted') {
          toast.success('Notifications enabled! 🔔 You\'ll get reminders even when this tab is in the background.');
        } else if (permission === 'denied') {
          toast.info('Notifications blocked. You\'ll still see in-app reminders while Hello Buddy is open.');
        }
      })
      .catch(() => {
        toast.info('Couldn\'t enable browser notifications here. In-app reminders will still work.');
      });
  };

  // Check reminders every 15 seconds (checking only once a minute risks
  // missing the exact match if the browser throttles background timers)
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];

      reminders.forEach(reminder => {
        if (!reminder.enabled || reminder.time !== currentTime || !reminder.days.includes(currentDay)) {
          return;
        }

        const fireKey = `${reminder.id}:${currentTime}`;
        if (firedThisMinuteRef.current.has(fireKey)) return;
        firedThisMinuteRef.current.add(fireKey);

        triggerNotification(reminder.title);
        // Persistent popup + ringtone - stays up until the person declines it,
        // regardless of which tab or screen they're currently on.
        setActivePopupReminder(reminder);
      });

      // Clean up old keys so the set doesn't grow forever
      if (firedThisMinuteRef.current.size > 200) {
        firedThisMinuteRef.current.clear();
      }
    };

    const interval = setInterval(checkReminders, 15000);
    return () => clearInterval(interval);
  }, [reminders]);

  // Focus timer countdown
  useEffect(() => {
    if (!isFocusActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsFocusActive(false);
          triggerNotification('Focus session complete! Great work! 🎉');
          bumpStat('focusSessionsCompleted');
          return focusTime * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isFocusActive, focusTime]);

  // Auto-remove completed tasks after animation
  useEffect(() => {
    const completedTasks = tasks.filter(task => task.completed);
    
    if (completedTasks.length > 0) {
      const timer = setTimeout(() => {
        setTasks(tasks.filter(task => !task.completed));
      }, 2000); // Remove after 2 seconds to show completion animation

      return () => clearTimeout(timer);
    }
  }, [tasks]);

  const triggerNotification = (title: string) => {
    // Always show an in-app toast so the reminder is visible no matter what -
    // this is the reliable path since browser notifications can be blocked,
    // unsupported (e.g. inside an iframe preview), or simply not yet granted.
    toast('📚 Study Reminder', {
      description: title,
      duration: 8000,
    });

    // Also fire a real OS-level notification when we're allowed to, so
    // reminders still reach the user if the tab isn't focused.
    if (notificationsSupported && Notification.permission === 'granted') {
      try {
        new Notification('Study Reminder 📚', {
          body: title,
          icon: '🔔',
          badge: '📚',
        });
      } catch {
        // Some browsers throw if Notification is constructed from a
        // context that doesn't support it (e.g. certain service-worker-only
        // environments) - the toast above already covered the user.
      }
    }
  };

  const addOrUpdateReminder = () => {
    if (!reminderTitle.trim()) return;

    if (editingReminder) {
      setReminders(reminders.map(r => 
        r.id === editingReminder.id 
          ? { ...r, title: reminderTitle, time: reminderTime, days: selectedDays }
          : r
      ));
      setEditingReminder(null);
    } else {
      const newReminder: Reminder = {
        id: Date.now(),
        title: reminderTitle,
        time: reminderTime,
        enabled: true,
        days: selectedDays
      };
      setReminders([...reminders, newReminder]);
    }

    setReminderTitle('');
    setReminderTime('09:00');
    setSelectedDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    setShowReminderForm(false);
  };

  const toggleReminder = (id: number) => {
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const deleteReminder = (id: number) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const editReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setReminderTitle(reminder.title);
    setReminderTime(reminder.time);
    setSelectedDays(reminder.days);
    setShowReminderForm(true);
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const addTask = () => {
    if (newTask.trim()) {
      const newTaskObj: Task = {
        id: Date.now(),
        text: newTask,
        completed: false,
        dueDate: new Date().toISOString().split('T')[0],
        priority: newTaskPriority
      };
      setTasks([...tasks, newTaskObj]);
      setNewTask('');
      setNewTaskPriority('medium');
    }
  };

  const toggleTask = (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
      // Show completion animation
      setShowCompletionAnimation(true);
      setCompletedTasksCount(prev => prev + 1);
      bumpStat('tasksCompleted');
      setTimeout(() => setShowCompletionAnimation(false), 1000);
    }

    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const highPriorityTasks = activeTasks.filter(t => t.priority === 'high');
  const progressPercentage = tasks.length > 0 
    ? Math.round((completedTasksCount / (completedTasksCount + activeTasks.length)) * 100) 
    : 0;

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-gray-800 dark:text-white mb-2">Study Mode</h1>
          <p className="text-gray-600 dark:text-gray-300">Organize your studies and stay focused with smart task management</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-white dark:bg-gray-800 p-1 rounded-xl shadow">
          <button
            onClick={() => setActiveTab('planner')}
            className={`flex-1 py-3 rounded-lg transition-all ${
              activeTab === 'planner'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            📝 Study Planner
          </button>
          <button
            onClick={() => setActiveTab('focus')}
            className={`flex-1 py-3 rounded-lg transition-all ${
              activeTab === 'focus'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            🔒 Focus Mode
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`flex-1 py-3 rounded-lg transition-all ${
              activeTab === 'reminders'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            🔔 Reminders
          </button>
        </div>

        {/* Completion Animation Overlay */}
        {showCompletionAnimation && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="animate-bounce bg-green-500 text-white px-8 py-4 rounded-full shadow-2xl text-2xl">
              ✅ Task Completed!
            </div>
          </div>
        )}

        {/* Study Planner Tab */}
        {activeTab === 'planner' && (
          <div className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 p-4 rounded-xl shadow">
                <div className="flex items-center justify-between mb-2">
                  <Target size={20} className="text-blue-600 dark:text-blue-300" />
                </div>
                <p className="text-2xl text-blue-700 dark:text-blue-200 font-bold">{activeTasks.length}</p>
                <p className="text-xs text-blue-600 dark:text-blue-300">Active Tasks</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 p-4 rounded-xl shadow">
                <div className="flex items-center justify-between mb-2">
                  <Trophy size={20} className="text-green-600 dark:text-green-300" />
                </div>
                <p className="text-2xl text-green-700 dark:text-green-200 font-bold">{completedTasksCount}</p>
                <p className="text-xs text-green-600 dark:text-green-300">Completed</p>
              </div>

              <div className="bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 p-4 rounded-xl shadow">
                <div className="flex items-center justify-between mb-2">
                  <Zap size={20} className="text-red-600 dark:text-red-300" />
                </div>
                <p className="text-2xl text-red-700 dark:text-red-200 font-bold">{highPriorityTasks.length}</p>
                <p className="text-xs text-red-600 dark:text-red-300">High Priority</p>
              </div>
            </div>

            {/* Add Task */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    placeholder="Add a new task... (e.g., 'Study Math Chapter 5')"
                    className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-blue-400 focus:outline-none"
                  />
                  <button
                    onClick={addTask}
                    className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                
                {/* Priority Selector */}
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Priority:</span>
                  <button
                    onClick={() => setNewTaskPriority('high')}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      newTaskPriority === 'high'
                        ? 'bg-red-500 text-white'
                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}
                  >
                    High
                  </button>
                  <button
                    onClick={() => setNewTaskPriority('medium')}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      newTaskPriority === 'medium'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}
                  >
                    Medium
                  </button>
                  <button
                    onClick={() => setNewTaskPriority('low')}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      newTaskPriority === 'low'
                        ? 'bg-green-500 text-white'
                        : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    }`}
                  >
                    Low
                  </button>
                </div>
              </div>
            </div>

            {/* Feature Explanation Card */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 p-4 rounded-xl border-2 border-purple-200 dark:border-purple-700">
              <div className="flex items-start gap-3">
                <Zap className="text-purple-600 dark:text-purple-300 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h3 className="text-purple-900 dark:text-purple-100 font-semibold mb-1">
                    ✨ Smart Task Management
                  </h3>
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    Completed tasks automatically disappear after 2 seconds, keeping your list clean and focused on what's next. Your progress is saved!
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {(activeTasks.length > 0 || completedTasksCount > 0) && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <TrendingUp size={18} className="text-blue-500" />
                    Overall Progress
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    {progressPercentage}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  {completedTasksCount} completed • {activeTasks.length} remaining
                </p>
              </div>
            )}

            {/* Task List */}
            {activeTasks.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-12 rounded-xl shadow text-center">
                <CheckCircle size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-gray-800 dark:text-white mb-2 text-xl">All Clear! 🎉</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {completedTasksCount > 0 
                    ? `Great job! You've completed ${completedTasksCount} task${completedTasksCount > 1 ? 's' : ''} today.`
                    : 'No tasks yet. Add your first task to get started!'}
                </p>
                {completedTasksCount > 0 && (
                  <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full">
                    <Trophy size={20} />
                    <span>You're doing amazing!</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {activeTasks.map(task => (
                  <div
                    key={task.id}
                    className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow transition-all hover:shadow-lg animate-fadeIn"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900 transition-all flex items-center justify-center"
                      >
                        {task.completed && <CheckCircle size={16} className="text-green-500" />}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 dark:text-white break-words">
                          {task.text}
                        </p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            task.priority === 'high'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                              : task.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                              : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          }`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                        title="Delete task"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Motivational Footer */}
            {activeTasks.length > 0 && (
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 p-4 rounded-xl text-center">
                <p className="text-blue-900 dark:text-blue-100 italic">
                  💪 "{activeTasks.length} task{activeTasks.length > 1 ? 's' : ''} to conquer. You've got this!"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Focus Mode Tab */}
        {activeTab === 'focus' && (
          <div className="space-y-6">
            {/* Timer Settings */}
            {!isFocusActive && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
                <label className="block text-gray-700 dark:text-gray-300 mb-3 text-lg">
                  Focus Duration (minutes)
                </label>
                <input
                  type="range"
                  min="5"
                  max="120"
                  value={focusTime}
                  onChange={(e) => {
                    const newTime = parseInt(e.target.value);
                    setFocusTime(newTime);
                    setTimeLeft(newTime * 60);
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="text-center mt-4 text-3xl text-blue-600 dark:text-blue-400 font-bold">
                  {focusTime} minutes
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {[15, 25, 45, 60].map(time => (
                    <button
                      key={time}
                      onClick={() => {
                        setFocusTime(time);
                        setTimeLeft(time * 60);
                      }}
                      className={`py-2 px-3 rounded-lg text-sm transition-all ${
                        focusTime === time
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {time}m
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Timer Display */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-10 rounded-2xl shadow-xl text-white text-center">
              <Lock className="mx-auto mb-6" size={56} />
              <div className="text-7xl mb-8 tabular-nums font-bold">
                {formatTime(timeLeft)}
              </div>
              <button
                onClick={() => setIsFocusActive(!isFocusActive)}
                className="px-10 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all shadow-lg flex items-center gap-3 mx-auto text-lg font-semibold"
              >
                {isFocusActive ? (
                  <>
                    <Pause size={24} />
                    Pause Focus
                  </>
                ) : (
                  <>
                    <Play size={24} />
                    Start Focus Mode
                  </>
                )}
              </button>
            </div>

            {/* Focus Mode Info */}
            {isFocusActive && (
              <div className="bg-yellow-100 dark:bg-yellow-900 p-5 rounded-xl border-2 border-yellow-300 dark:border-yellow-700">
                <p className="text-yellow-900 dark:text-yellow-100 text-center mb-2">
                  🔒 <strong>Focus Mode Active</strong>
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center mb-3">
                  Distractions blocked. Stay focused on your goals!
                </p>
                <button 
                  onClick={() => setIsFocusActive(false)}
                  className="w-full py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                >
                  End Focus Session
                </button>
              </div>
            )}

            {/* Focus Tips */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
              <h3 className="text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                <Zap className="text-blue-500" size={20} />
                Focus Mode Benefits
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Blocks distracting apps and notifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Improves concentration and productivity</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Tracks your study time automatically</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Alerts you when session is complete</span>
                </li>
              </ul>
            </div>

            {/* Motivational Message */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 p-6 rounded-xl text-center border-2 border-purple-200 dark:border-purple-700">
              <p className="text-purple-900 dark:text-purple-100 italic text-lg">
                "Deep focus brings deep results. You've got this! 🎯"
              </p>
            </div>
          </div>
        )}

        {/* Reminders Tab */}
        {activeTab === 'reminders' && (
          <div className="space-y-6">
            {/* Feature Explanation */}
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-700">
              <div className="flex items-start gap-3">
                <Bell className="text-blue-600 dark:text-blue-300 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h3 className="text-blue-900 dark:text-blue-100 font-semibold mb-1">
                    📅 Smart Study Reminders
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Set custom reminders for study sessions, assignments, or exams. Get notified at the perfect time across selected days!
                  </p>
                </div>
              </div>
            </div>

            {/* Add/Edit Reminder Form */}
            {showReminderForm && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-gray-800 dark:text-white mb-4 text-xl font-semibold">
                  {editingReminder ? 'Edit Reminder' : 'Add New Reminder'}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Title</label>
                    <input
                      type="text"
                      value={reminderTitle}
                      onChange={(e) => setReminderTitle(e.target.value)}
                      placeholder="e.g., Math Homework, Study Session"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Time</label>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Repeat on Days</label>
                    <div className="flex gap-2 flex-wrap">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <button
                          key={day}
                          onClick={() => toggleDay(day)}
                          className={`px-4 py-2 rounded-lg transition-all font-medium ${
                            selectedDays.includes(day)
                              ? 'bg-blue-500 text-white shadow-md'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 justify-end mt-6">
                  <button
                    onClick={() => {
                      setShowReminderForm(false);
                      setEditingReminder(null);
                      setReminderTitle('');
                      setReminderTime('09:00');
                      setSelectedDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
                    }}
                    className="px-5 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addOrUpdateReminder}
                    className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    {editingReminder ? 'Update Reminder' : 'Add Reminder'}
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {reminders.length === 0 && !showReminderForm && (
              <div className="bg-white dark:bg-gray-800 p-12 rounded-xl shadow text-center">
                <Bell size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-gray-800 dark:text-white mb-2 text-xl">No Reminders Set</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create custom study reminders to stay on track with your goals
                </p>
              </div>
            )}

            {/* Reminder List */}
            <div className="space-y-3">
              {reminders.map(reminder => (
                <div
                  key={reminder.id}
                  className={`bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md transition-all hover:shadow-lg ${
                    !reminder.enabled ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Bell size={18} className={reminder.enabled ? 'text-blue-500' : 'text-gray-400'} />
                        <p className="text-gray-800 dark:text-white font-semibold truncate">
                          {reminder.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-sm flex-wrap">
                        <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Clock size={14} />
                          {reminder.time}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {reminder.days.join(', ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => editReminder(reminder)}
                        className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteReminder(reminder.id)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={() => toggleReminder(reminder.id)}
                        className={`px-4 py-2 rounded-lg transition-all font-medium ${
                          reminder.enabled
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600'
                        }`}
                        title={reminder.enabled ? 'Disable' : 'Enable'}
                      >
                        {reminder.enabled ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Reminder Button */}
            {!showReminderForm && (
              <button
                onClick={() => setShowReminderForm(true)}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold text-lg"
              >
                <Plus size={24} />
                Add New Reminder
              </button>
            )}

            {/* Notification Permission Info */}
            {reminders.length > 0 && notificationsSupported && notificationPermission !== 'granted' && (
              <div className="bg-yellow-100 dark:bg-yellow-900 p-5 rounded-xl border-2 border-yellow-300 dark:border-yellow-700">
                <p className="text-yellow-900 dark:text-yellow-100 text-center mb-1">
                  ⚠️ <strong>Enable Notifications</strong>
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center mb-3">
                  Allow notifications to receive reminders even when this tab isn't focused.
                  {notificationPermission === 'denied' && ' (You\'ll still see in-app reminders while the app is open.)'}
                </p>
                {notificationPermission !== 'denied' && (
                  <button 
                    onClick={requestNotificationPermission}
                    className="w-full py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                  >
                    Enable Notifications
                  </button>
                )}
              </div>
            )}

            {reminders.length > 0 && !notificationsSupported && (
              <div className="bg-blue-100 dark:bg-blue-900 p-5 rounded-xl border-2 border-blue-300 dark:border-blue-700">
                <p className="text-blue-900 dark:text-blue-100 text-center text-sm">
                  🔔 Browser notifications aren't available in this preview, but you'll still get an in-app reminder popup while Hello Buddy is open.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {activePopupReminder && (
        <ReminderPopup
          title={activePopupReminder.title}
          time={activePopupReminder.time}
          onDecline={() => setActivePopupReminder(null)}
        />
      )}
    </div>
  );
}
