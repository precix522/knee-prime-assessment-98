
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import { toast } from "sonner";

export default function Logout() {
  const navigate = useNavigate();
  const { logout } = useTwilioAuthStore();
  
  useEffect(() => {
    const performLogout = async () => {
      try {
        // Perform logout
        await logout();
        
        // Show toast notification
        toast.success("Successfully logged out");
        
        // Redirect to login page
        navigate("/login");
      } catch (error) {
        console.error("Error during logout:", error);
        toast.error("Logout failed. Please try again.");
        navigate("/dashboard");
      }
    };
    
    performLogout();
  }, [navigate, logout]);
  
  // Showing a simple loading page while logout happens
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Logging out...</p>
      </div>
    </div>
  );
}
