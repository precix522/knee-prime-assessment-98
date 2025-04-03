
import { useEffect } from "react";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import { toast } from "sonner";

// This component initializes the auth state by checking for an existing session
export function AuthInitializer() {
  const { validateSession, error } = useTwilioAuthStore();

  useEffect(() => {
    // Check for an existing session on component mount
    validateSession();
    
    // No need for subscription - we'll validate the session on page load
  }, [validateSession]);

  // Display toast for expired session if error is returned
  useEffect(() => {
    if (error && error.includes('expired')) {
      toast.info('Your session has expired. Please log in again.');
    }
  }, [error]);

  // This component doesn't render anything
  return null;
}
