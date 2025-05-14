
import { FC } from "react";
import { Button } from "../Button";
import { LogOut, LogIn, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTwilioAuthStore } from "../../utils/auth";

interface UserActionsProps {
  user: any;
  isAdmin: boolean;
}

export const UserActions: FC<UserActionsProps> = ({ user, isAdmin }) => {
  const navigate = useNavigate();
  const { logout } = useTwilioAuthStore();
  
  const handleSignOut = () => {
    // Clear any session storage items that might be causing redirect loops
    sessionStorage.removeItem('loginRedirectCount');
    sessionStorage.removeItem('lastRedirect');
    sessionStorage.removeItem('redirectAfterLogin');
    
    // Also clear localStorage items related to user profiles
    localStorage.removeItem('userProfileType');
    
    // Use the logout function from the auth store
    logout();
    
    // Then navigate to home
    navigate('/', { replace: true });
  };
  
  const handleAdminLogin = () => {
    // Clear any potential redirect loop detection
    sessionStorage.removeItem('loginRedirectCount');
    sessionStorage.removeItem('lastRedirect');
    
    // Clear any stored user profile data
    localStorage.removeItem('userProfileType');
    
    // Explicitly navigate to the general login page
    navigate('/general-login', { replace: true });
  };
  
  const handleAccessReport = () => {
    // Clean up any potential redirect indicators
    sessionStorage.removeItem('loginRedirectCount');
    sessionStorage.removeItem('lastRedirect');
    
    // Navigate to login
    navigate('/general-login', { replace: true });
  };
  
  const handleGeneralLogin = () => {
    // Clear any potential redirect loop detection
    sessionStorage.removeItem('loginRedirectCount');
    sessionStorage.removeItem('lastRedirect');
    
    // Clear any stored user profile data
    localStorage.removeItem('userProfileType');
    
    // Navigate to login
    navigate('/general-login', { replace: true });
  };
  
  const handleAdminDashboard = () => {
    // Clean up any potential redirect indicators
    sessionStorage.removeItem('loginRedirectCount');
    sessionStorage.removeItem('lastRedirect');
    
    // Navigate to the admin dashboard for admin users
    navigate('/admin-dashboard', { replace: true });
  };

  const handlePatientDashboard = () => {
    // Clean up any potential redirect indicators
    sessionStorage.removeItem('loginRedirectCount');
    sessionStorage.removeItem('lastRedirect');
    
    // Navigate to the patient dashboard for patient users
    navigate('/patient-dashboard', { replace: true });
  };

  return user ? (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <User size={16} className="text-health-600 shrink-0" />
        <span className="text-sm font-medium truncate max-w-[150px]">
          {user?.phone || "User"}
          {isAdmin && <span className="ml-1 text-health-600">(Admin)</span>}
        </span>
      </div>
      {isAdmin ? (
        <Button 
          onClick={handleAdminDashboard}
          variant="health"
          size="sm"
          className="whitespace-nowrap"
        >
          Admin Dashboard
        </Button>
      ) : (
        <Button 
          onClick={handlePatientDashboard}
          variant="health"
          size="sm"
          className="whitespace-nowrap"
        >
          My Dashboard
        </Button>
      )}
      <Button 
        onClick={handleSignOut}
        variant="outline"
        size="sm"
        className="border-health-500 text-health-600 whitespace-nowrap"
      >
        <LogOut size={16} className="mr-1" />
        Sign Out
      </Button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleAdminLogin}
        variant="health"
        size="sm"
        className="whitespace-nowrap"
      >
        <User size={16} className="mr-1" />
        Admin Login
      </Button>

      <Button 
        onClick={handleAccessReport}
        variant="health"
        size="sm"
        className="whitespace-nowrap"
      >
        Access Report
      </Button>
      <Button 
        onClick={handleGeneralLogin}
        variant="outline"
        size="sm"
        className="border-health-500 text-health-600 whitespace-nowrap"
      >
        <LogIn size={16} className="mr-1" />
        Login
      </Button>
    </div>
  );
};
