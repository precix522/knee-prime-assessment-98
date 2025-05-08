
// API Route Handler
import handleSendOTP from "./send-otp";
import handleVerifyOTP from "./verify-otp";
import handleValidateSession from "./validate-session";
import handleSendEmail from "./send-email";

/**
 * Main API request handler that routes requests to the appropriate handler
 */
export async function handleRequest(request: Request): Promise<Response> {
  try {
    console.log(`API Request: ${request.method} ${request.url}`);
    
    // Get the pathname from the URL
    const url = new URL(request.url);
    const path = url.pathname;
    
    console.log('API path:', path);
    
    // Route the request to the appropriate handler
    if (path.endsWith('/api/send-otp')) {
      console.log('Routing to send-otp handler');
      return await handleSendOTP(request);
    } else if (path.endsWith('/api/verify-otp')) {
      console.log('Routing to verify-otp handler');
      return await handleVerifyOTP(request);
    } else if (path.endsWith('/api/validate-session')) {
      console.log('Routing to validate-session handler');
      return await handleValidateSession(request);
    } else if (path.endsWith('/api/send-email')) {
      console.log('Routing to send-email handler');
      return await handleSendEmail(request);
    }
    
    // If no handler matches, return a 404
    console.log('No handler found for path:', path);
    return new Response(
      JSON.stringify({ success: false, message: 'Endpoint not found' }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('API Handler Error:', error);
    
    // Return a 500 error
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || 'Internal server error' 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
