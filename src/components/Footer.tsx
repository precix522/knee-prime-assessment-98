
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

export const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-health-600 font-bold text-xl flex items-center">
              <span className="mr-1">GATOR</span> 
              PRIME
            </h3>
            <p className="text-gray-600 text-sm">
              Advanced knee health assessment and monitoring to help you maintain mobility and prevent injuries.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/contactus" 
                  className={cn(
                    "text-gray-600 hover:text-health-600 transition-colors duration-300 text-sm",
                    "flex items-center"
                  )}
                >
                  <svg 
                    className="w-3.5 h-3.5 mr-2" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  Contact Us
                </Link>
              </li>
              <li>
                <a 
                  href="#" 
                  className={cn(
                    "text-gray-600 hover:text-health-600 transition-colors duration-300 text-sm",
                    "flex items-center"
                  )}
                >
                  <svg 
                    className="w-3.5 h-3.5 mr-2" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  FAQ
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className={cn(
                    "text-gray-600 hover:text-health-600 transition-colors duration-300 text-sm",
                    "flex items-center"
                  )}
                >
                  <svg 
                    className="w-3.5 h-3.5 mr-2" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
