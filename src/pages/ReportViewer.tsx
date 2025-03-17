import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import { Button } from "../components/Button";

export default function ReportViewer() {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patientId");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // Get auth state from store
  const { validateSession } = useTwilioAuthStore();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isValid = await validateSession();
        if (!isValid) {
          navigate("/login");
          return;
        }
        
        if (!patientId) {
          navigate("/patient-id");
          return;
        }
        
        // Simulate loading the report
        setTimeout(() => {
          setIsLoading(false);
        }, 1500);
        
      } catch (err) {
        console.error("Session validation error:", err);
        navigate("/login");
      }
    };
    
    checkAuth();
  }, [navigate, validateSession, patientId]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your report...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <div className="font-bold text-2xl text-orange-600 flex items-center justify-center mb-4">
            <span className="mr-1">GATOR</span>
            <span className="bg-orange-600 text-white px-2 py-0.5 rounded">PRIME</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Report</h1>
          <p className="text-gray-600 mt-2">
            Patient ID: {patientId}
          </p>
        </div>
        
        <div className="border border-gray-200 rounded-md p-8 mb-6 bg-gray-50">
          <p className="text-center text-lg">
            This is a placeholder for the report PDF viewer.
          </p>
          <p className="text-center text-gray-600 mt-2">
            In a real implementation, this would display the PDF report for patient {patientId}.
          </p>
        </div>
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate('/patient-id')}
          >
            Back to Patient ID
          </Button>
          
          <Button 
            variant="health" 
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
