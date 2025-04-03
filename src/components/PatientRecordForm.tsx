
import React, { useState } from "react";
import { Button } from "./Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPatientRecord } from "../utils/supabase/patient-db";
import { toast } from "sonner";
import { AlertCircle, Loader2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "../utils/supabase/client";
import { useForm } from "react-hook-form";

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
    }
  };
  
  const validatePhoneNumber = (value: string) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(value.replace(/\D/g, '')) || "Please enter a valid 10-digit phone number";
  };
  
  const createPatientWithoutUpload = async (formData: PatientFormData) => {
    try {
      // Format the date to YYYY-MM-DD format for the database
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Create patient record without file
      const result = await createPatientRecord({
        patientId: formData.patientId,
        patientName: formData.patientName,
        phoneNumber: formData.phoneNumber,
        reportUrl: null, // No report URL since upload failed
        lastModifiedTime: currentDate
      });
      
      return result;
    } catch (err: any) {
      console.error("Error creating patient without upload:", err);
      throw err;
    }
  };
  
  const uploadFiles = async () => {
    if (!reportFiles || reportFiles.length === 0) return { reportUrl: null };
    
    try {
      setUploadProgress(10);
      
      if (reportFiles.length > 0) {
        const file = reportFiles[0];
        const fileExt = file.name.split('.').pop();
        
        // Generate a unique path
        const safePath = `patient-reports/${Math.random().toString(36).substring(2, 12)}`;
        const fileName = `main-report-${Date.now()}.${fileExt}`;
        const filePath = `${safePath}/${fileName}`;
        
        console.log(`Attempting to upload file to bucket 'Patient-report', path: ${filePath}`);
        setUploadProgress(30);
        
        // First check if the bucket exists and is accessible
        try {
          const { data: bucketData, error: bucketError } = await supabase
            .storage
            .getBucket('Patient-report');
            
          if (bucketError) {
            console.error('Bucket error:', bucketError);
            toast.error("Storage bucket not available. Creating patient record without report file.");
            return { reportUrl: null, bucketError };
          }
        } catch (bucketErr) {
          console.error('Error checking bucket:', bucketErr);
          toast.error("Storage bucket not available. Creating patient record without report file.");
          return { reportUrl: null, bucketError: bucketErr };
        }
        
        setUploadProgress(50);
        
        // Upload file
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
        
        setUploadProgress(80);
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('Patient-report')
          .getPublicUrl(filePath);
          
        console.log('File uploaded successfully. Public URL:', publicUrl);
        setUploadProgress(100);
        
        return { reportUrl: publicUrl };
      }
      
      return { reportUrl: null };
      
    } catch (error: any) {
      console.error("File upload error:", error);
      // If this is a bucket not found error, we'll continue with creating the patient record
      if (error.message && error.message.includes("Bucket not found")) {
        toast.error("Storage bucket not configured. Saving patient record without file.");
        return { reportUrl: null, bucketError: error };
      }
      throw new Error(`File upload failed: ${error.message}`);
    }
  };
  
  const onSubmit = async (formData: PatientFormData) => {
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);
    toast.info("Processing patient record...");
    
    try {
      // Try to upload files first
      const { reportUrl, bucketError } = await uploadFiles();
      
      // Format date in YYYY-MM-DD format for database
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Create patient record with or without the report URL
      const patientData = {
        patientId: formData.patientId,
        patientName: formData.patientName,
        phoneNumber: formData.phoneNumber,
        reportUrl: reportUrl, // This might be null if upload failed
        lastModifiedTime: currentDate
      };
      
      // Try direct insert into database
      const insertResult = await createPatientRecord(patientData);
      
      if (bucketError) {
        toast.success("Patient record created successfully without report file");
        setError("Note: Report file could not be uploaded. The storage bucket 'Patient-report' doesn't exist. Patient data was saved without the report file.");
      } else if (!reportUrl) {
        toast.warning("Patient record created, but without a report file");
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
      
      if (err.message && err.message.includes("Bucket not found")) {
        setError("Storage bucket 'Patient-report' doesn't exist in Supabase. Please create it in the Supabase dashboard first.");
      }
      
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
      
      {/* Information message about storage setup */}
      <Alert variant="info" className="mb-4 bg-blue-50 border-blue-200">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Make sure the "Patient-report" storage bucket exists in your Supabase project. 
          If patient data is saved without a file, you can upload the file later.
        </AlertDescription>
      </Alert>
      
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
              Upload a PDF report file (recommended but not required)
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
