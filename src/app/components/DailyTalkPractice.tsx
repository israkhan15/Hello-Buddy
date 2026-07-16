import { useState } from 'react';
import { Moon, Star, Mic, Volume2, Check, ArrowRight } from 'lucide-react';

interface DailyTalkPracticeProps {
  onClose: () => void;
}

export function DailyTalkPractice({ onClose }: DailyTalkPracticeProps) {
  const [currentStep, setCurrentStep] = useState<'intro' | 'topic' | 'practice' | 'complete'>('intro');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasSpoken, setHasSpoken] = useState(false);
  const [conversationTurns, setConversationTurns] = useState(0);

  const dailyTopics = [
    {
      id: 1,
      title: "Today's Highlights",
      icon: "🌟",
      prompt: "Tell me about the best part of your day today. What made you smile?",
      followUps: [
        "That sounds wonderful! What did you learn from that experience?",
        "How did that make you feel?",
        "Would you like to do something similar tomorrow?"
      ]
    },
    {
      id: 2,
      title: "Gratitude Reflection",
      icon: "💝",
      prompt: "What are three things you're grateful for today?",
      followUps: [
        "Those are beautiful things to appreciate! Why is the first one special to you?",
        "Gratitude is powerful. How can you show appreciation for these tomorrow?",
        "That's wonderful. How do you feel after reflecting on these?"
      ]
    },
    {
      id: 3,
      title: "Tomorrow's Goals",
      icon: "🎯",
      prompt: "What's one thing you want to accomplish tomorrow?",
      followUps: [
        "Great goal! What's your first step to achieve it?",
        "How will you feel when you complete this?",
        "What might challenge you, and how will you handle it?"
      ]
    },
    {
      id: 4,
      title: "Learning Moments",
      icon: "📚",
      prompt: "What's something new you learned or discovered today?",
      followUps: [
        "That's interesting! How can you apply this learning?",
        "What surprised you most about this discovery?",
        "Would you like to explore this topic more?"
      ]
    },
    {
      id: 5,
      title: "Kind Acts",
      icon: "🤝",
      prompt: "Did you do something kind today, or did someone show kindness to you?",
      followUps: [
        "That's so heartwarming! How did it make you feel?",
        "Kindness creates positive ripples. What inspired this act?",
        "How can you spread more kindness tomorrow?"
      ]
    },
    {
      id: 6,
      title: "Peaceful Thoughts",
      icon: "🌙",
      prompt: "Share a peaceful or calming thought to end your day.",
      followUps: [
        "That's a beautiful thought. Let's take a deep breath together.",
        "Such peace. How can you carry this feeling into tomorrow?",
        "Wonderful. You deserve this moment of tranquility."
      ]
    }
  ];

  const selectedTopicData = dailyTopics.find(t => t.title === selectedTopic);

  const handleStartPractice = () => {
    setCurrentStep('topic');
  };

  const handleSelectTopic = (topic: string) => {
    setSelectedTopic(topic);
    setCurrentStep('practice');
  };

  const handleRecordToggle = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate recording for 3-5 seconds
      setTimeout(() => {
        setIsRecording(false);
        setHasSpoken(true);
        setConversationTurns(conversationTurns + 1);
      }, 3000);
    }
  };

  const handleComplete = () => {
    setCurrentStep('complete');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-900 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Intro Screen */}
        {currentStep === 'intro' && (
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center animate-pulse">
                <Moon className="text-white" size={48} />
              </div>
              <h2 className="text-gray-800 dark:text-white mb-2">Evening Talk Practice</h2>
              <p className="text-gray-600 dark:text-gray-300">
                End your day with a peaceful conversation
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl mb-6">
              <h3 className="text-gray-800 dark:text-white mb-4">How it works:</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 dark:text-purple-400">1</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Choose a calming topic for tonight
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 dark:text-purple-400">2</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Speak naturally about your thoughts
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 dark:text-purple-400">3</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Practice clear, confident communication
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 dark:text-purple-400">4</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Reflect and sleep peacefully
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartPractice}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 mb-3"
            >
              Start Tonight's Practice
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        )}

        {/* Topic Selection Screen */}
        {currentStep === 'topic' && (
          <div className="p-6">
            <h2 className="text-gray-800 dark:text-white mb-2 text-center">Choose Tonight's Topic</h2>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              Pick what feels right for you tonight
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {dailyTopics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleSelectTopic(topic.title)}
                  className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-lg transition-all transform hover:scale-105 text-center"
                >
                  <div className="text-4xl mb-2">{topic.icon}</div>
                  <p className="text-sm text-gray-800 dark:text-white">{topic.title}</p>
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Back
            </button>
          </div>
        )}

        {/* Practice Screen */}
        {currentStep === 'practice' && selectedTopicData && (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">{selectedTopicData.icon}</div>
              <h2 className="text-gray-800 dark:text-white mb-2">{selectedTopicData.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Turn {conversationTurns + 1} of 3
              </p>
            </div>

            {/* AI Prompt */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl mb-6 shadow-md">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                  <Volume2 className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-purple-600 dark:text-purple-400 text-sm mb-1">AI Buddy asks:</p>
                  <p className="text-gray-800 dark:text-white">
                    {conversationTurns === 0 
                      ? selectedTopicData.prompt 
                      : selectedTopicData.followUps[conversationTurns - 1] || selectedTopicData.followUps[0]
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Recording Interface */}
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 p-8 rounded-2xl mb-6 text-center">
              <button
                onClick={handleRecordToggle}
                className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center transition-all transform ${
                  isRecording
                    ? 'bg-red-500 animate-pulse scale-110'
                    : 'bg-gradient-to-br from-purple-500 to-pink-500 hover:scale-110'
                }`}
              >
                {isRecording ? (
                  <div className="w-6 h-6 bg-white rounded" />
                ) : (
                  <Mic className="text-white" size={32} />
                )}
              </button>
              <p className="text-gray-800 dark:text-white">
                {isRecording ? 'Listening... Speak from your heart' : 'Tap to speak your thoughts'}
              </p>
              
              {isRecording && (
                <div className="mt-4 flex justify-center gap-1">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-purple-600 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 30 + 10}px`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Progress */}
            {hasSpoken && (
              <div className="bg-green-50 dark:bg-green-900 p-4 rounded-xl mb-4 flex items-center gap-3">
                <Check className="text-green-600 dark:text-green-400" size={24} />
                <p className="text-green-800 dark:text-green-200">
                  Great! You're expressing yourself clearly.
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3">
              {conversationTurns < 2 ? (
                <button
                  onClick={() => {
                    setHasSpoken(false);
                  }}
                  disabled={!hasSpoken}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRight size={20} />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  Complete Session
                  <Check size={20} />
                </button>
              )}
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Exit
              </button>
            </div>
          </div>
        )}

        {/* Completion Screen */}
        {currentStep === 'complete' && (
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-teal-400 flex items-center justify-center">
                <Star className="text-white" size={48} />
              </div>
              <h2 className="text-gray-800 dark:text-white mb-2">Wonderful Session!</h2>
              <p className="text-gray-600 dark:text-gray-300">
                You completed today's evening practice
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl mb-6">
              <h3 className="text-gray-800 dark:text-white mb-4">Session Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Topic:</span>
                  <span className="text-gray-800 dark:text-white">{selectedTopic}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Turns completed:</span>
                  <span className="text-green-600 dark:text-green-400">3/3 ✓</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Clarity score:</span>
                  <span className="text-green-600 dark:text-green-400">Excellent!</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 p-5 rounded-xl mb-6">
              <p className="text-gray-800 dark:text-white italic">
                "You spoke clearly and thoughtfully tonight. Rest well, knowing you're making progress every day. 🌙✨"
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              Continue to Sleep Mode
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
