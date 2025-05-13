
// API route for sending OTP
import { handleSendOTP } from '../../api/api-endpoints';

export default async function handler(request: Request): Promise<Response> {
  try {
    // Use the handler function from api-endpoints.ts
    return await handleSendOTP(request);
  } catch (error: any) {
    console.error('Send OTP API error:', error);
    
    // Return a formatted error response
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || 'Failed to send OTP'
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
