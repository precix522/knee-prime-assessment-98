
import React, { useState } from "react";
import { Button } from "./Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPatientRecord } from "../utils/supabase/patient-db";
import { toast } from "sonner";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "../utils/supabase/client";

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
    if (!formData.reportFiles) return { reportUrl: null };
    
    let reportUrl = null;
    
    try {
      const folderPath = `patient-reports/${formData.patientId}`;
      
      if (formData.reportFiles.length > 0) {
        const file = formData.reportFiles[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `main-report-${Date.now()}.${fileExt}`;
        const filePath = `${folderPath}/${fileName}`;
        
        console.log(`Uploading file 1 of ${formData.reportFiles.length} to bucket 'Patient-report'...`);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('Patient-report')
          .upload(filePath, file, {
            upsert: true,
            cacheControl: '3600'
          });
          
        if (uploadError) {
          console.error('Upload error details:', uploadError);
          throw new Error(`Error uploading file: ${uploadError.message}`);
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('Patient-report')
          .getPublicUrl(filePath);
          
        console.log('File uploaded successfully. Public URL:', publicUrl);
        reportUrl = publicUrl;
        
        setUploadProgress(100);
      }
      
      return { reportUrl };
      
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
      // Step 1: Upload files and get the report URL
      const { reportUrl } = await uploadFiles();
      console.log('Report URL after upload:', reportUrl);
      
      // Step 2: Generate timestamp for the record
      const currentDate = new Date().toISOString();
      console.log('Current timestamp for database:', currentDate);
      
      // Step 3: Create the patient record with strong typing
      const patientData = {
        patientId: formData.patientId,
        patientName: formData.patientName,
        phoneNumber: formData.phoneNumber,
        reportUrl: reportUrl,
        lastModifiedTime: currentDate
      };
      
      // Step 4: Submit the data to Supabase
      const result = await createPatientRecord(patientData);
      
      console.log('Patient record creation result:', result);
      toast.success("Patient record created successfully");
      
      // Reset form after successful submission
      setFormData({
        patientName: "",
        patientId: "",
        phoneNumber: "",
        reportFiles: null
      });
      
      // Reset file input
      const fileInput = document.getElementById('reportFiles') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
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
