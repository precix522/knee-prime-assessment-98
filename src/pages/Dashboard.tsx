import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  FileText, 
  Users, 
  UserRoundPlus, 
  BarChart3, 
  Search,
  ChevronRight 
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../utils/supabase";
import { getPatientReport } from "../utils/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Interface for patient data from Supabase
interface PatientData {
  id: string;
  Patient_ID: string;
  patient_name: string;
  phone: string;
  report_url?: string;
  last_modified_tm?: string;
}

export default function Dashboard() {
  
  const { user, logout, isLoading } = useTwilioAuthStore();
  const [pageLoading, setPageLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [patientId, setPatientId] = useState<string | null>(null);
  const [recentReports, setRecentReports] = useState<PatientData[]>([]);
  const [recentPatients, setRecentPatients] = useState<PatientData[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const navigate = useNavigate();
  
  // Check if user is an admin
  const isAdmin = user?.profile_type === 'admin';

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!user) {
          navigate("/login");
        }
        setPageLoading(false);
      } catch (error) {
        console.error("Error checking authentication:", error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [user, navigate]);

  useEffect(() => {
    if (!pageLoading && !isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, pageLoading, navigate]);

  // Effect to fetch patient data from Supabase based on phone number
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!user?.phone) return;
      
      try {
        // For admin users, we fetch recent reports and patients from Supabase
        if (isAdmin) {
          try {
            setTableLoading(true);
            
            // Fetch recent reports (ordered by last_modified_tm)
            const { data: reportData, error: reportError } = await supabase
              .from('patient')
              .select('*')
              .order('last_modified_tm', { ascending: false })
              .limit(10);
              
            if (reportError) {
              console.error("Error fetching recent reports:", reportError);
              toast.error("Failed to load recent reports");
            } else if (reportData) {
              setRecentReports(reportData);
            }
            
            // Fetch recent patients (showing unique patients ordered by last_modified_tm)
            const { data: patientData, error: patientError } = await supabase
              .from('patient')
              .select('*')
              .order('last_modified_tm', { ascending: false })
              .limit(10);
              
            if (patientError) {
              console.error("Error fetching recent patients:", patientError);
              toast.error("Failed to load recent patients");
            } else if (patientData) {
              // Create a Map to store unique patients by Patient_ID
              const uniquePatients = new Map();
              
              patientData.forEach(patient => {
                if (!uniquePatients.has(patient.Patient_ID)) {
                  uniquePatients.set(patient.Patient_ID, patient);
                }
              });
              
              // Convert Map values to array and set state
              setRecentPatients(Array.from(uniquePatients.values()));
            }
            
          } catch (error) {
            console.error("Error fetching admin dashboard data:", error);
            toast.error("Failed to load dashboard data");
          } finally {
            setTableLoading(false);
          }
          return;
        }
        
        // Format the phone number to match Supabase (remove '+')
        const formattedPhone = user.phone.replace('+', '');
        
        // Query Supabase for patient data with matching phone number
        const { data, error } = await supabase
          .from('patient')
          .select('Patient_ID')
          .eq('phone', formattedPhone)
          .order('last_modified_tm', { ascending: false })
          .limit(1);
          
        if (error) {
          console.error("Error fetching patient data:", error);
          return;
        }
        
        if (data && data.length > 0) {
          setPatientId(data[0].Patient_ID);
        } else {
          // Try again with the formatted phone number that includes '+'
          const { data: dataWithPlus, error: errorWithPlus } = await supabase
            .from('patient')
            .select('Patient_ID')
            .eq('phone', user.phone)
            .order('last_modified_tm', { ascending: false })
            .limit(1);
            
          if (errorWithPlus) {
            console.error("Error fetching patient data with + prefix:", errorWithPlus);
            return;
          }
          
          if (dataWithPlus && dataWithPlus.length > 0) {
            setPatientId(dataWithPlus[0].Patient_ID);
          } else {
            console.log("No patient record found for this user");
          }
        }
      } catch (error) {
        console.error("Error in fetchPatientData:", error);
      }
    };
    
    if (user) {
      fetchPatientData();
    }
  }, [user, isAdmin]);

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    
    try {
      // Check if dateString is already in MM/DD/YYYY, hh:mm:ss AM/PM format
      if (dateString.includes('/') && (dateString.includes('AM') || dateString.includes('PM'))) {
        return dateString;
      }
      
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      }) + ' ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Count reports for a patient
  const getReportCount = (patientId: string) => {
    return recentReports.filter(report => report.Patient_ID === patientId).length;
  };

  const handleDownloadReport = async () => {
    if (!patientId && !isAdmin) {
      setDownloadError("Patient record not found");
      toast.error("Patient record not found. Please contact support.");
      return;
    }

    try {
      setDownloadLoading(true);
      setDownloadError("");

      // Fetch the report URL from Supabase
      const reportData = await getPatientReport(patientId || "");
      
      if (!reportData || !reportData.fileUrl) {
        throw new Error("Report not found");
      }

      // Create a temporary anchor element to trigger the download
      const link = document.createElement('a');
      link.href = reportData.fileUrl;
      link.setAttribute('download', reportData.fileName || 'patient-report.pdf');
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Your report has been downloaded");
      
      // Optional: Navigate to thank you page after successful download
      setTimeout(() => {
        navigate("/thank-you");
      }, 1000);
      
    } catch (error) {
      console.error("Error downloading report:", error);
      setDownloadError(
        error instanceof Error ? error.message : "Failed to download report"
      );
      toast.error("Failed to download report. Please try again later.");
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleViewReport = () => {
    if (!patientId && !isAdmin) {
      toast.error("Patient record not found. Please contact support.");
      return;
    }
    
    navigate(`/report-viewer?patientId=${encodeURIComponent(patientId || "")}`);
  };
  
  const handleNavigateToAllReports = () => {
    navigate("/all-reports");
  };
  
  const handleNavigateToManageUsers = () => {
    navigate("/manage-users");
  };
  
  const handleNavigateToManagePatients = () => {
    navigate("/manage-patients");
  };
  
  const handleViewSpecificReport = (patientId: string) => {
    navigate(`/report-viewer?patientId=${encodeURIComponent(patientId)}`);
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow py-12 pt-24 bg-gray-50">
        <div className="container mx-auto px-4">
          {isAdmin ? (
            // ADMIN DASHBOARD
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col gap-8">
                {/* Admin Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2">
                        Administrator Dashboard
                      </h1>
                      <p className="text-orange-100 max-w-xl">
                        Welcome back, Admin. Manage reports, patients, and user accounts from this central dashboard.
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant="secondary"
                          size="default"
                          onClick={handleNavigateToAllReports}
                          className="bg-white text-orange-600 hover:bg-orange-50"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          View All Reports
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin Dashboard Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Patients</h3>
                        <div className="p-2 bg-blue-50 rounded-full">
                          <Users className="h-6 w-6 text-blue-500" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold">{recentPatients.length}</p>
                      <p className="text-gray-500 text-sm mt-1">Recently active</p>
                      <Button
                        variant="link"
                        className="mt-4 p-0 h-auto text-blue-600"
                        onClick={handleNavigateToManagePatients}
                      >
                        Manage Patients <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Reports</h3>
                        <div className="p-2 bg-green-50 rounded-full">
                          <FileText className="h-6 w-6 text-green-500" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold">{recentReports.length}</p>
                      <p className="text-gray-500 text-sm mt-1">Total reports</p>
                      <Button
                        variant="link"
                        className="mt-4 p-0 h-auto text-green-600"
                        onClick={handleNavigateToAllReports}
                      >
                        View All Reports <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                        <div className="p-2 bg-purple-50 rounded-full">
                          <Users className="h-6 w-6 text-purple-500" />
                        </div>
                      </div>
                      <p className="text-gray-500 text-sm mt-1">Manage system users</p>
                      <Button
                        variant="link"
                        className="mt-4 p-0 h-auto text-purple-600"
                        onClick={handleNavigateToManageUsers}
                      >
                        Manage Users <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Recent Reports Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Recent Reports</h2>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="text"
                          placeholder="Search reports..."
                          className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-health-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    {tableLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Patient ID</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {recentReports.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                                  No reports found
                                </TableCell>
                              </TableRow>
                            ) : (
                              recentReports.map((report, index) => (
                                <TableRow key={index} className="hover:bg-gray-50">
                                  <TableCell className="font-medium">{report.Patient_ID}</TableCell>
                                  <TableCell>{report.patient_name || 'N/A'}</TableCell>
                                  <TableCell>{formatDate(report.last_modified_tm)}</TableCell>
                                  <TableCell>
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      {report.report_url ? 'completed' : 'pending'}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleViewSpecificReport(report.Patient_ID)}
                                      disabled={!report.report_url}
                                    >
                                      <FileText className="h-4 w-4 mr-1" />
                                      View
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                    
                    <div className="mt-6 text-center">
                      <Button
                        variant="outline"
                        onClick={handleNavigateToAllReports}
                      >
                        View All Reports
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Recent Patients */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Recent Patients</h2>
                    </div>
                    
                    {tableLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Patient ID</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Phone</TableHead>
                              <TableHead>Last Modified</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {recentPatients.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                                  No patients found
                                </TableCell>
                              </TableRow>
                            ) : (
                              recentPatients.map((patient, index) => (
                                <TableRow key={index} className="hover:bg-gray-50">
                                  <TableCell className="font-medium">{patient.Patient_ID}</TableCell>
                                  <TableCell>{patient.patient_name || 'N/A'}</TableCell>
                                  <TableCell>{patient.phone || 'N/A'}</TableCell>
                                  <TableCell>{formatDate(patient.last_modified_tm)}</TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleViewSpecificReport(patient.Patient_ID)}
                                    >
                                      <FileText className="h-4 w-4 mr-1" />
                                      Reports
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                    
                    <div className="mt-6 text-center">
                      <Button
                        variant="outline"
                        onClick={handleNavigateToManagePatients}
                      >
                        Manage All Patients
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // REGULAR USER DASHBOARD
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 sm:p-8 bg-orange-50 border-b border-orange-100">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Your GATOR PRIME Report
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Welcome to your personalized knee health dashboard.
                  </p>
                </div>

                <div className="p-6 sm:p-8">
                  <Tabs defaultValue="report" className="w-full">
                    <TabsList className="mb-6">
                      <TabsTrigger value="report" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        View Report
                      </TabsTrigger>
                      <TabsTrigger value="appointment" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Book an Appointment
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="report">
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <Button
                            variant="health"
                            size="default"
                            onClick={handleDownloadReport}
                            disabled={downloadLoading || !patientId}
                          >
                            {downloadLoading ? (
                              <>
                                <span className="mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Generating PDF...
                              </>
                            ) : (
                              "Download Full Report (PDF)"
                            )}
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="default"
                            onClick={handleViewReport}
                            disabled={!patientId}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            View Report Online
                          </Button>
                        </div>

                        {!patientId && (
                          <div className="text-amber-500 text-sm mt-2">
                            No patient record found. Please contact support to link your account.
                          </div>
                        )}

                        {downloadError && (
                          <div className="text-red-500 text-sm mt-2">
                            Error: {downloadError}. Please try again.
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="appointment">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule an Appointment</h3>
                        <p className="text-gray-600 mb-6">
                          Book a consultation with one of our knee health specialists to discuss your GATOR PRIME report results.
                        </p>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border border-gray-200 rounded-md bg-white hover:shadow-md transition-shadow">
                              <h4 className="font-medium text-health-600">Virtual Consultation</h4>
                              <p className="text-sm text-gray-500 mt-1">
                                30-minute video call with a specialist
                              </p>
                            </div>
                            <div className="p-4 border border-gray-200 rounded-md bg-white hover:shadow-md transition-shadow">
                              <h4 className="font-medium text-health-600">In-Person Visit</h4>
                              <p className="text-sm text-gray-500 mt-1">
                                Meet face-to-face at one of our clinics
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="health"
                            size="default"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            Check Available Times
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
