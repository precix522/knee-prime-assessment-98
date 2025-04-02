
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText } from "lucide-react";
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

  // New effect to fetch patient data from Supabase based on phone number
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!user?.phone) return;
      
      try {
        // Query Supabase for patient data with matching phone number
        const { data, error } = await supabase
          .from('patient')
          .select('Patient_ID')
          .eq('phone', user.phone)
          .single();
          
        if (error) {
          console.error("Error fetching patient data:", error);
          return;
        }
        
        if (data) {
          setPatientId(data.Patient_ID);
        } else {
          console.log("No patient record found for this user");
        }
      } catch (error) {
        console.error("Error in fetchPatientData:", error);
      }
    };
    
    if (user) {
      fetchPatientData();
    }
  }, [user]);

  const handleDownloadReport = async () => {
    if (!patientId) {
      setDownloadError("Patient record not found");
      toast.error("Patient record not found. Please contact support.");
      return;
    }

    try {
      setDownloadLoading(true);
      setDownloadError("");

      // Fetch the report URL from Supabase
      const reportData = await getPatientReport(patientId);
      
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
    if (!patientId) {
      toast.error("Patient record not found. Please contact support.");
      return;
    }
    
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

      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
