
// API route for verifying OTP
import { verifyOTP as twilioVerifyOTP } from '../../api/twilio-service';
import { verifyOTP as vonageVerifyOTP } from '../../api/vonage-service';

// Default to using Vonage service
const OTP_SERVICE: 'twilio' | 'vonage' = 'vonage';

export default async function handleVerifyOTP(request: Request): Promise<Response> {
  try {
    console.log('Processing OTP verification request');
    
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('Error parsing JSON body:', error);
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid JSON body' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    const request_id = body?.request_id as string;
    const code = body?.code as string;
    const phone_number = body?.phone_number as string;
    
    console.log('Verifying OTP with code:', code);
    
    if (!code) {
      return new Response(
        JSON.stringify({ success: false, message: 'Verification code is required' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    let result;
    
    if (OTP_SERVICE === 'twilio') {
      // For Twilio, we would need phone_number and code
      if (!phone_number) {
        return new Response(
          JSON.stringify({ success: false, message: 'Phone number is required for Twilio verification' }),
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      result = await twilioVerifyOTP(phone_number, code);
    } else {
      // For Vonage, we need request_id and code
      if (!request_id) {
        return new Response(
          JSON.stringify({ success: false, message: 'Request ID is required for Vonage verification' }),
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      result = await vonageVerifyOTP(request_id, code);
    }
    
    console.log('OTP verification result:', result);
    
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
