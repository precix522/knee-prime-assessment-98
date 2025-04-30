import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! How can I help you today?", isUser: false, timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    if (isOpen) {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      if (inputRef.current && messages.length === 1) {
        inputRef.current.focus();
      }
    }
  }, [messages, isOpen]);

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
      // Using the provided n8n webhook test URL
      const response = await fetch('https://operationspprecix.app.n8n.cloud/webhook-test/e92786b9-53db-43ef-9a5e-9ac7f50bceec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Uncomment and update if you need authorization
          // 'Authorization': 'Bearer YOUR_API_KEY_HERE'
        },
        body: JSON.stringify({ message: userMessage.text })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add bot response
      const botMessage: Message = {
        text: data.reply || "I'm sorry, I didn't understand that.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setError(`Failed to get response. Please try again later.`);
      console.error('Chatbot error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed z-[1000]">
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-[100px] right-5 w-[320px] h-[450px] bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col overflow-hidden z-[1000]">
          {/* Header */}
          <div className="bg-[#F97316] text-white px-4 py-3 flex justify-between items-center">
            <h3 className="font-medium">Chatbot</h3>
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
          <ScrollArea className="flex-grow p-4">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.isUser 
                        ? 'bg-[#F97316] text-white rounded-br-none' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-bl-none max-w-[80%]">
                    <p className="text-sm flex items-center">
                      <span className="mr-2">Typing</span>
                      <span className="flex space-x-1">
                        <span className="animate-pulse">.</span>
                        <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
                        <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
                      </span>
                    </p>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="flex justify-center">
                  <div className="bg-red-100 text-red-800 p-3 rounded-lg max-w-[90%]">
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}
              
              <div ref={messageEndRef} />
            </div>
          </ScrollArea>
          
          <Separator />
          
          {/* Input Area */}
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
        </div>
      )}
      
      {/* Chat Icon */}
      <button
        onClick={toggleChat}
        className="fixed bottom-5 right-5 w-[70px] h-[70px] rounded-full bg-[#F97316] text-white shadow-lg flex items-center justify-center hover:bg-orange-600 transition-colors z-[1000]"
        aria-label="Open chat"
      >
        <MessageCircle size={32} />
      </button>
    </div>
  );
};

export default ChatbotWidget;
