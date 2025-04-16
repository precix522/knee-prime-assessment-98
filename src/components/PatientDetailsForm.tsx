
import React, { useState, useEffect } from "react";
import { Button } from "./Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AlertCircle, Loader2, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { uploadPatientDocument } from "../utils/supabase";
import { supabase } from "../utils/supabase/client";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";

interface PatientDetailsFormProps {
  onSuccess: () => void;
}

export default function PatientDetailsForm({ onSuccess }: PatientDetailsFormProps) {
  const { user } = useTwilioAuthStore();
  const [patientId, setPatientId] = useState("");
  const [xrayFile, setXrayFile] = useState<File | null>(null);
  const [mriFile, setMriFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [xrayPreviewUrl, setXrayPreviewUrl] = useState<string | null>(null);
  const [mriPreviewUrl, setMriPreviewUrl] = useState<string | null>(null);
  
  useEffect(() => {
    // Auto-fetch Patient ID from the authenticated user
    if (user && user.id) {
      setPatientId(user.id);
    }
  }, [user]);
  
  useEffect(() => {
    // Clean up the object URLs when component unmounts or when files change
    return () => {
      if (xrayPreviewUrl) {
        URL.revokeObjectURL(xrayPreviewUrl);
      }
      if (mriPreviewUrl) {
        URL.revokeObjectURL(mriPreviewUrl);
      }
    };
  }, [xrayPreviewUrl, mriPreviewUrl]);
  
  const handleXrayFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setXrayFile(file);
      
      // Create preview URL
      const fileUrl = URL.createObjectURL(file);
      setXrayPreviewUrl(fileUrl);
    }
  };
  
  const handleMriFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMriFile(file);
      
      // Create preview URL
      const fileUrl = URL.createObjectURL(file);
      setMriPreviewUrl(fileUrl);
    }
  };
  
  const validateForm = () => {
    if (!patientId.trim()) {
      setError("Patient ID is required");
      return false;
    }
    
    // Either MRI or X-ray is required
    if (!mriFile && !xrayFile) {
      setError("Please upload at least one medical image (X-ray or MRI)");
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);
    toast.info("Uploading your medical images...");
    
    try {
      // Check if patient ID exists
      const { data: patientData, error: patientError } = await supabase
        .from('patient')
        .select('Patient_ID')
        .eq('Patient_ID', patientId)
        .limit(1);
        
      if (patientError) {
        throw new Error(`Error checking patient: ${patientError.message}`);
      }
      
      if (!patientData || patientData.length === 0) {
        throw new Error("Patient ID not found. Please check and try again.");
      }
      
      let mriReportUrl = null;
      let xrayReportUrl = null;
      
      // Upload MRI if provided
      if (mriFile) {
        setUploadProgress(25);
        console.log('Uploading MRI report file...');
        mriReportUrl = await uploadPatientDocument(mriFile, patientId, 'mri');
        setUploadProgress(50);
      }
      
      // Upload X-ray if provided
      if (xrayFile) {
        setUploadProgress(mriFile ? 50 : 25);
        console.log('Uploading X-ray report file...');
        xrayReportUrl = await uploadPatientDocument(xrayFile, patientId, 'xray');
        setUploadProgress(75);
      }
      
      // Update patient record with the new URLs
      const updateData: any = {};
      
      if (mriReportUrl) {
        updateData.patient_mri_report_url = mriReportUrl;
      }
      
      if (xrayReportUrl) {
        updateData.patient_xray_report_url = xrayReportUrl;
      }
      
      // Add timestamp for the update
      const now = new Date();
      const formattedDateTime = now.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      }) + ' ' + now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      
      updateData.last_modified_tm = formattedDateTime;
      
      // Update the patient record
      const { error: updateError } = await supabase
        .from('patient')
        .update(updateData)
        .eq('Patient_ID', patientId);
        
      if (updateError) {
        throw new Error(`Error updating patient record: ${updateError.message}`);
      }
      
      setUploadProgress(100);
      toast.success("Medical images uploaded successfully!");
      
      // Reset form
      setXrayFile(null);
      setMriFile(null);
      setXrayPreviewUrl(null);
      setMriPreviewUrl(null);
      
      // Reset file inputs
      const xrayInput = document.getElementById('xrayFile') as HTMLInputElement;
      if (xrayInput) xrayInput.value = '';
      
      const mriInput = document.getElementById('mriFile') as HTMLInputElement;
      if (mriInput) mriInput.value = '';
      
      // Call success callback
      onSuccess();
      
    } catch (err: any) {
      console.error("Error updating patient record:", err);
      setError(err.message || "An error occurred while updating your records");
      toast.error("Failed to update your records");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Add Your Details</h2>
        <p className="text-gray-600 mt-1">Upload your medical images to update your records</p>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="patientId">Your Patient ID</Label>
            <Input 
              id="patientId" 
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="Patient ID will be automatically filled" 
              disabled={true}
              className="bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your Patient ID is automatically retrieved from your account
            </p>
          </div>
          
          <div>
            <Label htmlFor="xrayFile">X-ray Report (PDF)</Label>
            <Input 
              id="xrayFile" 
              type="file"
              onChange={handleXrayFileChange}
              accept=".pdf"
              disabled={isLoading}
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload your X-ray report (optional)
            </p>
            
            {xrayFile && (
              <div className="mt-2 border border-gray-200 rounded-md p-3 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-orange-500 mr-2" />
                  <span className="text-sm text-gray-700 truncate max-w-[200px]">{xrayFile.name}</span>
                </div>
                <span className="text-xs text-gray-500">{(xrayFile.size / 1024).toFixed(0)} KB</span>
              </div>
            )}
            
            {xrayPreviewUrl && (
              <div className="mt-3 border border-gray-200 rounded-md overflow-hidden bg-gray-50">
                <div className="p-2 bg-gray-100 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700">X-ray Report Preview</h4>
                </div>
                <iframe 
                  src={xrayPreviewUrl} 
                  className="w-full h-[200px]"
                  title="X-ray Report Preview"
                />
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="mriFile">MRI Report (PDF)</Label>
            <Input 
              id="mriFile" 
              type="file"
              onChange={handleMriFileChange}
              accept=".pdf"
              disabled={isLoading}
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload your MRI report (optional)
            </p>
            
            {mriFile && (
              <div className="mt-2 border border-gray-200 rounded-md p-3 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-orange-500 mr-2" />
                  <span className="text-sm text-gray-700 truncate max-w-[200px]">{mriFile.name}</span>
                </div>
                <span className="text-xs text-gray-500">{(mriFile.size / 1024).toFixed(0)} KB</span>
              </div>
            )}
            
            {mriPreviewUrl && (
              <div className="mt-3 border border-gray-200 rounded-md overflow-hidden bg-gray-50">
                <div className="p-2 bg-gray-100 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700">MRI Report Preview</h4>
                </div>
                <iframe 
                  src={mriPreviewUrl} 
                  className="w-full h-[200px]"
                  title="MRI Report Preview"
                />
              </div>
            )}
          </div>
          
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-orange-600 h-2.5 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <p className="text-xs text-gray-500 mt-1">Uploading: {uploadProgress}%</p>
            </div>
          )}
          
          <Button
            variant="health"
            size="lg"
            className="w-full"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              "Upload Medical Images"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
