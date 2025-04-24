
import { FC } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, UserRoundPlus, FileText, Users } from "lucide-react";

interface NavLinksProps {
  isAdmin: boolean;
  isAuthenticatedPage: boolean;
}

export const NavLinks: FC<NavLinksProps> = ({ isAdmin, isAuthenticatedPage }) => {
  const navigate = useNavigate();
  
  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/");
  };

  const handleAdminHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  const handleManagePatientsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/manage-patients");
  };

  const handleAllReportsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/all-reports");
  };

  const handleManageUsersClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/manage-users");
  };

  return (
    <>
      <a 
        href="/" 
        className="text-gray-700 hover:text-health-600 transition-colors duration-300 text-sm font-medium"
        onClick={handleHomeClick}
      >
        <span className="flex items-center">
          <Home size={16} className="mr-1" />
          Home
        </span>
      </a>
      
      {isAdmin ? (
        <a 
          href="/dashboard" 
          className="text-gray-700 hover:text-health-600 transition-colors duration-300 text-sm font-medium"
          onClick={handleAdminHomeClick}
        >
          <span className="flex items-center">
            <Home size={16} className="mr-1" />
            Dashboard
          </span>
        </a>
      ) : (
        !isAuthenticatedPage && (
          <>
            <a 
              href="#about" 
              className="text-gray-700 hover:text-health-600 transition-colors duration-300 text-sm font-medium"
            >
              About
            </a>
            <a 
              href="#how-it-works" 
              className="text-gray-700 hover:text-health-600 transition-colors duration-300 text-sm font-medium"
            >
              How It Works
            </a>
            <a 
              href="#benefits" 
              className="text-gray-700 hover:text-health-600 transition-colors duration-300 text-sm font-medium"
            >
              Benefits
            </a>
          </>
        )
      )}

      {isAdmin && (
        <>
          <a 
            href="/manage-patients"
            className="text-gray-700 hover:text-health-600 transition-colors duration-300 text-sm font-medium"
            onClick={handleManagePatientsClick}
          >
            <span className="flex items-center">
              <UserRoundPlus size={16} className="mr-1" />
              Add Patient
            </span>
          </a>
          <a 
            href="/all-reports"
            className="text-gray-700 hover:text-health-600 transition-colors duration-300 text-sm font-medium"
            onClick={handleAllReportsClick}
          >
            <span className="flex items-center">
              <FileText size={16} className="mr-1" />
              All Reports
            </span>
          </a>
          <a 
            href="/manage-users"
            className="text-gray-700 hover:text-health-600 transition-colors duration-300 text-sm font-medium"
            onClick={handleManageUsersClick}
          >
            <span className="flex items-center">
              <Users size={16} className="mr-1" />
              Manage Users
            </span>
          </a>
        </>
      )}
    </>
  );
};
