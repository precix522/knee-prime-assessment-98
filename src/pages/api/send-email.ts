
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
  
  return handleSendEmail(req);
}
