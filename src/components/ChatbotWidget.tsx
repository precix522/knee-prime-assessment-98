
import React, { useState, useEffect } from 'react';
import { useToast, toast } from "@/hooks/use-toast";
import { ChatWindow } from './chatbot/ChatWindow';
import { ChatIcon } from './chatbot/ChatIcon';
import { sendChatMessage, handleChatError } from './chatbot/ChatService';
import { Message } from './chatbot/types';

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! How can I help you today?", isUser: false, timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    // Reset error when closing
    if (isOpen) {
      setError(null);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);
    
    try {
      // Send message to AI assistant service
      const data = await sendChatMessage(userMessage.text);
      
      // Add bot response
      const botMessage: Message = {
        text: data.reply || "I'm sorry, I didn't understand that.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Show success toast
      toast.success("Message sent", {
        description: "Your message was successfully processed."
      });
      
    } catch (err) {
      const errorMessage = handleChatError(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed z-[1000]">
      <ChatWindow
        isOpen={isOpen}
        toggleChat={toggleChat}
        messages={messages}
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSendMessage={handleSendMessage}
        isLoading={isLoading}
        error={error}
      />
      <ChatIcon toggleChat={toggleChat} />
    </div>
  );
};

export default ChatbotWidget;
