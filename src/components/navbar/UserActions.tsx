
import { FC } from "react";
import { Button } from "../Button";
import { LogOut, LogIn, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserActionsProps {
  user: any;
  isAdmin: boolean;
}

export const UserActions: FC<UserActionsProps> = ({ user, isAdmin }) => {
  const navigate = useNavigate();
  
  const handleSignOut = () => {
    navigate('/logout');
  };
  
  const handleAdminLogin = () => {
    // Explicitly navigate to the general login page
    navigate('/general-login');
  };
  
  const handleAccessReport = () => {
    navigate('/general-login');
  };
  
  const handleGeneralLogin = () => {
    navigate('/general-login');
  };
  
  const handleAdminDashboard = () => {
    // Navigate to the manage-patients page for admin users
    navigate('/manage-patients');
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
      {isAdmin && (
        <Button 
          onClick={handleAdminDashboard}
          variant="health"
          size="sm"
          className="whitespace-nowrap"
        >
          Admin Dashboard
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
