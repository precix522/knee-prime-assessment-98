
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import { Button } from "../components/Button";
import { getPatientReport } from "../utils/supabase";
import { toast } from "sonner";

export default function ReportViewer() {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patientId");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [reportName, setReportName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Get auth state from store
  const { validateSession } = useTwilioAuthStore();
  
  // Fetch patient report from Supabase
  useEffect(() => {
    const fetchPatientReport = async () => {
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
        
        console.log("Fetching report for patient ID:", patientId);
        
        // Fetch the report from Supabase
        const { fileUrl, fileName } = await getPatientReport(patientId);
        setReportUrl(fileUrl);
        setReportName(fileName);
        setIsLoading(false);
      } catch (err: any) {
        console.error("Error fetching patient report:", err);
        setError(err.message || "Failed to load the report");
        toast.error("Failed to load the report");
        setIsLoading(false);
      }
    };
    
    fetchPatientReport();
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
            {reportName && <span> - {reportName}</span>}
          </p>
        </div>
        
        {error && (
          <div className="border border-red-200 rounded-md p-4 mb-6 bg-red-50 text-red-600">
            <p className="text-center">{error}</p>
            <p className="text-center text-sm mt-2">
              Please check if the patient ID is correct or contact support.
            </p>
          </div>
        )}
        
        {!error && reportUrl ? (
          <div className="border border-gray-200 rounded-md mb-6 overflow-hidden bg-gray-50 h-[600px]">
            <iframe 
              src={reportUrl}
              className="w-full h-full"
              title="Patient Report PDF"
              frameBorder="0"
            ></iframe>
          </div>
        ) : (
          !error && (
            <div className="border border-gray-200 rounded-md p-8 mb-6 bg-gray-50">
              <p className="text-center text-lg">
                No report found for this patient ID.
              </p>
              <p className="text-center text-gray-600 mt-2">
                Please check if the patient ID is correct or contact support.
              </p>
            </div>
          )
        )}
        
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
