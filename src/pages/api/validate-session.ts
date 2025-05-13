
// API route for validating session
import { handleValidateSession } from '../../api/api-endpoints';

export default async function handler(request: Request): Promise<Response> {
  try {
    return await handleValidateSession(request);
  } catch (error: any) {
    console.error('Validate session API error:', error);
    
    return new Response(
      JSON.stringify({ 
        valid: false, 
        phone_number: null,
        message: error.message || 'Failed to validate session'
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
