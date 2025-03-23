
// This file sets up the API routes for the Twilio service and email service

import { sendOTP, verifyOTP, validateSession } from './twilio-service';
import { sendEmail } from './email-service';

// API route for sending OTP
export async function handleSendOTP(request: Request): Promise<Response> {
  try {
    const { phone_number } = await request.json();
    
    // Call the Twilio service to send OTP
    const result = await sendOTP(phone_number);
    
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('API Error - Send OTP:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'Server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// API route for verifying OTP
export async function handleVerifyOTP(request: Request): Promise<Response> {
  try {
    const { phone_number, code } = await request.json();
    
    // Call the Twilio service to verify OTP
    const result = await verifyOTP(phone_number, code);
    
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('API Error - Verify OTP:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'Server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// API route for validating session
export async function handleValidateSession(request: Request): Promise<Response> {
  try {
    const { session_id } = await request.json();
    
    // Call the Twilio service to validate session
    const result = await validateSession(session_id);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('API Error - Validate Session:', error);
    return new Response(
      JSON.stringify({ valid: false, phone_number: null }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// API route for sending emails
export async function handleSendEmail(request: Request): Promise<Response> {
  try {
    const emailData = await request.json();
    
    // Validate the email data
    if (!emailData.to || !emailData.from || !emailData.subject || !emailData.html) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Missing required email fields' 
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    // Call the email service to send the email
    const result = await sendEmail(emailData);
    
    return new Response(
      JSON.stringify(result),
      {
        status: result.success ? 200 : 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('API Error - Send Email:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'Server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// You would need to add additional code to register these handlers with a proper API router
// For a simple implementation, you could use a service worker or a lightweight server
