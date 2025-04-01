
import React, { useState } from "react";
import { Button } from "./Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "../utils/supabase";
import { toast } from "sonner";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PatientRecord {
  patientName: string;
  patientId: string;
  phoneNumber: string;
  reportFiles: FileList | null;
}

export default function PatientRecordForm() {
  const [formData, setFormData] = useState<PatientRecord>({
    patientName: "",
    patientId: "",
    phoneNumber: "",
    reportFiles: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    
    if (name === "reportFiles" && files) {
      setFormData({ ...formData, reportFiles: files });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const validateForm = () => {
    if (!formData.patientName.trim()) {
      setError("Patient name is required");
      return false;
    }
    
    if (!formData.patientId.trim()) {
      setError("Patient ID is required");
      return false;
    }
    
    if (!formData.phoneNumber.trim()) {
      setError("Phone number is required");
      return false;
    }
    
    // Simple phone validation (can be made more sophisticated)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phoneNumber.replace(/\D/g, ''))) {
      setError("Please enter a valid 10-digit phone number");
      return false;
    }
    
    if (!formData.reportFiles || formData.reportFiles.length === 0) {
      setError("Please upload at least one PDF report");
      return false;
    }
    
    return true;
  };
  
  const uploadFiles = async () => {
    if (!formData.reportFiles) return { reportUrl: null, annexReportUrl: null };
    
    const urls: { reportUrl: string | null; annexReportUrl: string | null } = {
      reportUrl: null,
      annexReportUrl: null
    };
    
    try {
      // Create a folder path using patient ID
      const folderPath = `patient-reports/${formData.patientId}`;
      
      // Upload each file
      for (let i = 0; i < formData.reportFiles.length; i++) {
        const file = formData.reportFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${i === 0 ? 'main-report' : 'annex-report'}-${Date.now()}.${fileExt}`;
        const filePath = `${folderPath}/${fileName}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('patient-documents')
          .upload(filePath, file, {
            upsert: true,
          });
          
        if (uploadError) {
          throw new Error(`Error uploading file: ${uploadError.message}`);
        }
        
        // Get public URL for the file
        const { data: { publicUrl } } = supabase.storage
          .from('patient-documents')
          .getPublicUrl(filePath);
          
        if (i === 0) {
          urls.reportUrl = publicUrl;
        } else if (i === 1) {
          urls.annexReportUrl = publicUrl;
        }
        
        // Update progress
        setUploadProgress(Math.round(((i + 1) / formData.reportFiles.length) * 100));
      }
      
      return urls;
      
    } catch (error: any) {
      console.error("File upload error:", error);
      throw new Error(`File upload failed: ${error.message}`);
    }
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
    toast.info("Processing patient record...");
    
    try {
      // First check if patient ID already exists
      const { data: existingPatient, error: checkError } = await supabase
        .from('patient')
        .select('Patient_ID')
        .eq('Patient_ID', formData.patientId);
        
      if (checkError) {
        throw new Error(`Error checking patient ID: ${checkError.message}`);
      }
      
      if (existingPatient && existingPatient.length > 0) {
        throw new Error(`Patient ID ${formData.patientId} already exists`);
      }
      
      // Upload files to storage
      const { reportUrl, annexReportUrl } = await uploadFiles();
      
      // Insert record into patient table
      const { error: insertError } = await supabase
        .from('patient')
        .insert([
          {
            Patient_ID: formData.patientId,
            patient_name: formData.patientName,
            phone_number: formData.phoneNumber,
            report_url: reportUrl,
            annex_report_url: annexReportUrl
          }
        ]);
        
      if (insertError) {
        throw new Error(`Error saving patient record: ${insertError.message}`);
      }
      
      // Success!
      toast.success("Patient record created successfully");
      
      // Reset the form
      setFormData({
        patientName: "",
        patientId: "",
        phoneNumber: "",
        reportFiles: null
      });
      
    } catch (err: any) {
      console.error("Error creating patient record:", err);
      setError(err.message || "An error occurred while creating the patient record");
      toast.error("Failed to create patient record");
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };
  
  return (
    <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Add Patient Record</h2>
        <p className="text-gray-600 mt-2">Enter patient details and upload reports</p>
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
            <Label htmlFor="patientName">Patient Name</Label>
            <Input 
              id="patientName" 
              name="patientName"
              value={formData.patientName}
              onChange={handleInputChange}
              placeholder="Enter patient name" 
              disabled={isLoading}
            />
          </div>
          
          <div>
            <Label htmlFor="patientId">Patient ID</Label>
            <Input 
              id="patientId" 
              name="patientId"
              value={formData.patientId}
              onChange={handleInputChange}
              placeholder="Enter unique patient ID" 
              disabled={isLoading}
            />
          </div>
          
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input 
              id="phoneNumber" 
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter 10-digit phone number" 
              disabled={isLoading}
            />
          </div>
          
          <div>
            <Label htmlFor="reportFiles">Patient Reports (PDF)</Label>
            <Input 
              id="reportFiles" 
              name="reportFiles"
              type="file"
              onChange={handleInputChange}
              accept=".pdf"
              multiple
              disabled={isLoading}
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload up to 2 PDF files (main report and annex report)
            </p>
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
                Processing...
              </>
            ) : (
              "Save Patient Record"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
