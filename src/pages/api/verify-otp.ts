
// API route for verifying OTP
import { verifyOTP as twilioVerifyOTP } from '../../api/twilio-service';
import { verifyOTP as vonageVerifyOTP } from '../../api/vonage-service';

// Default to using Vonage service
const OTP_SERVICE: 'twilio' | 'vonage' = 'vonage';

export default async function handleVerifyOTP(request: Request): Promise<Response> {
  try {
    const { request_id, code } = await request.json();
    
    let result;
    
    if (OTP_SERVICE === 'twilio') {
      // For Twilio, we would need phone_number and code
      const { phone_number } = await request.json();
      result = await twilioVerifyOTP(phone_number, code);
    } else {
      // For Vonage, we need request_id and code
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
