
import { useEffect } from "react";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";

// This component initializes the auth state by checking for an existing session
export function AuthInitializer() {
  const { validateSession, error, isLoading, user } = useTwilioAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for an existing session on component mount
    async function checkSession() {
      const isValid = await validateSession();
      console.log('Session validation result:', isValid, 'User:', user);
      
      // If on report-viewer or patient-id page and session is invalid, redirect to login
      if (!isValid && (location.pathname === '/report-viewer' || location.pathname === '/patient-id')) {
        toast.error('Your session has expired. Please log in again.');
        navigate('/login');
      }
    }
    
    checkSession();
  }, [validateSession, navigate, location.pathname, user]);

  // Display toast for expired session if error is returned
  useEffect(() => {
    if (error && error.includes('expired')) {
      toast.info('Your session has expired. Please log in again.');
    }
  }, [error]);

  // This component doesn't render anything
  return null;
}
