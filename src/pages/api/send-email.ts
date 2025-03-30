
import { handleSendEmail } from '@/api/api-endpoints';

// This is a simple API handler for sending emails
export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, message: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Allow': 'POST',
        },
      }
    );
  }
  
  try {
    // Use handleSendEmail from api-endpoints.ts
    const response = await handleSendEmail(req);
    
    // Ensure we're returning a proper JSON response
    return response;
  } catch (error: any) {
    console.error('Send email API error:', error);
    
    // Return a formatted error response
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || 'Failed to send email'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
