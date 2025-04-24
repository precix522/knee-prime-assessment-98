
import { FC, Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../Button";
import { Home, User, LogIn, LogOut, UserRoundPlus, FileText, Users } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  isAdmin: boolean;
  isAuthenticatedPage: boolean;
  user: any;
}

export const MobileMenu: FC<MobileMenuProps> = ({ 
  isOpen, 
  setIsOpen, 
  isAdmin, 
  isAuthenticatedPage,
  user
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="md:hidden py-4 animate-fade-in">
      <div className="flex flex-col space-y-4 px-2 pt-2 pb-3">
        <a
          href="/"
          className="text-gray-900 hover:text-health-600 transition-colors duration-300 px-3 py-2 rounded-md text-base font-medium"
          onClick={(e) => {
            e.preventDefault();
            setIsOpen(false);
            navigate("/");
          }}
        >
          <span className="flex items-center">
            <Home size={16} className="mr-1" />
            Home
          </span>
        </a>
        
        {isAdmin ? (
          <a
            href="/dashboard"
            className="text-gray-900 hover:text-health-600 transition-colors duration-300 px-3 py-2 rounded-md text-base font-medium"
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(false);
              navigate("/dashboard");
            }}
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
                className="text-gray-900 hover:text-health-600 transition-colors duration-300 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                About
              </a>
              <a
                href="#how-it-works"
                className="text-gray-900 hover:text-health-600 transition-colors duration-300 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#benefits"
                className="text-gray-900 hover:text-health-600 transition-colors duration-300 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
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
              className="text-gray-900 hover:text-health-600 transition-colors duration-300 px-3 py-2 rounded-md text-base font-medium"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
                navigate("/manage-patients");
              }}
            >
              <span className="flex items-center">
                <UserRoundPlus size={16} className="mr-1" />
                Add Patient
              </span>
            </a>
            <a 
              href="/all-reports"
              className="text-gray-700 hover:text-health-600 transition-colors duration-300 px-3 py-2 rounded-md text-base font-medium"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
                navigate("/all-reports");
              }}
            >
              <span className="flex items-center">
                <FileText size={16} className="mr-1" />
                All Reports
              </span>
            </a>
            <a 
              href="/manage-users"
              className="text-gray-700 hover:text-health-600 transition-colors duration-300 px-3 py-2 rounded-md text-base font-medium"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
                navigate("/manage-users");
              }}
            >
              <span className="flex items-center">
                <Users size={16} className="mr-1" />
                Manage Users
              </span>
            </a>
          </>
        )}
        
        {user ? (
          <div className="px-3 py-2">
            <div className="flex items-center gap-2 mb-3">
              <User size={16} className="text-health-600" />
              <span className="text-sm font-medium">
                {user?.phone || "User"}
                {isAdmin && <span className="ml-1 text-health-600">(Admin)</span>}
              </span>
            </div>
            <Button 
              onClick={() => {
                window.location.href = '/logout';
                setIsOpen(false);
              }}
              variant="outline"
              size="sm"
              className="border-health-500 text-health-600"
            >
              <LogOut size={16} className="mr-1" />
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 px-3 py-2">
            <Button
              onClick={() => {
                window.location.href = '/login';
                setIsOpen(false);
              }}
              variant="health"
              size="default"
            >
              <User size={16} className="mr-1" />
              Admin Login
            </Button>

            <Button 
              onClick={() => {
                window.location.href = '/login';
                setIsOpen(false);
              }}
              variant="health"
              size="default"
            >
              Access Report
            </Button>
            <Button 
              onClick={() => {
                window.location.href = '/general-login';
                setIsOpen(false);
              }}
              variant="outline"
              size="default"
              className="border-health-500 text-health-600"
            >
              <LogIn size={16} className="mr-1" />
              Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
