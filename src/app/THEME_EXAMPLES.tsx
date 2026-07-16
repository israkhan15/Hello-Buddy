/**
 * THEME SWITCHING EXAMPLES
 * 
 * This file contains code examples showing how the theme system works.
 * Copy these examples into your components as needed.
 */

import { ThemeSwitch } from './components/ThemeSwitch';

// ============================================
// EXAMPLE 1: Basic Theme Switch Implementation
// ============================================

export function Example1_BasicSetup() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <ThemeSwitch 
          isDarkMode={isDarkMode}
          onToggle={() => setIsDarkMode(!isDarkMode)}
          variant="toggle"
          showLabel={true}
        />
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 2: Theme Switch Variants
// ============================================

export function Example2_AllVariants({ isDarkMode, onToggle }) {
  return (
    <div className="space-y-6 p-8 bg-white dark:bg-gray-900">
      {/* Toggle Variant */}
      <div>
        <h3 className="text-gray-800 dark:text-white mb-3">Toggle Switch</h3>
        <ThemeSwitch 
          isDarkMode={isDarkMode}
          onToggle={onToggle}
          variant="toggle"
          showLabel={true}
        />
      </div>

      {/* Icon Variant */}
      <div>
        <h3 className="text-gray-800 dark:text-white mb-3">Icon Button</h3>
        <ThemeSwitch 
          isDarkMode={isDarkMode}
          onToggle={onToggle}
          variant="icon"
        />
      </div>

      {/* Button Variant */}
      <div>
        <h3 className="text-gray-800 dark:text-white mb-3">Full Button</h3>
        <ThemeSwitch 
          isDarkMode={isDarkMode}
          onToggle={onToggle}
          variant="button"
          showLabel={true}
        />
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 3: Card Component (Theme-Aware)
// ============================================

export function Example3_ThemeCard() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-gray-800 dark:text-white mb-3 text-xl">
        Card Title
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        This card automatically adapts to light and dark modes with proper colors,
        borders, and shadows.
      </p>
      <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
        Action Button
      </button>
    </div>
  );
}

// ============================================
// EXAMPLE 4: Gradient Backgrounds
// ============================================

export function Example4_GradientCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Blue Gradient */}
      <div className="bg-gradient-to-br from-blue-100 to-sky-100 dark:from-blue-900 dark:to-sky-900 p-6 rounded-xl">
        <h4 className="text-blue-900 dark:text-blue-100 mb-2">Blue Theme</h4>
        <p className="text-blue-700 dark:text-blue-300 text-sm">
          Light blue in light mode, dark blue in dark mode
        </p>
      </div>

      {/* Purple Gradient */}
      <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 p-6 rounded-xl">
        <h4 className="text-purple-900 dark:text-purple-100 mb-2">Purple Theme</h4>
        <p className="text-purple-700 dark:text-purple-300 text-sm">
          Light purple in light mode, dark purple in dark mode
        </p>
      </div>

      {/* Green Gradient */}
      <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 p-6 rounded-xl">
        <h4 className="text-green-900 dark:text-green-100 mb-2">Green Theme</h4>
        <p className="text-green-700 dark:text-green-300 text-sm">
          Light green in light mode, dark green in dark mode
        </p>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 5: Form Elements
// ============================================

export function Example5_FormElements() {
  return (
    <form className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl">
      {/* Text Input */}
      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          Name
        </label>
        <input
          type="text"
          placeholder="Enter your name"
          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-purple-400 dark:focus:border-purple-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Textarea */}
      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          Message
        </label>
        <textarea
          placeholder="Enter your message"
          rows={4}
          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-purple-400 dark:focus:border-purple-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Button */}
      <button 
        type="submit"
        className="w-full py-3 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-lg transition-colors"
      >
        Submit
      </button>
    </form>
  );
}

// ============================================
// EXAMPLE 6: Navigation Bar
// ============================================

export function Example6_NavigationBar({ isDarkMode, onToggle }) {
  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white">
              HB
            </div>
            <span className="text-gray-800 dark:text-white font-semibold">
              Hello Buddy
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Home
            </a>
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Features
            </a>
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              About
            </a>
            
            {/* Theme Switch */}
            <ThemeSwitch 
              isDarkMode={isDarkMode}
              onToggle={onToggle}
              variant="icon"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}

// ============================================
// EXAMPLE 7: Alert/Notification Components
// ============================================

export function Example7_Alerts() {
  return (
    <div className="space-y-4">
      {/* Success Alert */}
      <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 p-4 rounded-xl">
        <p className="text-green-800 dark:text-green-200">
          ✓ Success! Your changes have been saved.
        </p>
      </div>

      {/* Warning Alert */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 p-4 rounded-xl">
        <p className="text-yellow-800 dark:text-yellow-200">
          ⚠️ Warning: Please review your information.
        </p>
      </div>

      {/* Error Alert */}
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 p-4 rounded-xl">
        <p className="text-red-800 dark:text-red-200">
          ✕ Error: Something went wrong.
        </p>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 p-4 rounded-xl">
        <p className="text-blue-800 dark:text-blue-200">
          ℹ️ Info: New features available.
        </p>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 8: Stats Cards
// ============================================

export function Example8_StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">+12%</span>
        </div>
        <h3 className="text-2xl text-gray-800 dark:text-white mb-1">2,345</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <span className="text-2xl">✅</span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">+8%</span>
        </div>
        <h3 className="text-2xl text-gray-800 dark:text-white mb-1">1,234</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Completed Tasks</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
            <span className="text-2xl">⭐</span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">+25%</span>
        </div>
        <h3 className="text-2xl text-gray-800 dark:text-white mb-1">567</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Achievements</p>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 9: List with Hover Effects
// ============================================

export function Example9_InteractiveList() {
  const items = ['Study Mode', 'Communication', 'Wellness', 'Profile'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {items.map((item, index) => (
        <button
          key={index}
          className="w-full px-6 py-4 text-left border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-gray-800 dark:text-white">{item}</span>
            <span className="text-gray-400 dark:text-gray-500">›</span>
          </div>
        </button>
      ))}
    </div>
  );
}

// ============================================
// EXAMPLE 10: Complete Page Layout
// ============================================

export function Example10_CompleteLayout({ isDarkMode, onToggle }) {
  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-gray-800 dark:text-white text-xl">
                My App
              </h1>
              <ThemeSwitch 
                isDarkMode={isDarkMode}
                onToggle={onToggle}
                variant="toggle"
                showLabel={false}
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-gray-800 dark:text-white mb-4">Menu</h2>
                <nav className="space-y-2">
                  {['Dashboard', 'Settings', 'Profile'].map((item) => (
                    <a
                      key={item}
                      href="#"
                      className="block px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {item}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-gray-800 dark:text-white text-2xl mb-4">
                  Welcome Back!
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  This is a complete example showing how light and dark modes work together seamlessly.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-lg">
                    <p className="text-purple-800 dark:text-purple-200 text-sm">Feature 1</p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg">
                    <p className="text-blue-800 dark:text-blue-200 text-sm">Feature 2</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-12">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
              © 2025 Hello Buddy. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ============================================
// CSS CLASSES REFERENCE GUIDE
// ============================================

/*

BACKGROUND COLORS:
------------------
Light Mode           →  Dark Mode
bg-white             →  dark:bg-gray-900
bg-gray-50           →  dark:bg-gray-950
bg-gray-100          →  dark:bg-gray-800
bg-gray-200          →  dark:bg-gray-700

TEXT COLORS:
------------
Light Mode           →  Dark Mode
text-gray-900        →  dark:text-white
text-gray-800        →  dark:text-gray-100
text-gray-600        →  dark:text-gray-300
text-gray-500        →  dark:text-gray-400

BORDERS:
--------
Light Mode           →  Dark Mode
border-gray-200      →  dark:border-gray-700
border-gray-300      →  dark:border-gray-600

GRADIENTS:
----------
from-purple-100 to-pink-100  →  dark:from-purple-900 dark:to-pink-900
from-blue-100 to-sky-100     →  dark:from-blue-900 dark:to-sky-900
from-green-100 to-mint-100   →  dark:from-green-900 dark:to-emerald-900

HOVER STATES:
-------------
hover:bg-gray-100    →  dark:hover:bg-gray-700
hover:text-purple-600 →  dark:hover:text-purple-400

*/
