
import { useEffect } from "react";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";

// This component initializes the auth state by checking for an existing session
export function AuthInitializer() {
  const { validateSession } = useTwilioAuthStore();

  useEffect(() => {
    // Check for an existing session on component mount
    validateSession();
    
    // No need for subscription with Twilio auth - we'll check the session on page load
  }, [validateSession]);

  // This component doesn't render anything
  return null;
}
