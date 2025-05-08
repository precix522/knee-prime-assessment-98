
// API route for sending OTP
import { sendOTP as twilioSendOTP } from '../../api/twilio-service';
import { sendOTP as vonageSendOTP } from '../../api/vonage-service';

// Default to using Vonage service
const OTP_SERVICE: 'twilio' | 'vonage' = 'vonage';

export default async function handleSendOTP(request: Request): Promise<Response> {
  try {
    console.log('Processing OTP send request');
    const body = await request.json() as { phone_number?: string };
    const phone_number = body.phone_number as string;
    
    console.log('Received phone number:', phone_number);
    
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
    
    let result;
    
    if (OTP_SERVICE === 'twilio') {
      // Call the Twilio service to send OTP
      result = await twilioSendOTP(phone_number);
    } else {
      // Call the Vonage service to send OTP
      result = await vonageSendOTP(phone_number);
    }
    
    console.log('OTP send result:', result);
    
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
