import { useEffect, useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { StudyMode } from './components/StudyMode';
import { Communication } from './components/Communication';
import { Wellness } from './components/Wellness';
import { Profile } from './components/Profile';
import { AIChatbot } from './components/AIChatbot';
import { Toaster } from './components/ui/sonner';
import { Bot } from 'lucide-react';
import { recordVisitToday } from './lib/appStats';

type Screen = 'login' | 'home' | 'study' | 'communicate' | 'wellness' | 'profile';

export default function App() {
  // Initialize theme from localStorage or default to system preference
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme());
  const [userName, setUserName] = useState('');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  useEffect(() => {
    recordVisitToday();
  }, []);

  const handleLogin = (name: string) => {
    setUserName(name);
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    setUserName('');
    setCurrentScreen('login');
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
        {currentScreen === 'login' ? (
          <LoginScreen onLogin={handleLogin} />
        ) : (
          <div className="flex flex-col h-screen">
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto pb-20 bg-white dark:bg-black">
              {currentScreen === 'home' && (
                <Dashboard 
                  userName={userName} 
                  isDarkMode={isDarkMode}
                  onToggleDarkMode={toggleTheme}
                  onNavigate={setCurrentScreen}
                />
              )}
              {currentScreen === 'study' && <StudyMode />}
              {currentScreen === 'communicate' && <Communication />}
              {currentScreen === 'wellness' && <Wellness />}
              {currentScreen === 'profile' && (
                <Profile 
                  userName={userName}
                  isDarkMode={isDarkMode}
                  onToggleDarkMode={toggleTheme}
                  onLogout={handleLogout}
                />
              )}
            </div>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#121212] border-t border-gray-200 dark:border-[#2d2d2d] shadow-lg transition-colors duration-300">
              <div className="max-w-md mx-auto flex justify-around items-center h-16">
                <NavButton 
                  icon="🏠" 
                  label="Home" 
                  active={currentScreen === 'home'}
                  onClick={() => setCurrentScreen('home')}
                />
                <NavButton 
                  icon="📚" 
                  label="Study" 
                  active={currentScreen === 'study'}
                  onClick={() => setCurrentScreen('study')}
                />
                <NavButton 
                  icon="💬" 
                  label="Communicate" 
                  active={currentScreen === 'communicate'}
                  onClick={() => setCurrentScreen('communicate')}
                />
                <NavButton 
                  icon="🌸" 
                  label="Wellness" 
                  active={currentScreen === 'wellness'}
                  onClick={() => setCurrentScreen('wellness')}
                />
                <NavButton 
                  icon="👤" 
                  label="Profile" 
                  active={currentScreen === 'profile'}
                  onClick={() => setCurrentScreen('profile')}
                />
              </div>
            </nav>
          </div>
        )}
      </div>
      {isChatbotOpen && (
        <AIChatbot 
          isOpen={isChatbotOpen}
          onClose={() => setIsChatbotOpen(false)}
        />
      )}
      {currentScreen !== 'login' && !isChatbotOpen && (
        <button
          onClick={() => setIsChatbotOpen(true)}
          className="fixed bottom-20 right-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all hover:scale-110 animate-pulse"
        >
          <Bot size={28} />
        </button>
      )}
      <Toaster position="top-center" richColors />
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { 
  icon: string; 
  label: string; 
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-lg transition-all ${
        active 
          ? 'text-purple-600 dark:text-purple-400 scale-110' 
          : 'text-gray-500 dark:text-gray-400 hover:text-purple-500'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs">{label}</span>
    </button>
  );
}