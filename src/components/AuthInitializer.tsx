
import { useSessionManager } from "../hooks/auth/useSessionManager";

// This component initializes the auth state by checking for an existing session
export function AuthInitializer() {
  // Use our session manager hook to handle all auth logic
  useSessionManager();
  
  // No UI is rendered by this component
  return null;
}
