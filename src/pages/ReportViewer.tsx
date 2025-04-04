
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import { Button } from "../components/Button";
import { getPatientReport, getAnnexReport, getSupportingDocument } from "../utils/supabase";
import { toast } from "sonner";
import { CalendarDays, FileText, BookOpen, Clock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table";

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
  
  const { validateSession } = useTwilioAuthStore();
  
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const isValid = await validateSession();
        if (!isValid) {
          navigate("/login");
          return;
        }
        
        if (!patientId) {
          toast.error("No patient ID provided");
          navigate("/patient-id");
          return;
        }
        
        console.log("Fetching reports for patient ID:", patientId);
        
        const { fileUrl, fileName, allReports } = await getPatientReport(patientId);
        
        // Set the report history
        if (allReports && allReports.length > 0) {
          setReportHistory(allReports);
        }
        
        setReportUrl(fileUrl);
        setReportName(fileName);
        
        try {
          const annexData = await getAnnexReport(patientId);
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
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your report...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 md:w-64 lg:w-72">
          <div className="text-center mb-6">
            <div className="font-bold text-xl text-orange-600 flex items-center justify-center mb-2">
              <span className="mr-1">GATOR</span>
              <span className="bg-orange-600 text-white px-2 py-0.5 rounded">PRIME</span>
            </div>
            <p className="text-gray-700 font-medium">
              Patient ID: {patientId}
            </p>
          </div>

          <Tabs 
            defaultValue="report"
            orientation="vertical" 
            className="w-full"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="flex flex-col h-auto bg-gray-100 p-1 w-full">
              <TabsTrigger 
                value="report" 
                className="justify-start w-full mb-1 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700"
              >
                <FileText className="mr-2 h-5 w-5" />
                <span>View My Report</span>
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="justify-start w-full mb-1 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700"
              >
                <Clock className="mr-2 h-5 w-5" />
                <span>Report History</span>
              </TabsTrigger>
              <TabsTrigger 
                value="annex" 
                className="justify-start w-full mb-1 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                <span>View Annex Report</span>
              </TabsTrigger>
              <TabsTrigger 
                value="appointment" 
                className="justify-start w-full data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700"
              >
                <CalendarDays className="mr-2 h-5 w-5" />
                <span>Book Appointment</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/patient-id')}
              className="w-full mb-2"
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
        </div>

        <div className="flex-1 bg-white rounded-lg shadow-md p-4 md:p-8">
          <Tabs value={activeTab} className="w-full">
            <TabsContent value="report" className="mt-0">
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
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Report History</h1>
              
              {reportHistory && reportHistory.length > 0 ? (
                <div className="flex flex-col">
                  <Table>
                    <TableCaption>List of all reports for patient {patientId}</TableCaption>
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
            </TabsContent>
            
            <TabsContent value="annex" className="mt-0">
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
            </TabsContent>
            
            <TabsContent value="appointment" className="mt-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Book an Appointment</h1>
              
              <div className="border border-gray-200 rounded-md p-8 mb-6 bg-gray-50">
                <p className="text-center text-lg">
                  Ready to discuss your GATOR PRIME report with a specialist?
                </p>
                <p className="text-center text-gray-600 mt-2">
                  Click the button below to schedule a consultation with our medical team.
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
