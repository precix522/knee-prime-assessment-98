
import { toast } from "sonner";

// Define protected routes configuration
export const protectedRoutes = ['/report-viewer', '/patient-id', '/dashboard', '/manage-users', '/reports', '/all-reports', '/manage-patients', '/patient/'];
export const authRoutes = ['/login', '/general-login'];

// Check if a route is protected
export const isProtectedRoute = (path: string): boolean => {
  // Check if the path exactly matches or starts with any protected route
  return protectedRoutes.some(route => 
    path === route || 
    (route.endsWith('/') && path.startsWith(route))
  );
};

// Check if a route is an auth route
export const isAuthRoute = (path: string): boolean => {
  return authRoutes.includes(path);
};

// Handle redirection for unauthenticated users trying to access protected routes
export const handleUnauthenticatedAccess = (currentPath: string, navigate: Function): void => {
  console.log('Not authenticated, redirecting from protected route to login');
  toast.error('Your session has expired. Please log in again.');
  
  // Store intended destination to redirect back after login
  sessionStorage.setItem('redirectAfterLogin', currentPath);
  
  // Clear any redirect loop detection
  clearRedirectLoopDetection();
  
  // Use replace to avoid adding to history stack
  navigate('/general-login', { replace: true });
};

// Handle redirection for authenticated users based on their role
export const handleAuthenticatedRedirection = (
  user: any, 
  navigate: Function, 
  currentPath: string, 
  isAuthRoute: boolean = false
): void => {
  // Get the profile type with fallback to localStorage (for persistence)
  const profileType = user?.profile_type || 
                      localStorage.getItem('userProfileType') || 
                      'patient';
  
  console.log(`Authenticated user${isAuthRoute ? ' on auth page' : ''}, redirecting based on role:`, profileType);
  
  // Clear any redirect loop detection
  clearRedirectLoopDetection();
  
  // If on auth route, check for stored redirect destination
  let redirectTo = isAuthRoute ? sessionStorage.getItem('redirectAfterLogin') : null;
  
  // Clear redirect after retrieving
  if (redirectTo) {
    sessionStorage.removeItem('redirectAfterLogin');
  }
  
  if (profileType === 'admin') {
    if (isAuthRoute) toast.success('Welcome back, admin!');
    navigate(redirectTo || '/manage-patients', { replace: true });
  } else if (profileType === 'patient') {
    if (isAuthRoute) toast.success(`Welcome back, patient!`);
    navigate(redirectTo || '/report-viewer', { replace: true });
  } else {
    if (isAuthRoute) toast.success('Welcome back!');
    navigate(redirectTo || '/dashboard', { replace: true });
  }
};

// Helper to clear redirect loop detection data
export const clearRedirectLoopDetection = (): void => {
  sessionStorage.removeItem('loginRedirectCount');
  sessionStorage.removeItem('lastRedirect');
};
