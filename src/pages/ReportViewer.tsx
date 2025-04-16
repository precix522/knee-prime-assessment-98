import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import { Button } from "../components/Button";
import { getPatientReport, getAnnexReport, getSupportingDocument } from "../utils/supabase";
import { toast } from "sonner";
import { FileText, BookOpen, Clock, Upload, CalendarDays } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table";
import Navbar from "../components/Navbar";
import PatientDetailsForm from "../components/PatientDetailsForm";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

type PatientReport = {
  fileUrl: string;
  fileName: string;
  timestamp: string;
  assessmentId?: number;
};

export default function ReportViewer() {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patientId");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [annexReportUrl, setAnnexReportUrl] = useState<string | null>(null);
  const [supportingDocUrl, setSupportingDocUrl] = useState<string | null>(null);
  const [reportName, setReportName] = useState<string | null>(null);
  const [annexReportName, setAnnexReportName] = useState<string | null>(null);
  const [supportingDocName, setSupportingDocName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("report");
  const [reportHistory, setReportHistory] = useState<PatientReport[]>([]);
  const [selectedReportIndex, setSelectedReportIndex] = useState(0);
  
  const { validateSession, user } = useTwilioAuthStore();
  
  const fetchReports = async () => {
    try {
      const isValid = await validateSession();
      if (!isValid) {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
        return;
      }
      
      const currentPatientId = patientId || (user?.profile_type === 'patient' ? user?.id : null);
      
      if (!currentPatientId) {
        toast.error("No patient ID provided");
        navigate("/patient-id");
        return;
      }
      
      console.log("Fetching reports for patient ID:", currentPatientId);
      
      const { fileUrl, fileName, allReports } = await getPatientReport(currentPatientId);
      
      if (allReports && allReports.length > 0) {
        setReportHistory(allReports);
      }
      
      setReportUrl(fileUrl);
      setReportName(fileName);
      
      try {
        const annexData = await getAnnexReport(currentPatientId);
        setAnnexReportUrl(annexData.fileUrl);
        setAnnexReportName(annexData.fileName);
      } catch (annexErr: any) {
        console.error("Error fetching annex report:", annexErr);
        toast.error("Failed to load the annex report");
      }
      
      try {
        const supportingDocData = await getSupportingDocument();
        setSupportingDocUrl(supportingDocData.fileUrl);
        setSupportingDocName(supportingDocData.fileName);
      } catch (docErr: any) {
        console.error("Error fetching supporting document:", docErr);
        toast.error("Failed to load the supporting document");
      }
      
      setIsLoading(false);
      toast.success("Reports loaded successfully");
    } catch (err: any) {
      console.error("Error fetching patient report:", err);
      setError(err.message || "Failed to load the report");
      toast.error("Failed to load the report");
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchReports();
  }, [navigate, validateSession, patientId]);
  
  const handleDownload = (url: string | null, filename: string | null) => {
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'patient-report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    }
  };
  
  const handleReportSelect = (index: number) => {
    if (reportHistory[index]) {
      setSelectedReportIndex(index);
      setReportUrl(reportHistory[index].fileUrl);
      setReportName(reportHistory[index].fileName);
    }
  };
  
  const handleAnnexDownload = () => {
    handleDownload(annexReportUrl, annexReportName);
  };
  
  const handleSupportingDocDownload = () => {
    handleDownload(supportingDocUrl, supportingDocName);
  };

  const handleBookAppointment = () => {
    window.open("https://precix.webflow.io/contact", "_blank");
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'report':
        return (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Patient Report</h1>
            
            {error && (
              <div className="border border-red-200 rounded-md p-4 mb-6 bg-red-50 text-red-600">
                <p className="text-center">{error}</p>
                <p className="text-center text-sm mt-2">
                  Please check if the patient ID is correct or contact support.
                </p>
              </div>
            )}
            
            {!error && reportUrl ? (
              <div className="flex flex-col">
                <div className="mb-4">
                  {reportHistory.length > 0 && (
                    <div className="text-gray-600 text-sm mb-2">
                      <span className="font-medium">Report Date:</span> {reportHistory[selectedReportIndex]?.timestamp || 'Unknown'}
                    </div>
                  )}
                </div>
                <div className="border border-gray-200 rounded-md mb-6 overflow-hidden bg-gray-50 h-[600px]">
                  <iframe 
                    src={reportUrl}
                    className="w-full h-full"
                    title="Patient Report PDF"
                    frameBorder="0"
                  ></iframe>
                </div>
                <div className="mb-4">
                  <Button 
                    variant="health" 
                    onClick={() => handleDownload(reportUrl, reportName)}
                    className="flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download Report
                  </Button>
                </div>
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
          </>
        );
      case 'history':
        return (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Report History</h1>
            
            {reportHistory && reportHistory.length > 0 ? (
              <div className="flex flex-col">
                <Table>
                  <TableCaption>List of all reports for patient {patientId || user?.id}</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Date</TableHead>
                      <TableHead>Assessment ID</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportHistory.map((report, index) => (
                      <TableRow key={index} className={index === selectedReportIndex ? "bg-orange-50" : ""}>
                        <TableCell className="font-medium">{report.timestamp || 'Unknown'}</TableCell>
                        <TableCell>{report.assessmentId || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                handleReportSelect(index);
                                setActiveTab("report");
                              }}
                            >
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownload(report.fileUrl, report.fileName)}
                            >
                              Download
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-md p-8 mb-6 bg-gray-50">
                <p className="text-center text-lg">
                  No report history found for this patient ID.
                </p>
                <p className="text-center text-gray-600 mt-2">
                  Please check if the patient ID is correct or contact support.
                </p>
              </div>
            )}
          </>
        );
      case 'annex':
        return (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Annex Report</h1>
            
            {annexReportUrl ? (
              <div className="flex flex-col">
                <div className="border border-gray-200 rounded-md mb-6 overflow-hidden bg-gray-50 h-[600px]">
                  <iframe 
                    src={annexReportUrl}
                    className="w-full h-full"
                    title="Annex Report PDF"
                    frameBorder="0"
                  ></iframe>
                </div>
                <div className="mb-4">
                  <Button 
                    variant="health" 
                    onClick={handleAnnexDownload}
                    className="flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download Annex Report
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-md p-8 mb-6 bg-gray-50">
                <p className="text-center text-lg">
                  No annex report available.
                </p>
                <p className="text-center text-gray-600 mt-2">
                  Please contact support if you believe this is an error.
                </p>
              </div>
            )}
          </>
        );
      case 'upload':
        return (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Upload Your Documents</h1>
            <PatientDetailsForm onSuccess={() => fetchReports()} />
          </>
        );
      case 'appointment':
        return (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Book an Appointment</h1>
            
            <div className="border border-gray-200 rounded-md p-8 mb-6 bg-gray-50">
              <p className="text-center text-lg">
                Schedule a follow-up assessment to track your progress
              </p>
              <p className="text-center text-gray-600 mt-2">
                Click the button below to schedule an assessment.
              </p>
              
              <div className="mt-8 text-center">
                <Button 
                  variant="health" 
                  onClick={handleBookAppointment}
                >
                  <CalendarDays className="mr-2 h-5 w-5" />
                  Request Appointment
                </Button>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your report...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 p-6 md:px-12 md:py-12">
        <SidebarProvider defaultOpen={true}>
          <div className="flex min-h-[calc(100vh-4rem)] w-full max-w-7xl mx-auto relative">
            <Sidebar className="border-r bg-white">
              <SidebarContent className="py-8">
                <div className="text-center mb-44 px-12 space-y-22">
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-2xl text-orange-600">GATOR</span>
                      <span className="bg-orange-600 text-white px-3 py-1 rounded text-xl font-bold mt-1">PRIME</span>
                    </div>
                    <p className="text-gray-700 font-medium text-sm mt-4">
                      Patient ID: {patientId || (user?.id)}
                    </p>
                  </div>
                </div>
                
                <SidebarMenu className="space-y-4 px-2">
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={activeTab === "report"}
                      onClick={() => setActiveTab("report")}
                      className="py-3"
                    >
                      <FileText className="h-5 w-5 mr-4" />
                      <span className="text-base">View My Report</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={activeTab === "annex"} 
                      onClick={() => setActiveTab("annex")}
                      className="py-3"
                    >
                      <BookOpen className="h-5 w-5 mr-4" />
                      <span className="text-base">View Annex</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={activeTab === "history"} 
                      onClick={() => setActiveTab("history")}
                      className="py-3"
                    >
                      <Clock className="h-5 w-5 mr-4" />
                      <span className="text-base">View Report History</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={activeTab === "upload"} 
                      onClick={() => setActiveTab("upload")}
                      className="py-3"
                    >
                      <Upload className="h-5 w-5 mr-4" />
                      <span className="text-base">Upload Your Documents</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={activeTab === "appointment"} 
                      onClick={() => setActiveTab("appointment")}
                      className="py-3"
                    >
                      <CalendarDays className="h-5 w-5 mr-4" />
                      <span className="text-base">Book Appointment</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>

                <div className="mt-12 px-5">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/patient-id')}
                    className="w-full mb-4"
                  >
                    Back to Patient ID
                  </Button>
                  
                  <Button 
                    variant="health" 
                    onClick={() => navigate('/dashboard')}
                    className="w-full"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </SidebarContent>
            </Sidebar>

            <div className="flex-1 overflow-hidden bg-white rounded-lg shadow-md ml-4 p-6">
              {renderContent()}
            </div>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}
