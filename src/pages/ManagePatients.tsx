
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import PatientRecordForm from "../components/PatientRecordForm";
import { Navbar } from "../components/Navbar";
import Footer from "../components/Footer";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "../components/ui/button";

export default function ManagePatients() {
  const navigate = useNavigate();
  const { user, validateSession } = useTwilioAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // Check admin authorization and redirect if not authorized
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const isValid = await validateSession();
        
        if (!isValid) {
          // Not logged in, redirect to login
          navigate("/general-login");
          return;
        }
        
        // Check if user is admin
        if (user?.profile_type === 'admin') {
          setIsAuthorized(true);
        } else {
          // Not admin, redirect to home
          navigate("/");
        }
      } catch (err) {
        console.error("Session validation error:", err);
        navigate("/general-login");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, validateSession, user]);
  
  // Show loading state while checking authorization
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking permissions...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  // Show unauthorized message if not admin
  if (!isAuthorized) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <ShieldAlert className="h-16 w-16 text-health-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page. Only administrators can add new patients.
            </p>
            <Button onClick={() => navigate('/')} variant="health">
              Back to Home
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  // Admin view
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Add Patient
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Add new patients and upload their medical reports
            </p>
            <div className="inline-flex items-center justify-center mt-2 px-3 py-1 bg-health-100 text-health-700 rounded-full text-sm">
              <span className="font-medium">Admin Access</span>
            </div>
          </div>
          
          <div className="mt-12 flex justify-center">
            <PatientRecordForm />
          </div>
          
          <div className="mt-6 text-center">
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
