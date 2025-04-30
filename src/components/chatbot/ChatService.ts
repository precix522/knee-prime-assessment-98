
import { Message } from './types';
import { toast } from '@/hooks/use-toast';

export const sendChatMessage = async (message: string): Promise<{ reply: string }> => {
  console.log("Sending request to webhook with message:", message);
  
  const response = await fetch('https://operationspprecix.app.n8n.cloud/webhook-test/85599287-40a0-4fe7-be45-c145a522a950', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message })
  });
  
  console.log("Response status:", response.status);
  
  if (!response.ok) {
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log("Response data:", data);
  
  return data;
};

export const handleChatError = (error: unknown): string => {
  console.error('Chatbot error details:', error);
  const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
  
  toast({
    title: "Error",
    description: `Failed to communicate with the chatbot service: ${errorMessage}`,
    variant: "destructive",
  });
  
  return `Failed to get response. Please try again later. (${errorMessage})`;
};
