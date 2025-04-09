
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
      try {
        const isValid = await validateSession();
        console.log('Session validation result:', isValid, 'User:', user);
        
        // Get protected routes
        const protectedRoutes = ['/report-viewer', '/patient-id', '/dashboard'];
        const isProtectedRoute = protectedRoutes.includes(location.pathname);
        
        // If on a protected page and session is invalid, redirect to login
        if (!isValid && isProtectedRoute) {
          toast.error('Your session has expired. Please log in again.');
          navigate('/login');
          return;
        }
        
        // If successfully authenticated on login page, redirect based on user type
        if (isValid && user && location.pathname === '/login') {
          if (user.profile_type === 'admin') {
            navigate('/dashboard');
          } else {
            // For patients or other user types
            navigate('/dashboard');
          }
        }
      } catch (err) {
        console.error("Session validation error:", err);
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
