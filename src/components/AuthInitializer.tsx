
import { useEffect, useState } from "react";
import { useTwilioAuthStore } from "../utils/auth";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";

// This component initializes the auth state by checking for an existing session
export function AuthInitializer() {
  const { validateSession, error, isLoading, user } = useTwilioAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check for an existing session on component mount
    async function checkSession() {
      try {
        // Prevent initialization from running multiple times
        if (isInitialized) return;

        console.log('Checking session in AuthInitializer...');
        
        // Add a small delay to prevent immediate checks that might cause loops
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const isValid = await validateSession();
        console.log('Session validation result:', isValid, 'User:', user);
        
        // Make sure profile_type is correctly logged for debugging
        const profileType = user?.profile_type || localStorage.getItem('userProfileType');
        console.log('Profile type from user or localStorage:', profileType);
        
        setIsInitialized(true);
        
        // Get protected routes
        const protectedRoutes = ['/report-viewer', '/patient-id', '/dashboard', '/manage-users', '/all-reports', '/manage-patients'];
        const authRoutes = ['/login', '/general-login'];
        const currentPath = location.pathname;
        const isProtectedRoute = protectedRoutes.includes(currentPath);
        const isAuthRoute = authRoutes.includes(currentPath);
        
        // If on a protected page and session is invalid, redirect to login
        if (!isValid && isProtectedRoute) {
          console.log('Not authenticated, redirecting from protected route to login');
          toast.error('Your session has expired. Please log in again.');
          
          // Store intended destination to redirect back after login
          sessionStorage.setItem('redirectAfterLogin', currentPath);
          
          // Clear any redirect loop detection
          sessionStorage.removeItem('loginRedirectCount');
          sessionStorage.removeItem('lastRedirect');
          
          // Use replace to avoid adding to history stack
          navigate('/general-login', { replace: true });
          return;
        }
        
        // If successfully authenticated on login page, redirect based on user type
        if (isValid && user && isAuthRoute) {
          // Get the profile type with fallback to localStorage (for persistence)
          const profileType = user.profile_type || 
                             localStorage.getItem('userProfileType') || 
                             'patient';
          
          console.log('Authenticated on auth page, redirecting based on role:', profileType);
          
          // Use the stored redirect destination if available
          const redirectTo = sessionStorage.getItem('redirectAfterLogin');
          
          // Clear redirect after using it
          sessionStorage.removeItem('redirectAfterLogin');
          
          // Clear any redirect loop detection
          sessionStorage.removeItem('loginRedirectCount');
          sessionStorage.removeItem('lastRedirect');
          
          if (profileType === 'admin') {
            toast.success('Welcome back, admin!');
            navigate('/manage-patients', { replace: true });
          } else if (profileType === 'patient') {
            toast.success(`Welcome back, patient!`);
            navigate('/report-viewer', { replace: true });
          } else {
            toast.success('Welcome back!');
            navigate(redirectTo || '/dashboard', { replace: true });
          }
        }
        
        // For authenticated users on the home page, redirect based on role
        if (isValid && user && currentPath === '/') {
          // Get the profile type with fallback to localStorage
          const profileType = user.profile_type || 
                             localStorage.getItem('userProfileType') || 
                             'patient';
          
          console.log('Authenticated user on home page, redirecting based on role:', profileType);
          
          // Clear any potential redirect loop detection
          sessionStorage.removeItem('loginRedirectCount');
          sessionStorage.removeItem('lastRedirect');
          
          if (profileType === 'admin') {
            navigate('/manage-patients', { replace: true });
          } else if (profileType === 'patient') {
            navigate('/report-viewer', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }
      } catch (err) {
        console.error("Session validation error:", err);
        setIsInitialized(true);
      }
    }
    
    checkSession();
  }, [validateSession, navigate, location.pathname, user, isInitialized]);

  return null;
}
