
import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import { useLocation } from "react-router-dom";
import { Logo } from "./navbar/Logo";
import { NavLinks } from "./navbar/NavLinks";
import { UserActions } from "./navbar/UserActions";
import { MobileMenu } from "./navbar/MobileMenu";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useTwilioAuthStore();
  const location = useLocation();

  // Check if user is on dashboard or other authenticated pages
  const isAuthenticatedPage = location.pathname === "/dashboard" || 
                             location.pathname === "/report-viewer";

  // Check if user is an admin based on profile_type from Supabase
  const isAdmin = user?.profile_type === 'admin';

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  return (
    <>
      {/* This empty div acts as a spacer, pushing content down from the fixed header */}
      <div className="h-24"></div>
      
      <header
        className={cn(
          "fixed w-full top-0 z-50 transition-all duration-300",
          scrolled 
            ? "bg-white/95 backdrop-blur-md shadow-sm py-5" 
            : "bg-white py-6"
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Logo />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <NavLinks isAdmin={isAdmin} isAuthenticatedPage={isAuthenticatedPage} />
              
              <UserActions user={user} isAdmin={isAdmin} />
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-health-600 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          <MobileMenu 
            isOpen={mobileMenuOpen} 
            setIsOpen={setMobileMenuOpen} 
            isAdmin={isAdmin} 
            isAuthenticatedPage={isAuthenticatedPage}
            user={user}
          />
        </div>
      </header>
    </>
  );
};

export default Navbar;
