
import { useEffect } from "react";
import { useSessionManager } from "../hooks/auth/useSessionManager";

// This component initializes the auth state by checking for an existing session
export function AuthInitializer() {
  // Use our session manager hook to handle all auth logic
  const { isInitialized } = useSessionManager();
  
  useEffect(() => {
    console.log("AuthInitializer mounted, initialization state:", isInitialized);
  }, [isInitialized]);
  
  // No UI is rendered by this component
  return null;
}
