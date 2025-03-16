
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PatientID() {
  const [patientId, setPatientId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Get auth state from store
  const { user, validateSession } = useTwilioAuthStore();
  
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientId.trim()) {
      setError("Please enter a valid Patient ID");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate checking the patient ID (mock implementation)
      // In a real app, you would call an API to verify the patient ID
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any non-empty patient ID
      // Navigate to the PDF viewer with the patient ID
      navigate(`/report-viewer?patientId=${encodeURIComponent(patientId)}`);
      
    } catch (err) {
      console.error("Error checking patient ID:", err);
      setError("An error occurred. Please try again later.");
      toast.error("Failed to verify patient ID");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <div className="text-center mb-8">
          <div className="font-bold text-2xl text-orange-600 flex items-center justify-center mb-4">
            <span className="mr-1">GATOR</span>
            <span className="bg-orange-600 text-white px-2 py-0.5 rounded">PRIME</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Enter Patient ID</h1>
          <p className="text-gray-600 mt-2">
            Please enter your Patient ID to access your PRIME assessment report
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <Label
              htmlFor="patientId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Patient ID
            </Label>
            <Input
              id="patientId"
              type="text"
              placeholder="Enter your Patient ID"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full"
              required
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Your Patient ID was provided by your healthcare provider
            </p>
          </div>
          
          <Button
            variant="health"
            size="lg"
            className="w-full"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Checking..." : "Access My Report"}
          </Button>
        </form>
        
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Don't have a Patient ID?{" "}
            <a href="mailto:support@precix.health" className="text-orange-600 hover:text-orange-800">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
