
import React from 'react';
import { MessageCircle } from 'lucide-react';

interface ChatIconProps {
  toggleChat: () => void;
}

export const ChatIcon: React.FC<ChatIconProps> = ({ toggleChat }) => {
  return (
    <button
      onClick={toggleChat}
      className="fixed bottom-5 right-5 w-[80px] h-[80px] rounded-full bg-[#F97316] text-white shadow-lg flex items-center justify-center hover:bg-orange-600 transition-colors z-[1000]"
      aria-label="Open chat"
    >
      <MessageCircle size={40} />
    </button>
  );
};
