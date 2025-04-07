
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, Users, UserRoundPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../utils/supabase";
import { getPatientReport } from "../utils/supabase";

export default function Dashboard() {
  const { user, logout, isLoading } = useTwilioAuthStore();
  const [pageLoading, setPageLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [patientId, setPatientId] = useState<string | null>(null);
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
        // For admin users, we don't need to fetch a specific patient ID
        if (isAdmin) {
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

      <main className="flex-grow py-12 pt-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 sm:p-8 bg-orange-50 border-b border-orange-100">
                <h1 className="text-2xl font-bold text-gray-900">
                  {isAdmin ? "Administrator Dashboard" : "Your GATOR PRIME Report"}
                </h1>
                <p className="mt-2 text-gray-600">
                  {isAdmin 
                    ? "Manage patients, reports, and user accounts" 
                    : "Welcome to your personalized knee health dashboard."}
                </p>
              </div>

              <div className="p-6 sm:p-8">
                <Tabs defaultValue={isAdmin ? "admin" : "report"} className="w-full">
                  <TabsList className="mb-6">
                    {!isAdmin && (
                      <>
                        <TabsTrigger value="report" className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          View Report
                        </TabsTrigger>
                        <TabsTrigger value="appointment" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Book an Appointment
                        </TabsTrigger>
                      </>
                    )}
                    
                    {isAdmin && (
                      <>
                        <TabsTrigger value="admin" className="flex items-center gap-2">
                          <UserRoundPlus className="h-4 w-4" />
                          Admin Tools
                        </TabsTrigger>
                        <TabsTrigger value="appointment" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Appointments
                        </TabsTrigger>
                      </>
                    )}
                  </TabsList>
                  
                  {!isAdmin && (
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
                  )}
                  
                  {/* Admin Tools Tab */}
                  {isAdmin && (
                    <TabsContent value="admin">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center mb-4">
                            <UserRoundPlus className="h-6 w-6 text-health-600 mr-2" />
                            <h3 className="text-lg font-medium">Patient Registration</h3>
                          </div>
                          <p className="text-gray-600 mb-4">
                            Register new patients in the system and manage their information.
                          </p>
                          <Button
                            variant="health"
                            onClick={handleNavigateToManagePatients}
                            className="w-full"
                          >
                            Manage Patients
                          </Button>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center mb-4">
                            <FileText className="h-6 w-6 text-health-600 mr-2" />
                            <h3 className="text-lg font-medium">Reports</h3>
                          </div>
                          <p className="text-gray-600 mb-4">
                            View and manage all patient reports in the system.
                          </p>
                          <Button
                            variant="health"
                            onClick={handleNavigateToAllReports}
                            className="w-full"
                          >
                            View All Reports
                          </Button>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center mb-4">
                            <Users className="h-6 w-6 text-health-600 mr-2" />
                            <h3 className="text-lg font-medium">User Management</h3>
                          </div>
                          <p className="text-gray-600 mb-4">
                            Manage user accounts, permissions, and access control.
                          </p>
                          <Button
                            variant="health"
                            onClick={handleNavigateToManageUsers}
                            className="w-full"
                          >
                            Manage Users
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  )}
                  
                  <TabsContent value="appointment">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule an Appointment</h3>
                      <p className="text-gray-600 mb-6">
                        {isAdmin
                          ? "Manage and view upcoming appointments from patients."
                          : "Book a consultation with one of our knee health specialists to discuss your GATOR PRIME report results."
                        }
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
                          {isAdmin ? "View Appointment Calendar" : "Check Available Times"}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
