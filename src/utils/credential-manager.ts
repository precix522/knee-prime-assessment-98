
/**
 * Secure credential manager for API services
 * Prioritizes environment variables and provides fallbacks for development
 */

// Types for credentials
export interface TwilioCredentials {
  accountSid: string;
  authToken: string;
  serviceSid: string;
}

/**
 * Get Twilio credentials from environment variables with development fallbacks
 * In production, these should be set as environment variables
 */
export const getTwilioCredentials = (): TwilioCredentials => {
  // Check for environment variables first
  const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
  const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
  const serviceSid = import.meta.env.VITE_TWILIO_SERVICE_SID;

  // If any credential is missing, log a warning and use development mode
  if (!accountSid || !authToken || !serviceSid) {
    console.warn(
      'Twilio credentials not fully configured in environment variables. ' +
      'Using development mode with test credentials. ' +
      'In production, please set VITE_TWILIO_ACCOUNT_SID, VITE_TWILIO_AUTH_TOKEN, and VITE_TWILIO_SERVICE_SID.'
    );
    
    // Return development mode credentials
    return {
      accountSid: "development_mode",
      authToken: "development_mode",
      serviceSid: "development_mode"
    };
  }

  // Return the configured credentials
  return {
    accountSid,
    authToken,
    serviceSid
  };
};

/**
 * Check if the application is running in development mode
 * This is useful for determining whether to bypass actual API calls
 */
export const isDevEnvironment = (): boolean => {
  return import.meta.env.MODE === 'development' || 
         !import.meta.env.VITE_TWILIO_ACCOUNT_SID ||
         !import.meta.env.VITE_TWILIO_AUTH_TOKEN ||
         !import.meta.env.VITE_TWILIO_SERVICE_SID;
};
