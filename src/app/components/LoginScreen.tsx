import { useState } from 'react';

interface LoginScreenProps {
  onLogin: (name: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  
  // Create account form states
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onLogin(email);
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEmail.trim() && newPassword === confirmPassword && fullName.trim()) {
      // Simulate account creation
      onLogin(newEmail);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:bg-black">
      <div className="w-full max-w-md">
        {/* Friendly Character */}
        <div className="text-center mb-8 animate-bounce">
          <div className="text-8xl mb-4">👋</div>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-2xl p-8 backdrop-blur-sm border border-gray-200 dark:border-[#2d2d2d] transition-colors duration-300">
          <h1 className="text-center mb-2 text-purple-600 dark:text-purple-400">Hello Buddy</h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">A space where students are heard</p>

          {!showCreateAccount ? (
            // Login Form
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-gray-700 dark:text-gray-200 mb-2 font-medium">
                    Email ID
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-[#2d2d2d] dark:bg-[#1a1a1a] dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors"
                    placeholder="Enter your email ID"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-gray-700 dark:text-gray-200 mb-2 font-medium">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-[#2d2d2d] dark:bg-[#1a1a1a] dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-medium"
                >
                  Login
                </button>
              </form>

              <div className="mt-6 text-center">
                <button 
                  onClick={() => setShowCreateAccount(true)}
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 text-sm transition-colors"
                >
                  Create New Account
                </button>
              </div>
            </>
          ) : (
            // Create Account Form
            <>
              <h2 className="text-center mb-6 text-purple-600 dark:text-purple-400">Create Account</h2>
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-gray-700 dark:text-gray-200 mb-2 font-medium">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-[#2d2d2d] dark:bg-[#1a1a1a] dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="newEmail" className="block text-gray-700 dark:text-gray-200 mb-2 font-medium">
                    Email ID
                  </label>
                  <input
                    id="newEmail"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-[#2d2d2d] dark:bg-[#1a1a1a] dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors"
                    placeholder="Enter your email ID"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-gray-700 dark:text-gray-200 mb-2 font-medium">
                    Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-[#2d2d2d] dark:bg-[#1a1a1a] dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors"
                    placeholder="Create a password"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-gray-700 dark:text-gray-200 mb-2 font-medium">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-[#2d2d2d] dark:bg-[#1a1a1a] dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors"
                    placeholder="Confirm your password"
                    required
                    minLength={6}
                  />
                </div>

                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-red-500 dark:text-red-400 text-sm font-medium">Passwords do not match</p>
                )}

                <button
                  type="submit"
                  disabled={newPassword !== confirmPassword}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Create Account
                </button>
              </form>

              <div className="mt-6 text-center">
                <button 
                  onClick={() => setShowCreateAccount(false)}
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 text-sm transition-colors"
                >
                  Already have an account? Login
                </button>
              </div>
            </>
          )}
        </div>

        {/* Safe Space Message */}
        <p className="text-center mt-6 text-gray-700 dark:text-gray-300 text-sm px-4">
          🌟 A safe space for your growth journey
        </p>
      </div>
    </div>
  );
}