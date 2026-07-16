import { useState } from 'react';
import { ArrowLeft, Send, Users, Smile } from 'lucide-react';

interface Message {
  id: number;
  user: string;
  message: string;
  time: string;
  isOwn?: boolean;
}

interface GroupChatRoomProps {
  roomName: string;
  members: number;
  description: string;
  onBack: () => void;
}

export function GroupChatRoom({ roomName, members, description, onBack }: GroupChatRoomProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, user: 'Sarah M.', message: 'Good morning everyone! Ready for today\'s study session?', time: '9:23 AM' },
    { id: 2, user: 'Alex K.', message: 'Yes! I\'m working on my chemistry notes. Anyone else?', time: '9:25 AM' },
    { id: 3, user: 'Jordan P.', message: 'I\'m here! Just starting my math homework.', time: '9:27 AM' },
    { id: 4, user: 'You', message: 'Hey everyone! Let\'s do this together 💪', time: '9:30 AM', isOwn: true },
    { id: 5, user: 'Emma L.', message: 'Great energy! I love this supportive community 🌟', time: '9:32 AM' },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      user: 'You',
      message: message,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      isOwn: true
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-[#121212] border-b border-gray-200 dark:border-[#2d2d2d] p-4 sticky top-0 z-10 transition-colors duration-300">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-700 dark:text-gray-200" />
            </button>
            <div className="flex-1">
              <h2 className="text-gray-900 dark:text-white font-semibold">{roomName}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Users size={14} />
                {members} members • {description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Welcome Message */}
          <div className="text-center mb-6">
            <div className="inline-block bg-purple-100 dark:bg-purple-900/50 px-4 py-2 rounded-full">
              <p className="text-sm text-purple-800 dark:text-purple-300 font-medium">
                Welcome to {roomName}! 🎉
              </p>
            </div>
          </div>

          {/* Chat Messages */}
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] ${msg.isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {!msg.isOwn && (
                  <span className="text-xs text-gray-600 dark:text-gray-400 px-2 font-medium">
                    {msg.user}
                  </span>
                )}
                <div 
                  className={`px-4 py-3 rounded-2xl shadow-sm ${ 
                    msg.isOwn 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                      : 'bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-[#2d2d2d]'
                  }`}
                >
                  <p className="text-sm break-words">{msg.message}</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-500 px-2">
                  {msg.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#121212] border-t border-gray-200 dark:border-[#2d2d2d] p-4 transition-colors duration-300">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <button
              type="button"
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <Smile size={24} className="text-gray-600 dark:text-gray-400" />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 rounded-full border-2 border-gray-300 dark:border-[#2d2d2d] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              <Send size={20} />
            </button>
          </form>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 text-center">
            💜 Remember to be kind and supportive
          </p>
        </div>
      </div>
    </div>
  );
}