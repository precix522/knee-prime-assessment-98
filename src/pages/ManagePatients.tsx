
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import PatientRecordForm from "../components/PatientRecordForm";
import { Navbar } from "../components/Navbar";
import Footer from "../components/Footer";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";

export default function ManagePatients() {
  const navigate = useNavigate();
  const { validateSession } = useTwilioAuthStore();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isValid = await validateSession();
        if (!isValid) {
          // Comment out navigation to allow non-authenticated users to register
          // navigate("/login");
        }
      } catch (err) {
        console.error("Session validation error:", err);
        // Comment out navigation to allow non-authenticated users to register
        // navigate("/login");
      }
    };
    
    checkAuth();
  }, [navigate, validateSession]);
  
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Patient Registration
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Register as a new patient and upload your medical reports
            </p>
          </div>
          
          <div className="mt-12 flex justify-center">
            <PatientRecordForm />
          </div>
          
          <div className="mt-6 text-center">
            <Button 
              onClick={() => navigate('/')}
              variant="ghost"
              className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
