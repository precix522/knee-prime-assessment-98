
import React, { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSendMessage: () => void;
  isLoading: boolean;
  isOpen: boolean;
  messages: any[];
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  inputValue, 
  setInputValue, 
  handleSendMessage, 
  isLoading, 
  isOpen,
  messages
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current && messages.length === 1) {
      inputRef.current.focus();
    }
  }, [isOpen, messages.length]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="p-3 bg-gray-50 flex items-center space-x-2">
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        className="flex-grow"
        disabled={isLoading}
      />
      <Button
        onClick={handleSendMessage}
        disabled={!inputValue.trim() || isLoading}
        size="icon"
        className="bg-[#F97316] hover:bg-orange-600"
      >
        <Send size={16} />
      </Button>
    </div>
  );
};
