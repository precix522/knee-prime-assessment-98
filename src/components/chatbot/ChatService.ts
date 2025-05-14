
import { Message } from './types';
import { toast } from '@/hooks/use-toast';

export const sendChatMessage = async (message: string): Promise<{ reply: string }> => {
  console.log("Sending request to webhook with message:", message);
  
  try {
    const response = await fetch('https://operationspprecix.app.n8n.cloud/webhook/85599287-40a0-4fe7-be45-c145a522a950', {
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
    
    // Get the raw text first, so we can handle both JSON and non-JSON responses
    const rawText = await response.text();
    console.log("Raw response text:", rawText);
    
    // Try to parse as JSON first
    try {
      const jsonData = JSON.parse(rawText);
      console.log("Parsed JSON data:", jsonData);
      return jsonData;
    } catch (error) {
      console.log("Response is not valid JSON, using as plain text");
      // If it's not valid JSON, return the raw text as the reply
      return { reply: rawText };
    }
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error; // Let the handler function deal with the error
  }
};

export const handleChatError = (error: unknown): string => {
  console.error('AI Assistant error details:', error);
  const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
  
  toast.error(`Failed to communicate with the AI assistant service: ${errorMessage}`);
  
  return `Failed to get response. Please try again later. (${errorMessage})`;
};
