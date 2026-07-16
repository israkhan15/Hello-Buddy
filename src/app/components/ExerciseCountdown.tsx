import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExerciseCountdownProps {
  exerciseName: string;
  duration: string; // e.g., "5 min", "10 min"
  onClose: () => void;
}

export function ExerciseCountdown({ exerciseName, duration, onClose }: ExerciseCountdownProps) {
  // Parse duration string to get total seconds
  const parseDuration = (dur: string): number => {
    const match = dur.match(/(\d+)\s*min/);
    if (match) {
      return parseInt(match[1]) * 60;
    }
    return 300; // default 5 minutes
  };

  const totalSeconds = parseDuration(duration);
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            // Play completion sound (optional)
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(totalSeconds);
    setIsComplete(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Exercise Name */}
        <div className="text-center mb-6">
          <h3 className="text-gray-800 dark:text-white text-xl font-medium mb-1">
            {exerciseName}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {duration} workout
          </p>
        </div>

        {/* Circular Timer */}
        <div className="relative w-56 h-56 mx-auto mb-6">
          {/* Background Circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="112"
              cy="112"
              r="90"
              stroke="currentColor"
              className="text-gray-200 dark:text-gray-700"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress Circle */}
            <motion.circle
              cx="112"
              cy="112"
              r="90"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {isComplete ? (
                <motion.div
                  key="complete"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="text-center"
                >
                  <CheckCircle className="text-green-500 mx-auto mb-2" size={64} />
                  <p className="text-gray-800 dark:text-white font-medium">Complete!</p>
                </motion.div>
              ) : (
                <motion.div
                  key="timer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <motion.div
                    key={timeLeft}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-5xl font-bold text-gray-800 dark:text-white mb-1"
                  >
                    {formatTime(timeLeft)}
                  </motion.div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isRunning ? 'Keep going!' : 'Ready to start?'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3 justify-center">
          {!isComplete ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlayPause}
                className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-2 font-medium"
              >
                {isRunning ? (
                  <>
                    <Pause size={20} />
                    Pause
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    {timeLeft === totalSeconds ? 'Start' : 'Resume'}
                  </>
                )}
              </motion.button>
              {timeLeft !== totalSeconds && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <RotateCcw size={20} />
                  Reset
                </motion.button>
              )}
            </>
          ) : (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-2 font-medium"
            >
              <RotateCcw size={20} />
              Do Again
            </motion.button>
          )}
        </div>

        {/* Progress Bar */}
        {!isComplete && (
          <div className="mt-6">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-orange-500 to-red-500 h-full"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              {Math.round(progress)}% complete
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
