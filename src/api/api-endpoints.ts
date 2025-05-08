
// This file sets up the API routes for the Twilio service and email service

import { sendOTP, verifyOTP, validateSession } from './twilio-service';
import { sendEmail } from './email-service';

interface EmailData {
  to: string;
  from: string;
  subject: string;
  html: string;
}

// Define interfaces for our request bodies
interface SendOTPRequest {
  phone_number: string;
}

interface VerifyOTPRequest {
  phone_number: string;
  code: string;
}

interface ValidateSessionRequest {
  session_id: string;
}

// API route for sending OTP
export async function handleSendOTP(request: Request): Promise<Response> {
  try {
    const body = await request.json() as SendOTPRequest;
    const phone_number = body.phone_number;
    
    if (!phone_number) {
      return new Response(
        JSON.stringify({ success: false, message: 'Phone number is required' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Call the Twilio service to send OTP
    const result = await sendOTP(phone_number);
    
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    console.error('API Error - Send OTP:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'Server error' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

// API route for verifying OTP
export async function handleVerifyOTP(request: Request): Promise<Response> {
  try {
    const body = await request.json() as VerifyOTPRequest;
    const phone_number = body.phone_number;
    const code = body.code;
    
    if (!phone_number || !code) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: !phone_number ? 'Phone number is required' : 'Verification code is required' 
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Call the Twilio service to verify OTP
    const result = await verifyOTP(phone_number, code);
    
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    console.error('API Error - Verify OTP:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'Server error' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

// API route for validating session
export async function handleValidateSession(request: Request): Promise<Response> {
  try {
    const body = await request.json() as ValidateSessionRequest;
    const session_id = body.session_id;
    
    if (!session_id) {
      return new Response(
        JSON.stringify({ valid: false, phone_number: null, message: 'Session ID is required' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Call the Twilio service to validate session
    const result = await validateSession(session_id);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    console.error('API Error - Validate Session:', error);
    return new Response(
      JSON.stringify({ valid: false, phone_number: null }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

// API route for sending emails
export async function handleSendEmail(request: Request): Promise<Response> {
  try {
    const body = await request.json() as Record<string, any>;
    
    // Validate the email data
    if (!body.to || !body.from || !body.subject || !body.html) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required email fields' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    const emailData: EmailData = {
      to: body.to,
      from: body.from,
      subject: body.subject,
      html: body.html
    };
    
    console.log('Processing email request:', emailData);
    
    // Call the email service to send the email
    const result = await sendEmail(emailData);
    
    console.log('Email service result:', result);
    
    // Return a JSON response with the result
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    console.error('API Error - Send Email:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'Server error' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
