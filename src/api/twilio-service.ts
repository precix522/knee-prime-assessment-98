
// This file contains the Twilio service functions that interact with the Twilio API

// Import environment variables for Twilio credentials
const TWILIO_ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID || "AC908525387e45de896bd0c72bc3e4973a";
const TWILIO_AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN || "3a24b4d341aa36fe287ca5cf6dceb76b";
const TWILIO_SERVICE_SID = import.meta.env.VITE_TWILIO_SERVICE_SID || "VA00000000000000000000000000000000";

// Function to send OTP via Twilio Verify
export const sendOTP = async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Check if we're in development mode (no environment variables set)
    const isDevelopmentMode = !import.meta.env.VITE_TWILIO_SERVICE_SID || 
                              import.meta.env.VITE_TWILIO_SERVICE_SID === "VA00000000000000000000000000000000";
    
    if (isDevelopmentMode) {
      // For development purposes, simulate a successful OTP send
      console.log(`[Twilio Service] Simulating sending OTP to ${phoneNumber}`);
      
      // Simulate API call success
      return { 
        success: true, 
        message: 'Development mode: Verification code "123456" sent successfully' 
      };
    } else {
      // Using real Twilio implementation with the provided credentials
      console.log(`[Twilio Service] Sending OTP to ${phoneNumber} using Twilio API`);
      const url = `https://verify.twilio.com/v2/Services/${TWILIO_SERVICE_SID}/Verifications`;
      
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
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Twilio Service] Error sending OTP:', errorData);
        return { success: false, message: errorData.message || 'Failed to send verification code' };
      }
      
      const data = await response.json();
      console.log('[Twilio Service] OTP sent successfully:', data);
      
      return { success: true, message: 'Verification code sent successfully' };
    }
  } catch (error: any) {
    console.error('[Twilio Service] Error sending OTP:', error);
    return { success: false, message: error.message || 'Failed to send verification code' };
  }
};

// Function to verify OTP via Twilio Verify
export const verifyOTP = async (phoneNumber: string, code: string): Promise<{ success: boolean; message: string; session_id?: string }> => {
  try {
    // Check if we're in development mode (no environment variables set)
    const isDevelopmentMode = !import.meta.env.VITE_TWILIO_SERVICE_SID || 
                              import.meta.env.VITE_TWILIO_SERVICE_SID === "VA00000000000000000000000000000000";
    
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
        const errorData = await response.json();
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
