import { useState, useEffect } from 'react';
import { Heart, Brain, Moon, Activity, BookHeart, Users, Phone, Play, Pause, RotateCcw, Calendar, Award, Music, Youtube, Trash2 } from 'lucide-react';
import { GroupChatRoom } from './GroupChatRoom';
import { BreathHoldChallenge } from './BreathHoldChallenge';
import { ExerciseCountdown } from './ExerciseCountdown';
import { AnimatePresence } from 'motion/react';
import { bumpStat } from '../lib/appStats';

type WellnessTab = 'mindfulness' | 'cbt' | 'sleep' | 'activity' | 'community';

interface CBTEntry {
  date: string;
  mood: number;
  thought: string;
  reframe: string;
}

interface SleepRecord {
  date: string;
  hours: number;
  quality: number;
  bedTime: string;
  wakeTime: string;
}

interface ChatRoomInfo {
  name: string;
  members: number;
  active: boolean;
  description: string;
}

export function Wellness() {
  const [activeTab, setActiveTab] = useState<WellnessTab>('mindfulness');
  const [currentMood, setCurrentMood] = useState<number>(3);
  const [activeChatRoom, setActiveChatRoom] = useState<ChatRoomInfo | null>(null);
  
  // Exercise countdown state
  const [activeExercise, setActiveExercise] = useState<{ title: string; duration: string } | null>(null);
  
  // CBT states
  const [thoughtEntry, setThoughtEntry] = useState('');
  const [reframeEntry, setReframeEntry] = useState('');
  const [cbtEntries, setCbtEntries] = useState<CBTEntry[]>([
    { date: '2025-12-02', mood: 2, thought: 'I failed my test', reframe: 'This is a learning opportunity to improve next time' },
    { date: '2025-12-04', mood: 4, thought: 'Today was productive', reframe: 'I accomplished my goals and feel proud' },
    { date: '2025-12-07', mood: 3, thought: 'Feeling anxious about presentation', reframe: 'I am prepared and will do my best' }
  ]);
  
  // Sleep tracker states
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState(7);
  const [bedTime, setBedTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [weeklySleepRecords, setWeeklySleepRecords] = useState<SleepRecord[]>([
    { date: 'Mon', hours: 7.5, quality: 8, bedTime: '23:00', wakeTime: '06:30' },
    { date: 'Tue', hours: 6.5, quality: 6, bedTime: '23:30', wakeTime: '06:00' },
    { date: 'Wed', hours: 8, quality: 9, bedTime: '22:30', wakeTime: '06:30' },
    { date: 'Thu', hours: 7, quality: 7, bedTime: '23:00', wakeTime: '06:00' },
    { date: 'Fri', hours: 6, quality: 5, bedTime: '00:00', wakeTime: '06:00' },
    { date: 'Sat', hours: 9, quality: 9, bedTime: '22:00', wakeTime: '07:00' }
  ]);
  
  // Sleep timer states
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState(0);
  const [sleepTimerSeconds, setSleepTimerSeconds] = useState(0);
  const [isSleepTimerRunning, setIsSleepTimerRunning] = useState(false);
  const [selectedSleepDuration, setSelectedSleepDuration] = useState<number | null>(null);

  // Sleep timer effect
  useEffect(() => {
    if (!isSleepTimerRunning) return;
    
    const interval = setInterval(() => {
      if (sleepTimerMinutes === 0 && sleepTimerSeconds === 0) {
        // Timer finished
        setIsSleepTimerRunning(false);
        return;
      }
      
      if (sleepTimerSeconds === 0) {
        setSleepTimerMinutes(prev => prev - 1);
        setSleepTimerSeconds(59);
      } else {
        setSleepTimerSeconds(prev => prev - 1);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isSleepTimerRunning, sleepTimerMinutes, sleepTimerSeconds]);

  const saveCBTEntry = () => {
    if (!thoughtEntry.trim()) return;
    
    const newEntry: CBTEntry = {
      date: new Date().toISOString().split('T')[0],
      mood: currentMood,
      thought: thoughtEntry,
      reframe: reframeEntry
    };
    
    setCbtEntries([newEntry, ...cbtEntries]);
    setThoughtEntry('');
    setReframeEntry('');
    bumpStat('cbtEntries');
  };

  const deleteCBTEntry = (index: number) => {
    const updatedEntries = cbtEntries.filter((_, idx) => idx !== index);
    setCbtEntries(updatedEntries);
  };

  const saveSleepRecord = () => {
    const newRecord: SleepRecord = {
      date: 'Sun',
      hours: sleepHours,
      quality: sleepQuality,
      bedTime: bedTime,
      wakeTime: wakeTime
    };
    
    setWeeklySleepRecords([...weeklySleepRecords.slice(0, 6), newRecord]);
    bumpStat('sleepRecordsLogged');
  };

  const startSleepTimer = (minutes: number) => {
    setSleepTimerMinutes(minutes);
    setSleepTimerSeconds(0);
    setSelectedSleepDuration(minutes);
    setIsSleepTimerRunning(true);
  };

  const pauseSleepTimer = () => {
    setIsSleepTimerRunning(false);
  };

  const resumeSleepTimer = () => {
    setIsSleepTimerRunning(true);
  };

  const resetSleepTimer = () => {
    setIsSleepTimerRunning(false);
    setSleepTimerMinutes(0);
    setSleepTimerSeconds(0);
    setSelectedSleepDuration(null);
  };

  const getWeeklyCBTOverview = () => {
    const thisWeek = cbtEntries.slice(0, 7);
    const avgMood = thisWeek.reduce((sum, e) => sum + e.mood, 0) / thisWeek.length;
    const totalEntries = thisWeek.length;
    
    return {
      averageMood: avgMood.toFixed(1),
      totalEntries,
      moodTrend: avgMood > 2.5 ? 'positive' : 'needs attention',
      insights: avgMood > 3.5 
        ? 'Great week! Your mood has been mostly positive.' 
        : avgMood > 2.5 
        ? 'Your mood is stable. Keep practicing reframing techniques.'
        : 'This week has been challenging. Remember to reach out for support.'
    };
  };

  const sleepStories = [
    { id: 1, title: 'Peaceful Mountain Journey', duration: '25 min' },
    { id: 2, title: 'Ocean Waves at Sunset', duration: '30 min' },
    { id: 3, title: 'Forest Rain', duration: '45 min' },
    { id: 4, title: 'Starry Night Dreams', duration: '20 min' }
  ];

  const exercises = [
    { id: 1, title: 'Morning Stretch', duration: '5 min', type: 'Stretching' },
    { id: 2, title: 'Desk Break Yoga', duration: '10 min', type: 'Yoga' },
    { id: 3, title: 'Quick Cardio Burst', duration: '7 min', type: 'Cardio' },
    { id: 4, title: 'Evening Wind Down', duration: '8 min', type: 'Relaxation' }
  ];

  const moods = ['😢', '😟', '😐', '🙂', '😊'];

  // If in a chat room, show ONLY the chat room interface.
  // This check now happens AFTER all hooks above have run, so hook order
  // stays consistent between renders (fixes the Community tab crash).
  if (activeChatRoom) {
    return (
      <GroupChatRoom
        roomName={activeChatRoom.name}
        members={activeChatRoom.members}
        description={activeChatRoom.description}
        onBack={() => setActiveChatRoom(null)}
      />
    );
  }

  return (
    <div className="min-h-screen p-4 pb-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-gray-800 dark:text-white mb-2">Emotional Wellness</h1>
          <p className="text-gray-600 dark:text-gray-300">Your safe space for mental and emotional health</p>
        </div>

        {/* Tab Grid */}
        <div className="grid grid-cols-3 gap-2 mb-6 bg-white dark:bg-gray-800 p-2 rounded-xl shadow">
          <TabButton
            icon="🧘"
            label="Mindfulness"
            active={activeTab === 'mindfulness'}
            onClick={() => setActiveTab('mindfulness')}
          />
          <TabButton
            icon="🧠"
            label="CBT Tools"
            active={activeTab === 'cbt'}
            onClick={() => setActiveTab('cbt')}
          />
          <TabButton
            icon="🌙"
            label="Sleep"
            active={activeTab === 'sleep'}
            onClick={() => setActiveTab('sleep')}
          />
          <TabButton
            icon="💪"
            label="Activity"
            active={activeTab === 'activity'}
            onClick={() => setActiveTab('activity')}
          />
          <TabButton
            icon="👥"
            label="Community"
            active={activeTab === 'community'}
            onClick={() => setActiveTab('community')}
          />
        </div>

        {/* Mindfulness Tab */}
        {activeTab === 'mindfulness' && (
          <div className="space-y-4">
            {/* Breath-Holding Challenge - NEW FEATURE */}
            <div>
              <h3 className="text-gray-800 dark:text-white mb-4">🫁 Breath-Holding Challenge</h3>
              <BreathHoldChallenge />
            </div>

            {/* Calming Music Section */}
            <div className="mt-6">
              <h3 className="text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Music size={20} />
                Calming Music
              </h3>
              
              <div className="space-y-4">
                {/* Morning Calm Music */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-gray-800 dark:text-white">Morning Calm</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Peaceful melodies to start your day</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                      🌅
                    </div>
                  </div>
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src="https://www.youtube.com/embed/lTRiuFIWV54" 
                      title="Morning Calm Music"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      className="border-0"
                    />
                  </div>
                </div>

                {/* Stress Relief Music */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-gray-800 dark:text-white">Stress Relief</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Relaxing sounds to ease tension</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-teal-400 flex items-center justify-center">
                      🍃
                    </div>
                  </div>
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src="https://www.youtube.com/embed/1ZYbU82GVz4" 
                      title="Stress Relief Music"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      className="border-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CBT Toolkit Tab */}
        {activeTab === 'cbt' && (
          <div className="space-y-4">
            {/* Weekly Overview */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 p-6 rounded-xl">
              <h3 className="text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                <Award size={20} />
                This Week's Overview
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center">
                  <p className="text-2xl text-purple-600 dark:text-purple-400">
                    {getWeeklyCBTOverview().averageMood}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Mood</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center">
                  <p className="text-2xl text-purple-600 dark:text-purple-400">
                    {getWeeklyCBTOverview().totalEntries}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Entries</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {getWeeklyCBTOverview().insights}
              </p>
            </div>

            {/* Mood Selector */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
              <h3 className="text-gray-800 dark:text-white mb-4">How are you feeling today?</h3>
              <div className="flex justify-around mb-4">
                {moods.map((mood, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentMood(index)}
                    className={`text-4xl transition-all transform ${
                      currentMood === index ? 'scale-125' : 'scale-100 opacity-50'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            {/* Thought Diary */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
              <h3 className="text-gray-800 dark:text-white mb-4">Daily Thought Diary</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    What's on your mind?
                  </label>
                  <textarea
                    value={thoughtEntry}
                    onChange={(e) => setThoughtEntry(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-purple-400 focus:outline-none"
                    rows={3}
                    placeholder="Write down your thoughts..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    How can you reframe this thought?
                  </label>
                  <textarea
                    value={reframeEntry}
                    onChange={(e) => setReframeEntry(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-purple-400 focus:outline-none"
                    rows={3}
                    placeholder="Try looking at it from a different perspective..."
                  />
                </div>
                <button 
                  onClick={saveCBTEntry}
                  className="w-full py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Save Daily Entry
                </button>
              </div>
            </div>

            {/* Past Entries */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
              <h3 className="text-gray-800 dark:text-white mb-4">Recent Entries</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {cbtEntries.map((entry, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{entry.date}</p>
                      <span className="text-xl">{moods[entry.mood]}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      <strong>Thought:</strong> {entry.thought}
                    </p>
                    {entry.reframe && (
                      <p className="text-sm text-purple-600 dark:text-purple-400 mb-3">
                        <strong>Reframe:</strong> {entry.reframe}
                      </p>
                    )}
                    <button
                      onClick={() => deleteCBTEntry(idx)}
                      className="flex items-center gap-1 text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors mt-2"
                    >
                      <Trash2 size={16} />
                      Delete Entry
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Journaling Prompts */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 p-6 rounded-xl">
              <h3 className="text-gray-800 dark:text-white mb-3">Today's Prompt</h3>
              <p className="text-gray-700 dark:text-gray-300 italic">
                "What is one thing you learned about yourself this week?"
              </p>
            </div>
          </div>
        )}

        {/* Sleep Tab */}
        {activeTab === 'sleep' && (
          <div className="space-y-4">
            {/* Sleep Tracker */}
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 p-6 rounded-xl shadow-lg">
              <h3 className="text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Moon size={20} />
                Sleep Tracker
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Hours Slept
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="12"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-center text-gray-800 dark:text-white mt-1">
                    {sleepHours} hours
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Sleep Quality (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={sleepQuality}
                    onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-center text-gray-800 dark:text-white mt-1">
                    {sleepQuality}/10
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Bed Time
                    </label>
                    <input
                      type="time"
                      value={bedTime}
                      onChange={(e) => setBedTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Wake Time
                    </label>
                    <input
                      type="time"
                      value={wakeTime}
                      onChange={(e) => setWakeTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  onClick={saveSleepRecord}
                  className="w-full py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Log Sleep Data
                </button>
              </div>
            </div>

            {/* Weekly Sleep Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
              <h3 className="text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Calendar size={20} />
                Weekly Sleep Pattern
              </h3>
              <div className="space-y-2">
                {weeklySleepRecords.map((record, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                      {record.date}
                    </span>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-6 relative">
                      <div 
                        className="bg-indigo-500 h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(record.hours / 12) * 100}%` }}
                      >
                        <span className="text-xs text-white">{record.hours}h</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Q: {record.quality}/10
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Average: {(weeklySleepRecords.reduce((sum, r) => sum + r.hours, 0) / weeklySleepRecords.length).toFixed(1)} hours/night
                </p>
              </div>
            </div>

            {/* Sleep Stories */}
            <h3 className="text-gray-800 dark:text-white">Sleep Stories</h3>
            {sleepStories.map(story => (
              <div
                key={story.id}
                className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-2xl">
                    🌙
                  </div>
                  <div>
                    <h4 className="text-gray-800 dark:text-white">{story.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{story.duration}</p>
                  </div>
                </div>
                <button className="p-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-colors">
                  ▶️
                </button>
              </div>
            ))}

            {/* Soundscapes */}
            <h3 className="text-gray-800 dark:text-white mt-6">Soundscapes</h3>
            <div className="grid grid-cols-2 gap-3">
              <SoundscapeCard emoji="🌊" title="Ocean Waves" />
              <SoundscapeCard emoji="🌧️" title="Rain Sounds" />
              <SoundscapeCard emoji="🔥" title="Crackling Fire" />
              <SoundscapeCard emoji="🌲" title="Forest Ambience" />
            </div>

            {/* Sleep Timer */}
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 p-6 rounded-xl">
              <h3 className="text-gray-800 dark:text-white mb-4 text-center">Sleep Timer</h3>
              
              {selectedSleepDuration === null ? (
                <>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 text-center text-sm">
                    Choose duration for auto-stop
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button 
                      onClick={() => startSleepTimer(15)}
                      className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                    >
                      15 min
                    </button>
                    <button 
                      onClick={() => startSleepTimer(30)}
                      className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                    >
                      30 min
                    </button>
                    <button 
                      onClick={() => startSleepTimer(60)}
                      className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                    >
                      60 min
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Circular Timer Display */}
                  <div className="relative w-48 h-48 mx-auto mb-6">
                    <svg className="transform -rotate-90 w-48 h-48">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-indigo-200 dark:text-indigo-800"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={2 * Math.PI * 88}
                        strokeDashoffset={2 * Math.PI * 88 * (1 - ((sleepTimerMinutes * 60 + sleepTimerSeconds) / (selectedSleepDuration * 60)))}
                        className="text-indigo-500 transition-all duration-1000"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl text-gray-800 dark:text-white">
                        {sleepTimerMinutes}:{sleepTimerSeconds.toString().padStart(2, '0')}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {selectedSleepDuration} min timer
                      </span>
                    </div>
                  </div>

                  {/* Timer Controls */}
                  <div className="flex gap-2 justify-center">
                    {!isSleepTimerRunning ? (
                      <button
                        onClick={resumeSleepTimer}
                        className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-2"
                      >
                        <Play size={20} />
                        Play
                      </button>
                    ) : (
                      <button
                        onClick={pauseSleepTimer}
                        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                      >
                        <Pause size={20} />
                        Pause
                      </button>
                    )}
                    <button
                      onClick={resetSleepTimer}
                      className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      <RotateCcw size={20} />
                      Reset
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            {/* Activity Stats */}
            <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 p-6 rounded-xl">
              <h3 className="text-gray-800 dark:text-white mb-4">Today's Activity</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl text-orange-600 dark:text-orange-400">5,234</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Steps</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl text-orange-600 dark:text-orange-400">23</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Active min</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl text-orange-600 dark:text-orange-400">145</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Calories</p>
                </div>
              </div>
            </div>

            {/* Exercise Cards */}
            <h3 className="text-gray-800 dark:text-white">Recommended Exercises</h3>
            {exercises.map(exercise => (
              <div
                key={exercise.id}
                className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-gray-800 dark:text-white">{exercise.title}</h4>
                    <div className="flex gap-3 mt-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {exercise.duration}
                      </span>
                      <span className="text-sm text-orange-600 dark:text-orange-400">
                        {exercise.type}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveExercise({ title: exercise.title, duration: exercise.duration })}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Start
                  </button>
                </div>
              </div>
            ))}

            {/* YouTube Video Suggestions */}
            <div className="mt-6">
              <h3 className="text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Youtube size={20} />
                Video Workouts
              </h3>
              
              <div className="space-y-4">
                {/* Yoga Video */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-gray-800 dark:text-white">Beginner Yoga Flow</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Gentle 10-minute yoga sequence</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      🧘
                    </div>
                  </div>
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src="https://www.youtube.com/embed/v7AYKMP6rOE" 
                      title="Yoga Workout"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      className="border-0"
                    />
                  </div>
                </div>

                {/* Stretching Video */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-gray-800 dark:text-white">Full Body Stretch</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Release tension and improve flexibility</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                      🤸
                    </div>
                  </div>
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src="https://www.youtube.com/embed/g_tea8ZNk5A" 
                      title="Stretching Workout"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      className="border-0"
                    />
                  </div>
                </div>

                {/* Cardio Video */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-gray-800 dark:text-white">Cardio Workout</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Quick cardio to boost your energy</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center">
                      🔥
                    </div>
                  </div>
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src="https://www.youtube.com/embed/ml6cT4AZdqI" 
                      title="Cardio Workout"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      className="border-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Community Tab */}
        {activeTab === 'community' && (
          <div className="space-y-4">
            {/* Group Chat Rooms */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
              <h3 className="text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Users size={20} />
                Group Support Rooms
              </h3>
              <div className="space-y-3">
                <ChatRoom 
                  name="Study Together"
                  members={45}
                  active={true}
                  description="Focus sessions and study accountability"
                  onClick={() => setActiveChatRoom({ name: 'Study Together', members: 45, active: true, description: 'Focus sessions and study accountability' })}
                />
                <ChatRoom 
                  name="Anxiety Support"
                  members={32}
                  active={true}
                  description="Safe space to share and support each other"
                  onClick={() => setActiveChatRoom({ name: 'Anxiety Support', members: 32, active: true, description: 'Safe space to share and support each other' })}
                />
                <ChatRoom 
                  name="Communication Practice"
                  members={28}
                  active={false}
                  description="Practice conversations in a supportive environment"
                  onClick={() => setActiveChatRoom({ name: 'Communication Practice', members: 28, active: false, description: 'Practice conversations in a supportive environment' })}
                />
                <ChatRoom 
                  name="Goal Achievers"
                  members={51}
                  active={true}
                  description="Share progress and celebrate wins together"
                  onClick={() => setActiveChatRoom({ name: 'Goal Achievers', members: 51, active: true, description: 'Share progress and celebrate wins together' })}
                />
                <ChatRoom 
                  name="Depression Support"
                  members={38}
                  active={true}
                  description="Understanding and healing together"
                  onClick={() => setActiveChatRoom({ name: 'Depression Support', members: 38, active: true, description: 'Understanding and healing together' })}
                />
                <ChatRoom 
                  name="Sleep Wellness"
                  members={24}
                  active={true}
                  description="Share tips for better sleep and rest"
                  onClick={() => setActiveChatRoom({ name: 'Sleep Wellness', members: 24, active: true, description: 'Share tips for better sleep and rest' })}
                />
                <ChatRoom 
                  name="Exam Stress Relief"
                  members={56}
                  active={true}
                  description="Navigate exam season with peer support"
                  onClick={() => setActiveChatRoom({ name: 'Exam Stress Relief', members: 56, active: true, description: 'Navigate exam season with peer support' })}
                />
                <ChatRoom 
                  name="Social Anxiety Warriors"
                  members={41}
                  active={true}
                  description="Building confidence in social situations"
                  onClick={() => setActiveChatRoom({ name: 'Social Anxiety Warriors', members: 41, active: true, description: 'Building confidence in social situations' })}
                />
              </div>
            </div>

            {/* Buddy Matching */}
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 p-6 rounded-xl">
              <h3 className="text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                <Heart size={20} />
                Accountability Buddy Matching
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Get matched with someone who shares similar goals and challenges
              </p>
              <button className="w-full py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                Find My Buddy
              </button>
            </div>

            {/* Success Stories */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
              <h3 className="text-gray-800 dark:text-white mb-4">Community Success Stories</h3>
              <div className="space-y-3">
                <SuccessStory 
                  user="Sarah M."
                  story="Overcame presentation anxiety and aced my final project! This community's support was invaluable. 💪"
                  likes={127}
                />
                <SuccessStory 
                  user="Alex K."
                  story="Improved my sleep schedule from 5hrs to 8hrs consistently. The sleep tracker really helped!"
                  likes={93}
                />
                <SuccessStory 
                  user="Jordan P."
                  story="Used CBT tools daily for a month and my anxiety is so much more manageable now. Thank you! 🌟"
                  likes={156}
                />
              </div>
            </div>

            {/* Peer Support Forum */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
              <h3 className="text-gray-800 dark:text-white mb-4">Peer Support Forum</h3>
              <div className="space-y-3">
                <ForumTopic
                  title="Managing study stress during finals"
                  replies={24}
                  category="Study Stress"
                />
                <ForumTopic
                  title="Tips for staying motivated"
                  replies={18}
                  category="Motivation"
                />
                <ForumTopic
                  title="Dealing with social anxiety"
                  replies={31}
                  category="Wellbeing"
                />
              </div>
              <button className="w-full mt-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Browse All Topics
              </button>
            </div>

            {/* Crisis Support */}
            <div className="bg-red-50 dark:bg-red-900 p-6 rounded-xl border-2 border-red-200 dark:border-red-700">
              <h3 className="text-red-900 dark:text-red-100 mb-4 flex items-center gap-2">
                <Phone size={20} />
                Crisis Support Directory
              </h3>
              <div className="space-y-3">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-gray-800 dark:text-white">National Suicide Prevention Lifeline</p>
                  <p className="text-blue-600 dark:text-blue-400">1-800-273-8255</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-gray-800 dark:text-white">Crisis Text Line</p>
                  <p className="text-blue-600 dark:text-blue-400">Text HOME to 741741</p>
                </div>
              </div>
              <button className="w-full mt-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                🚨 Emergency Support
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Exercise Countdown Modal */}
      <AnimatePresence>
        {activeExercise && (
          <ExerciseCountdown
            exerciseName={activeExercise.title}
            duration={activeExercise.duration}
            onClose={() => setActiveExercise(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TabButton({ icon, label, active, onClick }: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`py-2 px-1 rounded-lg transition-all text-xs ${
        active
          ? 'bg-pink-500 text-white shadow-md'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <div className="text-lg mb-1">{icon}</div>
      <div>{label}</div>
    </button>
  );
}

function SoundscapeCard({ emoji, title }: { emoji: string; title: string }) {
  return (
    <button className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-lg transition-all text-center">
      <div className="text-3xl mb-2">{emoji}</div>
      <p className="text-sm text-gray-700 dark:text-gray-300">{title}</p>
    </button>
  );
}

function ForumTopic({ title, replies, category }: {
  title: string;
  replies: number;
  category: string;
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
      <h4 className="text-gray-800 dark:text-white mb-2">{title}</h4>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-purple-600 dark:text-purple-400">{category}</span>
        <span className="text-gray-500 dark:text-gray-400">💬 {replies} replies</span>
      </div>
    </div>
  );
}

function ChatRoom({ name, members, active, description, onClick }: {
  name: string;
  members: number;
  active: boolean;
  description: string;
  onClick: () => void;
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer" onClick={onClick}>
      <h4 className="text-gray-800 dark:text-white mb-2">{name}</h4>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-blue-600 dark:text-blue-400">{members} members</span>
        <span className="text-gray-500 dark:text-gray-400">{active ? 'Active' : 'Inactive'}</span>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{description}</p>
    </div>
  );
}

function SuccessStory({ user, story, likes }: {
  user: string;
  story: string;
  likes: number;
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
      <h4 className="text-gray-800 dark:text-white mb-2">{user}</h4>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{story}</p>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-500 dark:text-gray-400">Likes: {likes}</span>
      </div>
    </div>
  );
}