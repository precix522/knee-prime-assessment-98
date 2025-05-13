
// API route for verifying OTP
import { verifyOTP as twilioVerifyOTP } from '../../api/twilio-service';
import { verifyOTP as vonageVerifyOTP } from '../../api/vonage-service';

// Always use Twilio for verification
export default async function handleVerifyOTP(request: Request): Promise<Response> {
  try {
    console.log('Processing OTP verification request');
    
    let body: any = {};
    let bodyText = '';
    
    try {
      // First get the raw text to help with debugging
      bodyText = await request.clone().text();
      console.log('Raw verification request body:', bodyText);
      
      // Then try to parse as JSON
      body = JSON.parse(bodyText);
      console.log('Parsed verification request body:', body);
    } catch (error) {
      console.error('Error parsing verification JSON body:', error, 'Raw body was:', bodyText);
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid JSON body' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const { phone_number, code, request_id } = body;
    
    console.log('Verifying code:', code, 'for phone:', phone_number);
    
    // Validate required fields
    if (!code) {
      return new Response(
        JSON.stringify({ success: false, message: 'Verification code is required' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (!phone_number) {
      return new Response(
        JSON.stringify({ success: false, message: 'Phone number is required' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Always use Twilio
    console.log('Using Twilio service for verification');
    const result = await twilioVerifyOTP(phone_number, code);
    
    console.log('Verification result:', result);
    
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('API Error - Verify OTP:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'Server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
