import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import { Button } from "../components/Button";
import { getPatientReport, getAnnexReport, getSupportingDocument } from "../utils/supabase";
import { toast } from "sonner";
import { CalendarDays, FileText, BookOpen, Clock, Upload } from "lucide-react";
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
import Navbar from "../components/Navbar";
import PatientDetailsForm from "../components/PatientDetailsForm";

type PatientReport = {
  fileUrl: string;
  fileName: string;
  timestamp: string;
  assessmentId?: number;
  xrayReportUrl?: string | null;
  mriReportUrl?: string | null;
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
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

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
  
  useEffect(() => {
    if (activeTab !== "upload" && uploadSuccessMessage) {
      setUploadSuccessMessage(null);
    }
  }, [activeTab]);  

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
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your report...</p>
          </div>
        </div>
      </div>
    );
  }
  
  const getXrayMriRows = () => {
    if (!reportHistory || reportHistory.length === 0) return [];

    const rows: {
      type: string;
      url: string;
      fileName: string;
      timestamp: string;
      assessmentId?: number;
    }[] = [];

    reportHistory.forEach((report) => {
      if (report.xrayReportUrl && typeof report.xrayReportUrl === "string" && report.xrayReportUrl.trim() !== "") {
        const xrayFileName = report.xrayReportUrl.split("/").pop() || "xray-report.pdf";
        rows.push({
          type: "X-ray",
          url: report.xrayReportUrl,
          fileName: xrayFileName,
          timestamp: report.timestamp || "Unknown",
          assessmentId: report.assessmentId,
        });
      }
      if (report.mriReportUrl && typeof report.mriReportUrl === "string" && report.mriReportUrl.trim() !== "") {
        const mriFileName = report.mriReportUrl.split("/").pop() || "mri-report.pdf";
        rows.push({
          type: "MRI",
          url: report.mriReportUrl,
          fileName: mriFileName,
          timestamp: report.timestamp || "Unknown",
          assessmentId: report.assessmentId,
        });
      }
    });

    return rows;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 p-4 md:p-6 pt-36">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 md:w-80 space-y-4">
            <div className="text-center pb-5 border-b border-gray-200">
              <div className="mb-4 flex items-center justify-center space-x-1 pt-4">
                <span className="text-2xl font-bold text-gray-900 whitespace-nowrap">GATOR</span>
                <span className="bg-orange-600 text-white px-2 py-0.5 rounded text-base whitespace-nowrap">PRIME</span>
              </div>
              <p className="text-gray-600 text-sm mt-2 truncate">
                Patient ID: {patientId || (user?.id)}
              </p>
            </div>

            <Tabs 
              defaultValue="report"
              orientation="vertical" 
              className="w-full mt-8"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="flex flex-col h-auto bg-transparent space-y-3 w-full">
                <TabsTrigger 
                  value="report" 
                  className="justify-start w-full px-4 py-3 text-gray-700 hover:bg-gray-50 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 rounded-md"
                >
                  <FileText className="mr-3 h-5 w-5 shrink-0" />
                  <span className="font-medium whitespace-nowrap">View My Report</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="annex" 
                  className="justify-start w-full px-4 py-3 text-gray-700 hover:bg-gray-50 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 rounded-md"
                >
                  <BookOpen className="mr-3 h-5 w-5 shrink-0" />
                  <span className="font-medium whitespace-nowrap">View Annex</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="justify-start w-full px-4 py-3 text-gray-700 hover:bg-gray-50 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 rounded-md"
                >
                  <Clock className="mr-3 h-5 w-5 shrink-0" />
                  <span className="font-medium whitespace-nowrap">View Report History</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="upload" 
                  className="justify-start w-full px-4 py-3 text-gray-700 hover:bg-gray-50 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 rounded-md"
                >
                  <Upload className="mr-3 h-5 w-5 shrink-0" />
                  <span className="font-medium whitespace-nowrap">Upload Your Documents</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="appointment" 
                  className="justify-start w-full px-4 py-3 text-gray-700 hover:bg-gray-50 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 rounded-md"
                >
                  <CalendarDays className="mr-3 h-5 w-5 shrink-0" />
                  <span className="font-medium whitespace-nowrap">Book Appointment</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-3 pt-6 mt-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={() => navigate('/patient-id')}
                className="w-full justify-start text-gray-700 border-gray-300 h-10"
              >
                Back to Patient ID
              </Button>
              
              <Button 
                variant="health" 
                onClick={() => navigate('/dashboard')}
                className="w-full justify-start bg-orange-600 hover:bg-orange-700 h-10"
              >
                Go to Dashboard
              </Button>
            </div>

            <div className="pt-6 mt-2 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-semibold block mb-3">Contact</span>
                2 College Road #02-00,<br />
                Singapore 169850<br />
                <span className="mt-3 block">Email: info@precix.io</span>
              </p>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-lg shadow-md border border-gray-200 p-8">
            <Tabs value={activeTab} className="w-full">
              <TabsContent value="report" className="mt-0">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Patient Report</h1>
                
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
                    <div className="border border-gray-300 rounded-md mb-6 overflow-hidden bg-gray-50 h-[700px] shadow-sm">
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
                    <div className="border border-gray-300 rounded-md p-8 mb-6 bg-gray-50 shadow-sm">
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
              
              <TabsContent value="annex" className="mt-0">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Annex Report</h1>
                
                {annexReportUrl ? (
                  <div className="flex flex-col">
                    <div className="border border-gray-300 rounded-md mb-6 overflow-hidden bg-gray-50 h-[650px] shadow-sm">
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
                  <div className="border border-gray-300 rounded-md p-8 mb-6 bg-gray-50 shadow-sm">
                    <p className="text-center text-lg">
                      No annex report available.
                    </p>
                    <p className="text-center text-gray-600 mt-2">
                      Please contact support if you believe this is an error.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="history" className="mt-0">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Report History</h1>
                
                {reportHistory && reportHistory.length > 0 ? (
                  <div className="flex flex-col">
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
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
                    <div className="mt-8">
                      <h2 className="text-xl font-semibold text-gray-800 mb-3">Your X-ray & MRI Report History</h2>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <Table>
                          <TableCaption>
                            All historical uploaded X-ray and MRI documents for patient {patientId || user?.id}
                          </TableCaption>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead>Report Date</TableHead>
                              <TableHead>File</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(() => {
                              const rows = getXrayMriRows();
                              if (!rows.length) {
                                return (
                                  <TableRow>
                                    <TableCell colSpan={4} className="text-center text-gray-500">
                                      No X-ray or MRI report history found.
                                    </TableCell>
                                  </TableRow>
                                );
                              }
                              return rows.map((row, idx) => (
                                <TableRow key={`${row.type}-${idx}`}>
                                  <TableCell>{row.type}</TableCell>
                                  <TableCell>{row.timestamp}</TableCell>
                                  <TableCell>
                                    <span className="text-sm text-gray-700 break-all">
                                      {row.fileName}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDownload(row.url, row.fileName)}
                                    >
                                      Download
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ));
                            })()}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-md p-8 mb-6 bg-gray-50 shadow-sm">
                    <p className="text-center text-lg">
                      No report history found for this patient ID.
                    </p>
                    <p className="text-center text-gray-600 mt-2">
                      Please check if the patient ID is correct or contact support.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="upload" className="mt-0">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Upload Your Documents</h1>
                {uploadSuccessMessage && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-800 text-center">
                    {uploadSuccessMessage}
                  </div>
                )}
                <div className="border border-gray-200 rounded-lg p-6">
                  <PatientDetailsForm
                    onSuccess={() => {
                      setUploadSuccessMessage("Your medical images/documents have been uploaded successfully!");
                      fetchReports();
                    }}
                  />
                </div>
                {reportHistory && reportHistory.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">Your X-ray & MRI Report History</h2>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <Table>
                        <TableCaption>
                          All historical uploaded X-ray and MRI documents for patient {patientId || user?.id}
                        </TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Report Date</TableHead>
                            <TableHead>File</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(() => {
                            const rows = getXrayMriRows();
                            if (!rows.length) {
                              return (
                                <TableRow>
                                  <TableCell colSpan={4} className="text-center text-gray-500">
                                    No X-ray or MRI report history found.
                                  </TableCell>
                                </TableRow>
                              );
                            }
                            return rows.map((row, idx) => (
                              <TableRow key={`${row.type}-${idx}`}>
                                <TableCell>{row.type}</TableCell>
                                <TableCell>{row.timestamp}</TableCell>
                                <TableCell>
                                  <span className="text-sm text-gray-700 break-all">
                                    {row.fileName}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownload(row.url, row.fileName)}
                                  >
                                    Download
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ));
                          })()}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="appointment" className="mt-0">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Book an Appointment</h1>
                
                <div className="border border-gray-300 rounded-md p-8 mb-6 bg-gray-50 shadow-sm">
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
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
