
import React, { useState } from "react";
import { Button } from "./Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPatientRecord } from "../utils/supabase/patient-db";
import { toast } from "sonner";
import { AlertCircle, Loader2 } from "lucide-react";
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
  
  const uploadFiles = async () => {
    if (!reportFiles || reportFiles.length === 0) return { reportUrl: null };
    
    let reportUrl = null;
    
    try {
      setUploadProgress(10);
      
      if (reportFiles.length > 0) {
        const file = reportFiles[0];
        const fileExt = file.name.split('.').pop();
        
        // Generate a unique patient ID if not provided
        const safePath = `patient-reports/${Math.random().toString(36).substring(2, 12)}`;
        const fileName = `main-report-${Date.now()}.${fileExt}`;
        const filePath = `${safePath}/${fileName}`;
        
        console.log(`Uploading file to bucket 'Patient-report', path: ${filePath}`);
        setUploadProgress(30);
        
        // First check if the bucket exists and is accessible
        const { data: bucketData, error: bucketError } = await supabase
          .storage
          .getBucket('Patient-report');
          
        if (bucketError) {
          console.error('Bucket error:', bucketError);
          throw new Error(`Error accessing storage bucket: ${bucketError.message}`);
        }
        
        setUploadProgress(50);
        
        // Upload file with public access
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
        reportUrl = publicUrl;
        
        setUploadProgress(100);
      }
      
      return { reportUrl };
      
    } catch (error: any) {
      console.error("File upload error:", error);
      throw new Error(`File upload failed: ${error.message}`);
    }
  };
  
  const onSubmit = async (formData: PatientFormData) => {
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);
    toast.info("Processing patient record...");
    
    try {
      // Step 1: Upload files and get the report URL
      const { reportUrl } = await uploadFiles();
      console.log('Report URL after upload:', reportUrl);
      
      if (!reportUrl) {
        throw new Error("Failed to upload report file. Please try again.");
      }
      
      // Step 2: Generate date in YYYY-MM-DD format
      const currentDate = new Date().toISOString().split('T')[0];
      console.log('Current formatted date for database:', currentDate);
      
      // Step 3: Create the patient record with strong typing
      const patientData = {
        patientId: formData.patientId,
        patientName: formData.patientName,
        phoneNumber: formData.phoneNumber,
        reportUrl: reportUrl,
        lastModifiedTime: currentDate
      };
      
      // Step 4: Directly insert into Supabase without using the helper function
      // This bypasses any potential issues with the helper function
      const { data, error: insertError } = await supabase
        .from('patient')
        .insert([{
          Patient_ID: patientData.patientId,
          patient_name: patientData.patientName,
          phone: patientData.phoneNumber,
          report_url: patientData.reportUrl,
          last_modified_tm: currentDate
        }]);
        
      if (insertError) {
        console.error('Direct insert error:', insertError);
        
        // Try update if insert fails due to unique constraint
        if (insertError.code === '23505') { // Unique violation
          console.log('Record exists, attempting update...');
          
          const { data: updateData, error: updateError } = await supabase
            .from('patient')
            .update({
              patient_name: patientData.patientName,
              phone: patientData.phoneNumber,
              report_url: patientData.reportUrl,
              last_modified_tm: currentDate
            })
            .eq('Patient_ID', patientData.patientId);
            
          if (updateError) {
            throw new Error(`Failed to update patient record: ${updateError.message}`);
          }
          
          console.log('Patient record updated successfully');
        } else {
          throw new Error(`Database error: ${insertError.message}`);
        }
      }
      
      toast.success("Patient record created successfully");
      
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
              Upload a PDF report file (required)
            </p>
            {!reportFiles && (
              <p className="text-sm text-red-500 mt-1">Please upload a report file</p>
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
            disabled={isLoading || !reportFiles}
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
