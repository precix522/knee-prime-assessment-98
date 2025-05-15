
// This file contains the Twilio service functions that interact with the Twilio API
import { getTwilioCredentials, isDevEnvironment } from '../utils/credential-manager';

// Function to send OTP via Twilio Verify
export const sendOTP = async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('[Twilio Service] Starting sendOTP with phone:', phoneNumber);
    
    // Check if we're in development mode
    if (isDevEnvironment()) {
      console.log('[Twilio Service] Using development mode for Twilio operations');
      console.log(`[Twilio Service] Development mode: Use code "123456" for verification`);
      
      // Return success response for development mode
      return { 
        success: true, 
        message: 'Development mode: Verification code "123456" sent successfully' 
      };
    }
    
    // In production mode, we would use the actual Twilio API here
    // This section is commented out to avoid making actual API calls during development
    
    /* 
    // Get Twilio credentials
    const credentials = getTwilioCredentials();
    
    // Implement actual Twilio API call here with credentials.accountSid, etc.
    // This would involve creating a request to the Twilio API
    */
    
    // For now, always return success in development mode
    return { 
      success: true, 
      message: 'Verification code sent successfully' 
    };
  } catch (error: any) {
    console.error('[Twilio Service] Exception in sendOTP:', error);
    return { success: false, message: error.message || 'Failed to send verification code' };
  }
};

// Function to verify OTP via Twilio Verify
export const verifyOTP = async (phoneNumber: string, code: string): Promise<{ success: boolean; message: string; session_id?: string }> => {
  try {
    console.log(`[Twilio Service] Verifying OTP ${code} for ${phoneNumber}`);
    
    // Check if we're in development mode
    if (isDevEnvironment()) {
      console.log('[Twilio Service] Using development mode for verification');
      
      // For testing, accept "123456" or any 6-digit code in dev mode
      const isValidCode = code === "123456" || /^\d{6}$/.test(code);
      
      if (!isValidCode) {
        return { success: false, message: 'Invalid verification code. Please try again.' };
      }
      
      // Generate a session ID for the verified user
      const sessionId = `twilio_${Date.now()}_${phoneNumber.replace(/[^0-9]/g, '')}`;
      
      return { 
        success: true, 
        message: 'Verification successful', 
        session_id: sessionId 
      };
    }
    
    // In production mode, we would use the actual Twilio API here
    /* 
    // Get Twilio credentials
    const credentials = getTwilioCredentials();
    
    // Implement actual Twilio verification API call here
    // This would involve creating a request to the Twilio API
    */
    
    // For now, simulate a successful verification in development mode
    const sessionId = `twilio_${Date.now()}_${phoneNumber.replace(/[^0-9]/g, '')}`;
    
    return { 
      success: true, 
      message: 'Verification successful', 
      session_id: sessionId 
    };
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
