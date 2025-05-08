
// API routes index file
import handleSendOTP from './send-otp';
import handleVerifyOTP from './verify-otp';

// This file serves as the entry point for API routes in a Vite application

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  
  // Extract the path from the URL
  const path = url.pathname;
  
  // Route the request based on the path
  if (path === '/api/send-otp') {
    return handleSendOTP(request);
  } else if (path === '/api/verify-otp') {
    return handleVerifyOTP(request);
  } else {
    // Handle 404 for unknown API routes
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: `API route not found: ${path}` 
      }),
      { 
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
