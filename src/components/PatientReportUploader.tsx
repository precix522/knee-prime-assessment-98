
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, FileText, Loader2, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { syncNow } from "@/utils/aws/s3-fetch-service";

interface PatientReportData {
  patientId?: string;
  patientName?: string;
  phoneNumber?: string;
  reportDate?: string;
  diagnosisCode?: string;
  diagnosis?: string;
}

interface PatientReportUploaderProps {
  onDataConfirmed: (data: PatientReportData) => void;
}

export default function PatientReportUploader({ onDataConfirmed }: PatientReportUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<PatientReportData | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setReportData(null); // Reset previous data
    }
  };
  
  const processReport = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      // First simulate upload
      toast.info("Uploading report for processing...");
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      setIsUploading(false);
      setIsProcessing(true);
      toast.info("Processing report data...");
      
      // Simulate report data extraction
      // In a real implementation, this would call an API to process the report
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, extract some fake data based on filename
      const fileName = file.name.toLowerCase();
      const extractedData: PatientReportData = {
        patientId: `P${Math.floor(Math.random() * 100000)}`,
        patientName: fileName.includes("smith") ? "John Smith" : 
                    fileName.includes("jones") ? "Sarah Jones" : "Patient Name",
        phoneNumber: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        reportDate: new Date().toLocaleDateString(),
        diagnosisCode: `D${Math.floor(Math.random() * 100)}`,
        diagnosis: fileName.includes("diabetes") ? "Diabetes Type 2" :
                  fileName.includes("hypertension") ? "Hypertension" : "General checkup"
      };
      
      setReportData(extractedData);
      toast.success("Report processed successfully");
      
      // In a real implementation, we would also fetch from S3
      try {
        // Try to sync with S3 to get latest data
        await syncNow();
        toast.success("Synced with S3 successfully");
      } catch (e) {
        console.error("Error syncing with S3:", e);
        // Don't show error to user as this is a background operation
      }
    } catch (err) {
      console.error("Error processing report:", err);
      setError("Failed to process the report. Please try again.");
      toast.error("Failed to process report");
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };
  
  const handleConfirm = () => {
    if (reportData) {
      onDataConfirmed(reportData);
      toast.success("Report data confirmed");
    }
  };
  
  return (
    <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Upload Patient Report</h2>
        <p className="text-gray-600 mt-2">
          Upload a report to automatically extract patient data
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="reportFile">Upload Report (PDF)</Label>
          <Input
            id="reportFile"
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileChange}
            disabled={isUploading || isProcessing}
            className="cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-1">
            Supports PDF, Word, and text documents
          </p>
        </div>
        
        {file && (
          <div className="p-3 bg-gray-50 rounded-md flex items-center">
            <FileText className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-sm text-gray-700 truncate">{file.name}</span>
            <span className="text-xs text-gray-500 ml-2">
              ({(file.size / 1024).toFixed(0)} KB)
            </span>
          </div>
        )}
        
        <Button
          onClick={processReport}
          disabled={!file || isUploading || isProcessing}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Uploading...
            </>
          ) : isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Process Report
            </>
          )}
        </Button>
        
        {reportData && (
          <div className="mt-6">
            <Separator className="my-4" />
            <h3 className="font-medium text-lg mb-2">Extracted Data</h3>
            
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-gray-500">Patient ID</Label>
                <p className="font-medium">{reportData.patientId}</p>
              </div>
              
              <div>
                <Label className="text-xs text-gray-500">Patient Name</Label>
                <p className="font-medium">{reportData.patientName}</p>
              </div>
              
              <div>
                <Label className="text-xs text-gray-500">Phone Number</Label>
                <p className="font-medium">{reportData.phoneNumber}</p>
              </div>
              
              <div>
                <Label className="text-xs text-gray-500">Report Date</Label>
                <p className="font-medium">{reportData.reportDate}</p>
              </div>
              
              <div>
                <Label className="text-xs text-gray-500">Diagnosis Code</Label>
                <p className="font-medium">{reportData.diagnosisCode}</p>
              </div>
              
              <div>
                <Label className="text-xs text-gray-500">Diagnosis</Label>
                <p className="font-medium">{reportData.diagnosis}</p>
              </div>
            </div>
            
            <Button
              variant="health"
              onClick={handleConfirm}
              className="w-full mt-4"
            >
              Confirm & Use This Data
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
