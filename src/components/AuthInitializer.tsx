
import { useEffect } from "react";
import { useAuthStore } from "../utils/auth-store";

// This component initializes the auth state by checking for an existing session
export function AuthInitializer() {
  const { validateSession } = useAuthStore();

  useEffect(() => {
    // Check for an existing session on component mount
    validateSession();
    
    // No need for subscription - we'll validate the session on page load
  }, [validateSession]);

  // This component doesn't render anything
  return null;
}
