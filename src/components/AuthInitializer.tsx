
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
        const protectedRoutes = ['/report-viewer', '/patient-id', '/dashboard', '/manage-users', '/all-reports'];
        const publicRoutes = ['/', '/login', '/general-login', '/contactus', '/privacy-policy', '/manage-patients'];
        const currentPath = location.pathname;
        const isProtectedRoute = protectedRoutes.includes(currentPath);
        const isPublicRoute = publicRoutes.includes(currentPath);
        
        // If on a protected page and session is invalid, redirect to login
        if (!isValid && isProtectedRoute) {
          console.log('Not authenticated, redirecting from protected route to login');
          toast.error('Your session has expired. Please log in again.');
          navigate('/login');
          return;
        }
        
        // If successfully authenticated on login page, redirect based on user type
        if (isValid && user && (currentPath === '/login' || currentPath === '/general-login')) {
          console.log('Already authenticated on login page, redirecting based on role:', user.profile_type);
          if (user.profile_type === 'admin') {
            toast.success('Welcome back, admin!');
            navigate('/dashboard');
          } else if (user.profile_type === 'patient') {
            toast.success(`Welcome back, patient!`);
            // Redirect patients directly to report-viewer instead of dashboard
            navigate('/report-viewer');
          } else {
            toast.success('Welcome back!');
            navigate('/dashboard');
          }
        }
      } catch (err) {
        console.error("Session validation error:", err);
        // Don't show toast errors for validation failures
        // This prevents error messages during normal login flow
      }
    }
    
    checkSession();
  }, [validateSession, navigate, location.pathname, user]);

  return null;
}
