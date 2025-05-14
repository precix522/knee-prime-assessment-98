
import { useEffect } from "react";
import { useTwilioAuthStore } from "../utils/auth";
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
        const protectedRoutes = ['/report-viewer', '/patient-id', '/dashboard', '/manage-users', '/all-reports', '/manage-patients'];
        const publicRoutes = ['/', '/login', '/general-login', '/contactus', '/privacy-policy'];
        const currentPath = location.pathname;
        const isProtectedRoute = protectedRoutes.includes(currentPath);
        const isPublicRoute = publicRoutes.includes(currentPath);
        
        // If on a protected page and session is invalid, redirect to login
        if (!isValid && isProtectedRoute) {
          console.log('Not authenticated, redirecting from protected route to login');
          toast.error('Your session has expired. Please log in again.');
          navigate('/general-login');
          return;
        }
        
        // If successfully authenticated on login page, redirect based on user type
        if (isValid && user && (currentPath === '/login' || currentPath === '/general-login')) {
          console.log('Already authenticated on login page, redirecting based on role:', user.profile_type);
          if (user.profile_type === 'admin') {
            toast.success('Welcome back, admin!');
            navigate('/manage-patients');
          } else if (user.profile_type === 'patient') {
            toast.success(`Welcome back, patient!`);
            navigate('/report-viewer');
          } else {
            toast.success('Welcome back!');
            navigate('/dashboard');
          }
        }
        
        // For authenticated users on the home page, redirect based on role
        if (isValid && user && currentPath === '/') {
          console.log('Authenticated user on home page, redirecting based on role:', user.profile_type);
          if (user.profile_type === 'admin') {
            navigate('/manage-patients');
          } else if (user.profile_type === 'patient') {
            navigate('/report-viewer');
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
