import React, { useState, useEffect } from "react";
import { Button } from "./Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AlertCircle, Loader2, FileText, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { uploadPatientDocument } from "../utils/supabase";
import { supabase } from "../utils/supabase/client";
import { useTwilioAuthStore } from "../utils/auth";

interface PatientDetailsFormProps {
  onSuccess: () => void;
}

export default function PatientDetailsForm({ onSuccess }: PatientDetailsFormProps) {
  const { user } = useTwilioAuthStore();
  const [patientId, setPatientId] = useState("");
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [xrayFile, setXrayFile] = useState<File | null>(null);
  const [mriFile, setMriFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [xrayPreviewUrl, setXrayPreviewUrl] = useState<string | null>(null);
  const [mriPreviewUrl, setMriPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.id) {
      setPatientId(user.id);
      // Fetch user's phone from user profile
      if (user.phone) {
        setUserPhone(user.phone);
      } else {
        // Try to get phone from DB if missing in store
        const fetchPhone = async () => {
          try {
            const { data, error } = await supabase
              .from('patient')
              .select('phone')
              .eq('Patient_ID', user.id)
              .maybeSingle();
            if (data && data.phone) setUserPhone(data.phone);
          } catch (e) {
            // ignore
          }
        };
        fetchPhone();
      }
    }
  }, [user]);

  useEffect(() => {
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
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setXrayFile(file);
      const fileUrl = URL.createObjectURL(file);
      setXrayPreviewUrl(fileUrl);
    } else {
      if (xrayPreviewUrl) {
        URL.revokeObjectURL(xrayPreviewUrl);
      }
      setXrayFile(null);
      setXrayPreviewUrl(null);
    }
  };

  const handleMriFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setMriFile(file);
      const fileUrl = URL.createObjectURL(file);
      setMriPreviewUrl(fileUrl);
    } else {
      if (mriPreviewUrl) {
        URL.revokeObjectURL(mriPreviewUrl);
      }
      setMriFile(null);
      setMriPreviewUrl(null);
    }
  };

  const clearXrayFile = () => {
    if (xrayPreviewUrl) {
      URL.revokeObjectURL(xrayPreviewUrl);
    }
    setXrayFile(null);
    setXrayPreviewUrl(null);
    const xrayInput = document.getElementById('xrayFile') as HTMLInputElement;
    if (xrayInput) xrayInput.value = '';
  };

  const clearMriFile = () => {
    if (mriPreviewUrl) {
      URL.revokeObjectURL(mriPreviewUrl);
    }
    setMriFile(null);
    setMriPreviewUrl(null);
    const mriInput = document.getElementById('mriFile') as HTMLInputElement;
    if (mriInput) mriInput.value = '';
  };

  const validateForm = () => {
    if (!patientId.trim()) {
      setError("Patient ID is required");
      return false;
    }
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

      // Prepare phone with suffix
      let patientPhone: string | null = userPhone ? userPhone.trim() : null;
      if (patientPhone) {
        // Add `_timestamp` to phone (for uniqueness), just like admin form
        const phoneSuffix = `_${now.getTime()}`;
        // Only add if doesn't already have (avoid adding twice)
        if (!patientPhone.endsWith(phoneSuffix)) {
          patientPhone = `${patientPhone}${phoneSuffix}`;
        }
      }

      let xrayRowSuccess = false;
      let mriRowSuccess = false;

      if (xrayFile) {
        setUploadProgress(25);
        const xrayReportUrl = await uploadPatientDocument(xrayFile, patientId, 'xray');
        setUploadProgress(50);

        const xrayInsertData: any = {
          Patient_ID: patientId,
          last_modified_tm: formattedDateTime,
          profile_type: 'patient',
          patient_xray_report_url: xrayReportUrl,
          // Store phone with suffix if available
          ...(patientPhone && { phone: patientPhone }),
        };

        const { error: insertError } = await supabase
          .from('patient')
          .insert([xrayInsertData])
          .select();

        if (insertError) {
          throw new Error(`Error inserting X-ray record: ${insertError.message}`);
        }
        xrayRowSuccess = true;
      }

      if (mriFile) {
        setUploadProgress(xrayFile ? 50 : 25);
        const mriReportUrl = await uploadPatientDocument(mriFile, patientId, 'mri');
        setUploadProgress(75);

        const mriInsertData: any = {
          Patient_ID: patientId,
          last_modified_tm: formattedDateTime,
          profile_type: 'patient',
          patient_mri_report_url: mriReportUrl,
          // Store phone with suffix if available
          ...(patientPhone && { phone: patientPhone }),
        };

        const { error: insertError } = await supabase
          .from('patient')
          .insert([mriInsertData])
          .select();

        if (insertError) {
          throw new Error(`Error inserting MRI record: ${insertError.message}`);
        }
        mriRowSuccess = true;
      }

      setUploadProgress(100);

      if ((xrayFile && xrayRowSuccess) || (mriFile && mriRowSuccess)) {
        toast.success("Medical images uploaded and records added!");
      } else {
        throw new Error("Neither X-ray nor MRI record was successfully inserted.");
      }

      setXrayFile(null);
      setMriFile(null);
      setXrayPreviewUrl(null);
      setMriPreviewUrl(null);

      const xrayInput = document.getElementById('xrayFile') as HTMLInputElement;
      if (xrayInput) xrayInput.value = '';
      const mriInput = document.getElementById('mriFile') as HTMLInputElement;
      if (mriInput) mriInput.value = '';

      onSuccess();
    } catch (err: any) {
      console.error("Error inserting patient record:", err);
      setError(err.message || "An error occurred while saving your records");
      toast.error("Failed to add your documents");
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
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input 
                  id="xrayFile" 
                  type="file"
                  onChange={handleXrayFileChange}
                  accept=".pdf"
                  disabled={isLoading}
                  className="cursor-pointer"
                />
              </div>
              {xrayFile && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={clearXrayFile}
                  className="flex items-center gap-1"
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>
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
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input 
                  id="mriFile" 
                  type="file"
                  onChange={handleMriFileChange}
                  accept=".pdf"
                  disabled={isLoading}
                  className="cursor-pointer"
                />
              </div>
              {mriFile && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={clearMriFile}
                  className="flex items-center gap-1"
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>
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
