
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import { Message } from './types';

interface ChatWindowProps {
  isOpen: boolean;
  toggleChat: () => void;
  messages: Message[];
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSendMessage: () => void;
  isLoading: boolean;
  error: string | null;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  isOpen,
  toggleChat,
  messages,
  inputValue,
  setInputValue,
  handleSendMessage,
  isLoading,
  error
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-[100px] right-5 w-[350px] h-[500px] bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col overflow-hidden z-[1000]">
      {/* Header */}
      <div className="bg-[#F97316] text-white px-4 py-3 flex justify-between items-center">
        <h3 className="font-medium">AI Assistant</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-white hover:text-white hover:bg-orange-600"
          onClick={toggleChat}
        >
          <X size={16} />
        </Button>
      </div>
      
      <Separator />
      
      {/* Messages Area */}
      <ChatMessageList 
        messages={messages} 
        isLoading={isLoading} 
        error={error} 
      />
      
      <Separator />
      
      {/* Input Area */}
      <ChatInput 
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSendMessage={handleSendMessage}
        isLoading={isLoading}
        isOpen={isOpen}
        messages={messages}
      />
    </div>
  );
};
