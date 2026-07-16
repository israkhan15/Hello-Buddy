import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles, BookOpen, Mic, Heart, Brain, Moon, Target } from 'lucide-react';

interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIChatbot({ isOpen, onClose }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      text: "Hi there! I'm your AI Buddy! 🌟 I'm an intelligent, context-aware assistant here to support you with clarity and empathy. Whether it's study challenges, communication, wellness, or anything on your mind - I'm listening. What can I help you with today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationContext, setConversationContext] = useState<string[]>([]);
  const [userMood, setUserMood] = useState<'neutral' | 'stressed' | 'motivated' | 'confused'>('neutral');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { icon: <BookOpen size={16} />, label: 'Study Tips', message: 'Can you give me some effective study tips?' },
    { icon: <Mic size={16} />, label: 'Communication', message: 'Help me improve my communication skills' },
    { icon: <Heart size={16} />, label: 'Feeling Down', message: 'I\'m feeling stressed and overwhelmed' },
    { icon: <Target size={16} />, label: 'Set Goals', message: 'Help me set achievable goals' }
  ];

  // Detect user mood from message
  const detectMood = (message: string): 'neutral' | 'stressed' | 'motivated' | 'confused' => {
    const lower = message.toLowerCase();
    if (lower.includes('stress') || lower.includes('anxious') || lower.includes('overwhelm') || lower.includes('panic') || lower.includes('worried')) {
      return 'stressed';
    }
    if (lower.includes('excit') || lower.includes('motivated') || lower.includes('ready') || lower.includes('let\'s go')) {
      return 'motivated';
    }
    if (lower.includes('don\'t understand') || lower.includes('confused') || lower.includes('unclear') || lower.includes('what') || lower.includes('how')) {
      return 'confused';
    }
    return 'neutral';
  };

  const getBotResponse = (userMessage: string, context: string[], mood: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Context-aware: Check recent conversation
    const recentContext = context.slice(-3).join(' ').toLowerCase();
    
    // Intelligent inference: Handle unclear or informal input
    const isQuestion = lowerMessage.includes('?') || lowerMessage.includes('how') || lowerMessage.includes('what') || lowerMessage.includes('why') || lowerMessage.includes('when') || lowerMessage.includes('where');
    const isShortResponse = userMessage.length < 15;

    // Study-related responses with context awareness
    if (lowerMessage.includes('study') || lowerMessage.includes('focus') || lowerMessage.includes('exam') || lowerMessage.includes('learning') || lowerMessage.includes('test') || lowerMessage.includes('homework')) {
      if (recentContext.includes('study')) {
        // Continuing study conversation - provide deeper insights
        const followUpResponses = [
          "Building on that - here's a powerful technique: **Active Recall**. Instead of passive rereading, close your book and write down everything you remember. This forces your brain to retrieve information, strengthening neural pathways by 50%! Try it for 10 minutes right now. What topic will you test yourself on? 🧠",
          "Let's go deeper! **The Feynman Technique** is incredible: 1) Choose a concept, 2) Teach it in simple terms (like to a 5-year-old), 3) Identify gaps in your understanding, 4) Review and simplify further. If you can explain it simply, you truly understand it. Want to try explaining your current topic to me? 🎓",
          "Here's something game-changing: **Interleaving**. Don't study one topic for hours. Mix subjects! Study Math for 30 min, then English, then Science. It feels harder but increases retention by 43%. Your brain builds stronger connections. Ready to try this approach? 📚"
        ];
        return followUpResponses[Math.floor(Math.random() * followUpResponses.length)];
      }
      
      // Adapt to mood
      if (mood === 'stressed') {
        return "I can sense you're feeling the pressure. First, take a deep breath. 💙 Let's make studying manageable: **Break it into 15-minute chunks**. Just 15 minutes! Set a timer, focus on one small thing, then take a 5-min break. No overwhelm, just one chunk at a time. What's ONE small thing you can study right now? You've got this! 🌟";
      } else if (mood === 'motivated') {
        return "Love the energy! Let's channel that motivation! 🚀 Try **Power Hour**: 50 min intense focus + 10 min break. Use the Pomodoro technique with these productivity hacks: 1) Phone in another room, 2) Study in 'focus mode' location, 3) Start with hardest topic while energy is peak. What subject are you conquering first? 💪";
      }
      
      const studyResponses = [
        "Let's optimize your study approach! 📚 **Science-backed strategies**: 1) **Spaced Repetition** - review material at increasing intervals (1 day, 3 days, 7 days), 2) **Active Testing** - quiz yourself constantly, 3) **Elaboration** - connect new info to what you know. What subject are you working on? I'll help you create a custom plan! 🎯",
        "Smart studying > Hard studying! ✨ **The 80/20 Rule**: 20% of concepts yield 80% of exam value. Identify high-value topics first! Also: Study hardest material when most alert, use color-coding, create mind maps for visual connections. What's your biggest study challenge right now? 💡",
        "Here's your study blueprint: **Time-blocking** (assign specific topics to specific times), **Environment optimization** (consistent study spot = brain triggers focus), **Reward system** (small celebrations after each session). Want help building your personalized study schedule? 📅"
      ];
      return studyResponses[Math.floor(Math.random() * studyResponses.length)];
    }

    // Communication-related responses with depth
    if (lowerMessage.includes('speak') || lowerMessage.includes('presentation') || lowerMessage.includes('talk') || lowerMessage.includes('communication') || lowerMessage.includes('interview')) {
      if (recentContext.includes('communication') || recentContext.includes('speak')) {
        const followUpComm = [
          "Here's a pro tip: Record yourself speaking and play it back. It's uncomfortable but incredibly effective! You'll notice filler words, pace issues, and tone. Try it for just 1 minute! 🎥",
          "Power pose before speaking! Stand confidently for 2 minutes - it actually increases testosterone and reduces cortisol, making you feel more confident. Science-backed! Also, make eye contact with different people for 3-5 seconds each. 💪",
          "Practice the 'pause power' - silence is golden. When nervous, we rush. Instead, deliberately pause after key points. It gives you time to think and makes you sound authoritative. Try it! 🎤"
        ];
        return followUpComm[Math.floor(Math.random() * followUpComm.length)];
      }
      const commResponses = [
        "Communication is a superpower! 🌟 Start with the 3 E's: Eye contact (shows confidence), Enunciation (speak clearly), and Energy (show enthusiasm). Our Speech Analysis tool can give you real-time feedback. Have you tried practicing in front of a mirror? 🎤",
        "Great goal! Key tips: 1) Slow down (we speak 25% faster when nervous), 2) Use the PREP method (Point-Reason-Example-Point) to structure thoughts, 3) Breathe deeply from your diaphragm. Want to try our Role-Play scenarios? They're super helpful! 💬",
        "Building confidence takes practice! Start small: order coffee with confidence, make small talk, then level up. Structure helps: STAR method for stories (Situation-Task-Action-Result). Check out our Daily Evening Talk Practice for guided sessions! ✨"
      ];
      return commResponses[Math.floor(Math.random() * commResponses.length)];
    }

    // Stress/anxiety responses with empathy and actionable advice
    if (lowerMessage.includes('stress') || lowerMessage.includes('anxiety') || lowerMessage.includes('worried') || lowerMessage.includes('nervous') || lowerMessage.includes('overwhelm') || lowerMessage.includes('panic')) {
      const wellnessResponses = [
        "I hear you, and your feelings are completely valid. 💙 Let's try the 5-4-3-2-1 grounding technique RIGHT NOW: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. This pulls you back to the present. Take your time... How do you feel? 🌸",
        "Stress is your body trying to protect you, but we can work with it. Try box breathing: Inhale-4, Hold-4, Exhale-4, Hold-4. Do this 5 times. Also, write down what's stressing you - externalizing worries reduces their power by 30%. Our CBT Toolkit has journaling prompts! 📝",
        "You're stronger than you know. 💪 When overwhelmed: 1) Brain dump - write everything down, 2) Pick ONE tiny task you can do NOW, 3) Do it, 4) Celebrate! Small wins create momentum. Also, please reach out to friends, counselors, or family. You don't have to handle this alone. Need crisis resources? 🫂"
      ];
      return wellnessResponses[Math.floor(Math.random() * wellnessResponses.length)];
    }

    // Motivation responses with specific strategies
    if (lowerMessage.includes('motivat') || lowerMessage.includes('tired') || lowerMessage.includes('give up') || lowerMessage.includes('can\'t do') || lowerMessage.includes('quit')) {
      const motivationResponses = [
        "Hey, feeling tired means you've been working hard! 💪 But let's recharge: Take a 10-min walk (increases energy by 150%), drink water, do 5 jumping jacks. Sometimes 'rest' is more productive than pushing through. What would make you feel most energized right now? 🌟",
        "You know what? Everyone successful has felt like quitting. The difference? They took tiny next steps. Just commit to 5 minutes of work - that's it. Usually you'll keep going, but even if you stop, that's progress! Break your goal into micro-steps. What's one tiny thing you could do right now? 🎯",
        "Remember your 'why' - why did you start? Write it down and put it somewhere visible. Also, visualize success for 2 minutes: See yourself accomplishing your goal, feel that pride! Our brain doesn't distinguish between real and vividly imagined success - this actually builds motivation pathways. You've got this! 🚀"
      ];
      return motivationResponses[Math.floor(Math.random() * motivationResponses.length)];
    }

    // Time management and productivity
    if (lowerMessage.includes('time') || lowerMessage.includes('procrastinat') || lowerMessage.includes('deadline') || lowerMessage.includes('productive')) {
      return "Time management = life management! 🕐 Try this: 1) Time-block your day (assign specific tasks to specific times), 2) Use the 2-minute rule (if it takes &lt; 2 min, do it NOW), 3) Identify your peak productivity hours and schedule hard tasks then. Procrastination usually means the task feels overwhelming - break it into 5-minute chunks! Our Study Planner can help structure your schedule. What deadline are you working toward? ⏰";
    }

    // Sleep and rest
    if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia') || lowerMessage.includes('rest') || lowerMessage.includes('tired') || lowerMessage.includes('exhausted')) {
      return "Sleep is the foundation of everything! 😴 Create a wind-down routine: 1) No screens 30-60 min before bed (blue light disrupts melatonin), 2) Keep room cool (65-68°F ideal), 3) Try our Sleep Stories or soundscapes in Wellness, 4) Journal worries to 'close' mental tabs. Aim for consistent sleep/wake times - even on weekends! What's your biggest sleep challenge? 🌙";
    }

    // Goals and planning
    if (lowerMessage.includes('goal') || lowerMessage.includes('plan') || lowerMessage.includes('achieve') || lowerMessage.includes('success')) {
      return "Let's crush those goals! 🎯 Use SMART framework: Specific, Measurable, Achievable, Relevant, Time-bound. Example: Instead of 'study more,' try 'study biology 45 min daily at 7pm for 2 weeks.' Also break big goals into weekly milestones. What's your main goal right now? Let's make an action plan together! 📋";
    }

    // Self-care and wellness
    if (lowerMessage.includes('self-care') || lowerMessage.includes('wellness') || lowerMessage.includes('mental health') || lowerMessage.includes('depression')) {
      return "Self-care isn't selfish - it's essential! 💚 Non-negotiable daily basics: 7-9hr sleep, move your body (even 10 min walk counts), eat regularly, connect with someone. Also try: gratitude journaling (3 things daily), mindfulness (our Wellness section has guided exercises), and setting boundaries. If you're struggling significantly, please reach out to a counselor or therapist. You deserve support! 🌈";
    }

    // Gratitude/positive
    if (lowerMessage.includes('thank') || lowerMessage.includes('grateful') || lowerMessage.includes('happy') || lowerMessage.includes('great')) {
      return "That's wonderful! 🌟 Gratitude actually rewires your brain for positivity - keep this up! Have you tried keeping a gratitude journal? Write 3 specific things you're grateful for each day. Studies show this increases happiness by 25% over 10 weeks. What made you feel grateful today? ✨";
    }

    // Social connection
    if (lowerMessage.includes('friend') || lowerMessage.includes('lonely') || lowerMessage.includes('alone') || lowerMessage.includes('social')) {
      return "Human connection is vital! 🫂 Even small interactions matter. Try: 1) Join a study group or club, 2) Message someone you haven't talked to in a while, 3) Use our Community Support in Wellness to connect with others. Quality &gt; quantity - one good friend beats 100 acquaintances. What kind of social connection are you looking for? 💙";
    }

    // Confidence building
    if (lowerMessage.includes('confidence') || lowerMessage.includes('self-esteem') || lowerMessage.includes('doubt') || lowerMessage.includes('imposter')) {
      return "Confidence is built through action, not thought! 💪 Try this: 1) Keep a 'wins journal' - document every small success, 2) Challenge negative self-talk - would you talk to a friend that way? 3) Do something slightly scary every week (growth zone!). Remember: Everyone feels like an imposter sometimes. You're more capable than you think! What area do you want to build confidence in? 🌟";
    }

    // Greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi ') || lowerMessage.includes('hey') || lowerMessage.length < 10) {
      return "Hello! Great to see you! 😊 I'm here to help you with anything - whether you're tackling studies, building skills, managing stress, or just need someone to talk to. What's going on in your world today? 💙";
    }

    // Default responses with actionable suggestions
    const defaultResponses = [
      "I'm listening! 👂 Could you tell me more about what's on your mind? I'm here to help with study strategies, communication skills, stress management, goal setting, or anything else. What would be most helpful for you right now? 💙",
      "Thanks for sharing! I want to give you the best support possible. Are you looking for: study help 📚, communication tips 🎤, stress relief 🧘, motivation 💪, or something else? Let me know! 🌟",
      "That's interesting! I'm here for you. Whether you need practical advice, someone to brainstorm with, or just a friendly chat, I've got your back. What area would you like to explore together? ✨",
      "I appreciate you opening up! Remember: every challenge is an opportunity to grow stronger. How can I best support you right now? I can help with academics, personal growth, wellness, or we can just talk things through. 🌈"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSend = (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setConversationContext(prev => [...prev, textToSend]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking and response with more realistic delay
    setTimeout(() => {
      const botResponse: Message = {
        id: Date.now() + 1,
        sender: 'bot',
        text: getBotResponse(textToSend, conversationContext, detectMood(textToSend)),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setConversationContext(prev => [...prev, botResponse.text]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const handleQuickAction = (message: string) => {
    handleSend(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:justify-end p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Chatbot Container */}
      <div className="relative w-full max-w-md h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <Bot className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="text-white">AI Buddy</h3>
              <p className="text-xs text-purple-100 flex items-center gap-1">
                <Sparkles size={12} />
                Always here to help
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <X className="text-white" size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-none'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-bl-none shadow-md'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none shadow-md">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Quick actions:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action.message)}
                  className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300"
                >
                  {action.icon}
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-purple-400 focus:outline-none"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            AI Buddy provides supportive guidance • Not a replacement for professional help 💜
          </p>
        </div>
      </div>
    </div>
  );
}