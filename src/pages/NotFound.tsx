
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTwilioAuthStore } from "@/utils/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const NotFound = () => {
  const location = useLocation();
  const { user } = useTwilioAuthStore();
  const profileType = user?.profile_type || localStorage.getItem('userProfileType') || 'patient';

  useEffect(() => {
    // Log the 404 error with additional context for debugging
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
      "User profile type:",
      profileType
    );
    
    // Show a toast notification to inform the user
    toast.error("Page not found", {
      description: `The page "${location.pathname}" does not exist.`,
    });
  }, [location.pathname, profileType]);

  // Determine the appropriate home page based on user profile type
  const getHomePage = () => {
    if (profileType === 'admin') {
      return "/manage-patients";
    } else if (profileType === 'patient') {
      return "/report-viewer";
    }
    return "/";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-8 rounded-lg bg-white shadow-md">
        <h1 className="text-6xl font-bold mb-4 text-gray-900">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
        <p className="text-gray-500 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to={getHomePage()}>
          <Button className="bg-health-500 hover:bg-health-600 text-white">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
