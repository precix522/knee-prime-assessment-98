
import React, { useState } from "react";
import { Button } from "./Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPatientRecord } from "../utils/supabase/patient-db";
import { uploadPatientDocument } from "../utils/supabase/storage";
import { toast } from "sonner";
import { AlertCircle, Loader2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { supabase } from "../utils/supabase/client";

interface PatientFormData {
  patientName: string;
  patientId: string;
  phoneNumber: string;
}

export default function PatientRecordForm() {
  const [reportFiles, setReportFiles] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const { register, handleSubmit: formSubmit, formState: { errors }, reset } = useForm<PatientFormData>({
    defaultValues: {
      patientName: "",
      patientId: "",
      phoneNumber: ""
    }
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setReportFiles(e.target.files);
      setUploadError(null); // Clear previous upload errors
    }
  };
  
  const validatePhoneNumber = (value: string) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(value.replace(/\D/g, '')) || "Please enter a valid 10-digit phone number";
  };
  
  const uploadFiles = async (patientId: string): Promise<string> => {
    if (!reportFiles || reportFiles.length === 0) {
      // No files to upload, return a placeholder URL
      return 'https://placeholder-url.com/no-report';
    }
    
    try {
      setUploadProgress(20);
      
      // Upload the first file
      const file = reportFiles[0];
      const result = await uploadPatientDocument(file, patientId, 'main');
      
      setUploadProgress(100);
      
      if (!result.success) {
        setUploadError(result.error || "File upload failed. The patient record was saved, but without the report file.");
        return result.url; // Return the placeholder URL
      }
      
      return result.url;
      
    } catch (error: any) {
      console.error("File upload error:", error);
      setUploadProgress(0);
      setUploadError(error.message || "File upload failed");
      // Return placeholder URL if upload fails
      return 'https://placeholder-url.com/no-report';
    }
  };
  
  const onSubmit = async (formData: PatientFormData) => {
    setIsLoading(true);
    setError(null);
    setUploadError(null);
    setUploadProgress(0);
    toast.info("Processing patient record...");
    
    try {
      // Upload the file first
      const reportUrl = await uploadFiles(formData.patientId);
      
      // Format date in YYYY-MM-DD format for database
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Create patient record with the report URL (real or placeholder)
      await createPatientRecord({
        patientId: formData.patientId,
        patientName: formData.patientName,
        phoneNumber: formData.phoneNumber,
        reportUrl: reportUrl,
        lastModifiedTime: currentDate
      });
      
      if (uploadError) {
        toast.warning("Patient record created, but file upload was not successful");
      } else {
        toast.success("Patient record created successfully with report file");
      }
      
      // Reset form after successful submission
      reset();
      setReportFiles(null);
      
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
  
  const handleOpenSupabaseDashboard = () => {
    // Open the Supabase storage dashboard in a new tab
    const supabaseUrl = supabase.supabaseUrl;
    const storageUrl = `${supabaseUrl}/storage/buckets`;
    window.open(storageUrl, '_blank');
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
      
      {/* Information message about storage setup */}
      <Alert className="mb-4 bg-blue-50 border-blue-200">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <p>To enable file uploads, make sure the "Patient-report" bucket exists in your Supabase project.</p>
          <button 
            onClick={handleOpenSupabaseDashboard}
            className="text-blue-600 underline mt-1 text-sm hover:text-blue-800"
          >
            Open Supabase Storage Dashboard
          </button>
        </AlertDescription>
      </Alert>
      
      {uploadError && (
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            {uploadError}
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={formSubmit(onSubmit)}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="patientName">Patient Name</Label>
            <Input 
              id="patientName"
              {...register("patientName", { 
                required: "Patient name is required" 
              })}
              placeholder="Enter patient name" 
              disabled={isLoading}
            />
            {errors.patientName && (
              <p className="text-sm text-red-500 mt-1">{errors.patientName.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="patientId">Patient ID</Label>
            <Input 
              id="patientId"
              {...register("patientId", { 
                required: "Patient ID is required" 
              })}
              placeholder="Enter unique patient ID" 
              disabled={isLoading}
            />
            {errors.patientId && (
              <p className="text-sm text-red-500 mt-1">{errors.patientId.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input 
              id="phoneNumber"
              {...register("phoneNumber", { 
                required: "Phone number is required",
                validate: validatePhoneNumber
              })}
              placeholder="Enter 10-digit phone number" 
              disabled={isLoading}
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-500 mt-1">{errors.phoneNumber.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="reportFiles">Patient Reports (PDF)</Label>
            <Input 
              id="reportFiles" 
              type="file"
              onChange={handleFileChange}
              accept=".pdf"
              disabled={isLoading}
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload a PDF report file (optional)
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
