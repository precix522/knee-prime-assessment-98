
// This file contains the Twilio service functions that interact with the Twilio API

// Import environment variables for Twilio credentials with provided values
const TWILIO_ACCOUNT_SID = "SK8a0d7b71748df9b63d004f41d95f9c59";
const TWILIO_AUTH_TOKEN = "FeZBq5peEhJMGjFr4BVSZXqIiPf9hyo7";
const TWILIO_SERVICE_SID = "MGd76cb94c80915ebd2134400668e79f5c";

// Function to send OTP via Twilio Verify
export const sendOTP = async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('[Twilio Service] Starting sendOTP with phone:', phoneNumber);
    console.log('[Twilio Service] Using account SID:', TWILIO_ACCOUNT_SID);
    console.log('[Twilio Service] Using service SID:', TWILIO_SERVICE_SID);
    
    // Check if we're in development mode (using dev values)
    const isDevelopmentMode = true; // Force development mode for testing
    
    if (isDevelopmentMode) {
      // For development purposes, simulate a successful OTP send
      console.log(`[Twilio Service] Development mode: Simulating sending OTP to ${phoneNumber}`);
      
      // Always log the test code for development
      console.log(`[Twilio Service] Development mode: Use code "123456" for verification`);
      
      // Simulate API call success
      return { 
        success: true, 
        message: 'Development mode: Verification code "123456" sent successfully' 
      };
    } else {
      // Using real Twilio implementation with the provided credentials
      console.log(`[Twilio Service] Production mode: Sending OTP to ${phoneNumber} using Twilio API`);
      const url = `https://verify.twilio.com/v2/Services/${TWILIO_SERVICE_SID}/Verifications`;
      
      console.log('[Twilio Service] Making API request to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
        },
        body: new URLSearchParams({
          'To': phoneNumber,
          'Channel': 'sms'
        })
      });
      
      console.log('[Twilio Service] API response status:', response.status);
      
      const responseText = await response.text();
      console.log('[Twilio Service] API response body:', responseText);
      
      if (!response.ok) {
        let errorData: { message?: string } = {};
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData = { message: 'Invalid response from Twilio API' };
        }
        
        console.error('[Twilio Service] Error sending OTP:', errorData);
        return { success: false, message: errorData.message || 'Failed to send verification code' };
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('[Twilio Service] OTP sent successfully:', data);
      } catch (e) {
        console.error('[Twilio Service] Error parsing response:', e);
        return { success: false, message: 'Invalid response from Twilio API' };
      }
      
      return { success: true, message: 'Verification code sent successfully' };
    }
  } catch (error: any) {
    console.error('[Twilio Service] Exception in sendOTP:', error);
    return { success: false, message: error.message || 'Failed to send verification code' };
  }
};

// Function to verify OTP via Twilio Verify
export const verifyOTP = async (phoneNumber: string, code: string): Promise<{ success: boolean; message: string; session_id?: string }> => {
  try {
    // Check if we're in development mode
    const isDevelopmentMode = true; // Force development mode for testing
    
    if (isDevelopmentMode) {
      // For development purposes, accept any 6-digit code
      console.log(`[Twilio Service] Simulating verification of OTP ${code} for ${phoneNumber}`);
      
      // For testing, accept any 6-digit code or "123456"
      const isValidCode = code === "123456" || /^\d{6}$/.test(code);
      
      if (!isValidCode) {
        return { success: false, message: 'Invalid verification code. Please try again.' };
      }
      
      // Generate a session ID for the verified user
      const sessionId = `twilio_${Date.now()}_${phoneNumber.replace(/[^0-9]/g, '')}`;
      
      return { 
        success: true, 
        message: 'Development mode: Verification successful', 
        session_id: sessionId 
      };
    } else {
      // Using real Twilio implementation with the provided credentials
      console.log(`[Twilio Service] Verifying OTP ${code} for ${phoneNumber} using Twilio API`);
      const url = `https://verify.twilio.com/v2/Services/${TWILIO_SERVICE_SID}/VerificationCheck`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
        },
        body: new URLSearchParams({
          'To': phoneNumber,
          'Code': code
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData: { message?: string } = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: 'Failed to parse error response' };
        }
        
        console.error('[Twilio Service] Error verifying OTP:', errorData);
        return { success: false, message: errorData.message || 'Failed to verify code' };
      }
      
      const data = await response.json();
      console.log('[Twilio Service] OTP verified successfully:', data);
      
      // Generate a session ID for the verified user
      const sessionId = `twilio_${Date.now()}_${phoneNumber.replace(/[^0-9]/g, '')}`;
      
      return { 
        success: true, 
        message: 'Verification successful', 
        session_id: sessionId 
      };
    }
  } catch (error: any) {
    console.error('[Twilio Service] Error verifying OTP:', error);
    return { success: false, message: error.message || 'Failed to verify code' };
  }
};

// Function to validate a session (this would typically check against a database in a real app)
export const validateSession = async (sessionId: string): Promise<{ valid: boolean; phone_number: string | null }> => {
  try {
    // In a real implementation, you would check if the session is valid in your database
    console.log(`[Twilio Service] Validating session ${sessionId}`);
    
    // This is a placeholder implementation
    // A real implementation would verify the session against a database
    const isValid = sessionId.startsWith('twilio_');
    
    // Extract phone number from session ID (in a real app, you'd look this up in your database)
    let phoneNumber = null;
    if (isValid) {
      const parts = sessionId.split('_');
      if (parts.length >= 3) {
        // This is a very simplified example - in a real app you'd look up the phone in your database
        const numericPart = parts[2];
        phoneNumber = `+${numericPart}`;
      }
    }
    
    return { valid: isValid, phone_number: phoneNumber };
  } catch (error: any) {
    console.error('[Twilio Service] Error validating session:', error);
    return { valid: false, phone_number: null };
  }
};
