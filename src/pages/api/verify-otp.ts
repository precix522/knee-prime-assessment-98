
// API route for verifying OTP
import { verifyOTP as twilioVerifyOTP } from '../../api/twilio-service';
import { verifyOTP as vonageVerifyOTP } from '../../api/vonage-service';

// Default to using Vonage service
const OTP_SERVICE = 'vonage'; // Can be 'twilio' or 'vonage'

export async function handleVerifyOTP(request: Request): Promise<Response> {
  try {
    const { phone_number, code, request_id } = await request.json();
    
    let result;
    
    if (OTP_SERVICE === 'twilio') {
      // Call the Twilio service to verify OTP
      result = await twilioVerifyOTP(phone_number, code);
    } else {
      // Call the Vonage service to verify OTP
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

export default handleVerifyOTP;
