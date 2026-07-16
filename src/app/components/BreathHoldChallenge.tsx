import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Trophy, AlertTriangle, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface DifficultyLevel {
  name: string;
  target: number;
  description: string;
  color: string;
}

const difficulties: Record<Difficulty, DifficultyLevel> = {
  beginner: {
    name: 'Beginner',
    target: 30,
    description: '15-30 seconds',
    color: 'from-green-400 to-emerald-500'
  },
  intermediate: {
    name: 'Intermediate',
    target: 60,
    description: '30-60 seconds',
    color: 'from-blue-400 to-cyan-500'
  },
  advanced: {
    name: 'Advanced',
    target: 90,
    description: '60+ seconds',
    color: 'from-purple-400 to-pink-500'
  }
};

const motivationalMessages = [
  "Stay Calm",
  "Relax Your Body",
  "You're Doing Great!",
  "Focus on Stillness",
  "Breathe Easy After",
  "Mind Over Matter",
  "Find Your Center",
  "Peace Within"
];

export function BreathHoldChallenge() {
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [bestRecord, setBestRecord] = useState<Record<Difficulty, number>>({
    beginner: 0,
    intermediate: 0,
    advanced: 0
  });
  const [currentMessage, setCurrentMessage] = useState(motivationalMessages[0]);
  const [showComplete, setShowComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load best records from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('breathHoldRecords');
    if (saved) {
      try {
        setBestRecord(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load records:', e);
      }
    }
  }, []);

  // Save best records to localStorage
  const saveBestRecord = (newTime: number) => {
    if (newTime > bestRecord[difficulty]) {
      const newRecords = { ...bestRecord, [difficulty]: newTime };
      setBestRecord(newRecords);
      localStorage.setItem('breathHoldRecords', JSON.stringify(newRecords));
    }
  };

  // Timer logic
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);

      // Rotate motivational messages
      messageIntervalRef.current = setInterval(() => {
        setCurrentMessage(motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]);
      }, 3000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
    };
  }, [isActive]);

  // Reset when difficulty changes
  useEffect(() => {
    if (isActive) {
      handleReset();
    }
  }, [difficulty]);

  // Check if target reached
  useEffect(() => {
    if (time >= difficulties[difficulty].target && isActive) {
      handleStop();
      setShowComplete(true);
      setTimeout(() => setShowComplete(false), 3000);
    }
  }, [time, difficulty, isActive]);

  const handleStart = () => {
    setIsActive(true);
    setTime(0);
    setCurrentMessage(motivationalMessages[0]);
  };

  const handleStop = () => {
    setIsActive(false);
    if (time > 0) {
      saveBestRecord(time);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setTime(0);
    setCurrentMessage(motivationalMessages[0]);
  };

  const progress = Math.min((time / difficulties[difficulty].target) * 100, 100);
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Safety Warning */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-200 dark:border-amber-700 p-4 rounded-xl flex items-start gap-3"
      >
        <AlertTriangle className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <p className="text-sm text-amber-800 dark:text-amber-200 font-medium mb-1">
            Safety First
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Do not attempt while underwater or if you feel dizzy. Stop immediately if uncomfortable. 
            This is a mindfulness exercise only.
          </p>
        </div>
      </motion.div>

      {/* Difficulty Selection */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <h3 className="text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Target size={20} />
          Select Challenge Level
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(difficulties) as Difficulty[]).map((level) => (
            <button
              key={level}
              onClick={() => !isActive && setDifficulty(level)}
              disabled={isActive}
              className={`p-4 rounded-xl transition-all ${
                difficulty === level
                  ? 'bg-gradient-to-br ' + difficulties[level].color + ' text-white shadow-lg scale-105'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:scale-102'
              } ${isActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <p className="font-medium text-sm">{difficulties[level].name}</p>
              <p className="text-xs opacity-90 mt-1">{difficulties[level].description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Challenge Area */}
      <motion.div
        layout
        className={`bg-gradient-to-br ${difficulties[difficulty].color} p-8 rounded-2xl shadow-2xl relative overflow-hidden`}
      >
        {/* Animated Background Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              initial={{ 
                x: Math.random() * 100 + '%', 
                y: Math.random() * 100 + '%',
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{
                y: [null, Math.random() * 100 + '%'],
                x: [null, Math.random() * 100 + '%'],
                scale: [null, Math.random() * 0.5 + 0.5],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10">
          <h3 className="text-white text-center mb-2 text-xl font-medium">
            Breath-Holding Challenge
          </h3>
          <p className="text-white/90 text-center text-sm mb-6">
            {difficulties[difficulty].name} Level
          </p>

          {/* Circular Progress */}
          <div className="relative w-64 h-64 mx-auto mb-6">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="12"
                fill="none"
              />
              {/* Progress Circle */}
              <motion.circle
                cx="128"
                cy="128"
                r="120"
                stroke="white"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                key={time}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-white text-6xl font-bold mb-2"
              >
                {time}
              </motion.div>
              <p className="text-white text-sm opacity-90">seconds</p>
              <p className="text-white text-xs mt-2 opacity-75">
                Target: {difficulties[difficulty].target}s
              </p>
            </div>
          </div>

          {/* Motivational Message */}
          <AnimatePresence mode="wait">
            {isActive && (
              <motion.div
                key={currentMessage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center mb-6"
              >
                <p className="text-white text-lg font-medium">
                  {currentMessage}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Completion Animation */}
          <AnimatePresence>
            {showComplete && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-2xl"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  >
                    <Trophy className="text-yellow-300 mx-auto mb-2" size={64} />
                  </motion.div>
                  <p className="text-white text-2xl font-bold">Challenge Complete!</p>
                  <p className="text-white/90 text-sm mt-2">Amazing work! 🎉</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Control Buttons */}
          <div className="flex gap-3 justify-center">
            {!isActive ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                className="px-8 py-3 bg-white text-gray-800 rounded-full hover:shadow-lg transition-all flex items-center gap-2 font-medium"
              >
                <Play size={20} />
                Start Challenge
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStop}
                className="px-8 py-3 bg-white text-gray-800 rounded-full hover:shadow-lg transition-all flex items-center gap-2 font-medium"
              >
                <Pause size={20} />
                Stop
              </motion.button>
            )}
            {time > 0 && !isActive && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="px-6 py-3 bg-white/90 text-gray-800 rounded-full hover:shadow-lg transition-all flex items-center gap-2"
              >
                <RotateCcw size={20} />
                Reset
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Best Records */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <h3 className="text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Trophy size={20} className="text-yellow-500" />
          Personal Best Records
        </h3>
        <div className="space-y-3">
          {(Object.keys(difficulties) as Difficulty[]).map((level) => (
            <div
              key={level}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${difficulties[level].color}`} />
                <div>
                  <p className="text-gray-800 dark:text-white font-medium">
                    {difficulties[level].name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {difficulties[level].description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {bestRecord[level]}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">seconds</p>
              </div>
            </div>
          ))}
        </div>
        {Object.values(bestRecord).every(v => v === 0) && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4 italic">
            Complete your first challenge to set a record!
          </p>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 p-6 rounded-xl">
        <h3 className="text-gray-800 dark:text-white mb-3 font-medium">
          Tips for Success
        </h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>Take 2-3 deep breaths before starting to oxygenate your body</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>Stay relaxed and avoid tensing your muscles</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>Focus on a calm, peaceful thought or visualization</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>Practice regularly to gradually improve your capacity</span>
          </li>
        </ul>
      </div>
    </div>
  );
}