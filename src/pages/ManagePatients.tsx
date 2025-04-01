
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import PatientRecordForm from "../components/PatientRecordForm";

export default function ManagePatients() {
  const navigate = useNavigate();
  const { validateSession } = useTwilioAuthStore();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isValid = await validateSession();
        if (!isValid) {
          navigate("/login");
        }
      } catch (err) {
        console.error("Session validation error:", err);
        navigate("/login");
      }
    };
    
    checkAuth();
  }, [navigate, validateSession]);
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Patient Management
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Add new patient records and upload reports
          </p>
        </div>
        
        <div className="mt-12 flex justify-center">
          <PatientRecordForm />
        </div>
        
        <div className="mt-6 text-center">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-orange-600 hover:text-orange-800 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
