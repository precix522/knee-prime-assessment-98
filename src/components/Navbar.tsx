
import { useState, useEffect } from "react";
import { Button } from "./Button";
import { cn } from "../lib/utils";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header
      className={cn(
        "fixed w-full top-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-white/80 backdrop-blur-md shadow-sm py-3" 
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <a href="/" className="text-gray-900 font-bold text-xl flex items-center">
              <span className="text-health-600 mr-1">GATOR</span>
              PRIME
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
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
            <a 
              href="/manage-patients"
              className="text-gray-700 hover:text-health-600 transition-colors duration-300 text-sm font-medium"
            >
              Sign Up
            </a>
            <Button 
              onClick={() => window.location.href = '/login'}
              variant="health"
              size="sm"
              className="ml-4"
            >
              Access Report
            </Button>
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
        {mobileMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <div className="flex flex-col space-y-4 px-2 pt-2 pb-3">
              <a
                href="#about"
                className="text-gray-900 hover:text-health-600 transition-colors duration-300 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </a>
              <a
                href="#how-it-works"
                className="text-gray-900 hover:text-health-600 transition-colors duration-300 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#benefits"
                className="text-gray-900 hover:text-health-600 transition-colors duration-300 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Benefits
              </a>
              <a
                href="/manage-patients"
                className="text-gray-900 hover:text-health-600 transition-colors duration-300 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up
              </a>
              <Button 
                onClick={() => {
                  window.location.href = '/login';
                  setMobileMenuOpen(false);
                }}
                variant="health"
                size="default"
                className="mt-2"
              >
                Access Report
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
