import { useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { startRingtone, stopRingtone } from '../lib/ringtone';

interface ReminderPopupProps {
  title: string;
  time: string;
  onDecline: () => void;
}

// Full-screen, undismissable-by-backdrop-click reminder popup. It starts a
// looping ringtone as soon as it mounts and only goes away when the person
// explicitly taps Decline - no auto-close timer.
export function ReminderPopup({ title, time, onDecline }: ReminderPopupProps) {
  useEffect(() => {
    startRingtone();
    return () => stopRingtone();
  }, []);

  const handleDecline = () => {
    stopRingtone();
    onDecline();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="alertdialog"
      aria-live="assertive"
    >
      <div className="w-full max-w-sm bg-white dark:bg-[#121212] rounded-3xl shadow-2xl p-8 text-center border border-gray-200 dark:border-[#2d2d2d] animate-[pulse_2s_ease-in-out_infinite]">
        <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center animate-bounce">
          <Bell className="text-white" size={36} />
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reminder • {time}</p>
        <h2 className="text-gray-800 dark:text-white mb-6 text-xl">{title}</h2>

        <button
          onClick={handleDecline}
          className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold"
        >
          <BellOff size={20} />
          Decline
        </button>
      </div>
    </div>
  );
}
