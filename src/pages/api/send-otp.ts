
// API route for sending OTP
import { sendOTP as twilioSendOTP } from '../../api/twilio-service';
import { sendOTP as vonageSendOTP } from '../../api/vonage-service';

// Default to using Twilio service - can be switched via env variable
const OTP_SERVICE = (typeof import.meta.env !== 'undefined' && typeof import.meta.env.VITE_OTP_SERVICE === 'string') ? import.meta.env.VITE_OTP_SERVICE : 'twilio';

export default async function handleSendOTP(request: Request): Promise<Response> {
  try {
    console.log('Processing OTP send request');
    console.log('Using OTP service:', OTP_SERVICE);
    
    let body: any = {};
    let bodyText = '';
    
    try {
      // First get the raw text to help with debugging
      bodyText = await request.clone().text();
      console.log('Raw request body:', bodyText);
      
      // Then try to parse as JSON
      body = JSON.parse(bodyText);
      console.log('Parsed request body:', body);
    } catch (error) {
      console.error('Error parsing JSON body:', error, 'Raw body was:', bodyText);
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
    
    console.log('Calling Twilio service with phone:', phone_number);
    result = await twilioSendOTP(phone_number);
    
    console.log('OTP send result:', result);

    // For development mode, always include the OTP code in the response
    if (process.env.NODE_ENV !== 'production' || !import.meta.env.PROD) {
      result.testCode = '123456';
      result.message = `${result.message}. In development mode, use code "123456" for testing.`;
    }
    
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
