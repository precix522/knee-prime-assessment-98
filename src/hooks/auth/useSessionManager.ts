
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTwilioAuthStore } from "@/utils/auth";
import { 
  isProtectedRoute, 
  isAuthRoute, 
  handleUnauthenticatedAccess,
  handleAuthenticatedRedirection
} from "@/utils/auth/route-protection";

export const useSessionManager = () => {
  const { validateSession, user } = useTwilioAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Check for an existing session on component mount
    async function checkSession() {
      try {
        // Prevent initialization from running multiple times
        if (isInitialized) return;

        console.log('Checking session in SessionManager...');
        
        // Add a small delay to prevent immediate checks that might cause loops
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const isValid = await validateSession();
        console.log('Session validation result:', isValid, 'User:', user);
        
        // Make sure profile_type is correctly logged for debugging
        const profileType = user?.profile_type || localStorage.getItem('userProfileType');
        console.log('Profile type from user or localStorage:', profileType);
        
        setIsInitialized(true);
        
        const currentPath = location.pathname;
        const isOnProtectedRoute = isProtectedRoute(currentPath);
        const isOnAuthRoute = isAuthRoute(currentPath);
        
        // If on a protected page and session is invalid, redirect to login
        if (!isValid && isOnProtectedRoute) {
          handleUnauthenticatedAccess(currentPath, navigate);
          return;
        }
        
        // If successfully authenticated on login page, redirect based on user type
        if (isValid && user && isOnAuthRoute) {
          handleAuthenticatedRedirection(user, navigate, currentPath, true);
        }
        
        // For authenticated users on the home page, redirect based on role
        if (isValid && user && currentPath === '/') {
          handleAuthenticatedRedirection(user, navigate, currentPath);
        }
        
      } catch (err) {
        console.error("Session validation error:", err);
        setIsInitialized(true);
      }
    }
    
    checkSession();
  }, [validateSession, navigate, location.pathname, user, isInitialized]);
  
  return { isInitialized };
};
