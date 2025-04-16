
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import PatientRecordForm from "../components/PatientRecordForm";
import { Navbar } from "../components/Navbar";
import Footer from "../components/Footer";
import { ArrowLeft, Search, ShieldAlert, User, UserPlus } from "lucide-react";
import { Button } from "../components/ui/button";
import { supabase } from "../utils/supabase";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Interface for patient data
interface Patient {
  Patient_ID: string;
  patient_name: string;
  phone: string;
  last_modified_tm: string;
  report_url?: string;
}

export default function ManagePatients() {
  const navigate = useNavigate();
  const { user, validateSession } = useTwilioAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  
  // Check admin authorization and redirect if not authorized
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const isValid = await validateSession();
        
        if (!isValid) {
          // Not logged in, redirect to login
          navigate("/general-login");
          return;
        }
        
        // Check if user is admin
        if (user?.profile_type === 'admin') {
          setIsAuthorized(true);
        } else {
          // Not admin, redirect to home
          navigate("/");
        }
      } catch (err) {
        console.error("Session validation error:", err);
        navigate("/general-login");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, validateSession, user]);
  
  // Fetch patients from database
  useEffect(() => {
    if (isAuthorized) {
      fetchPatients();
    }
  }, [isAuthorized]);
  
  const fetchPatients = async () => {
    setIsLoadingPatients(true);
    try {
      const { data, error } = await supabase
        .from('patient')
        .select('*')
        .order('last_modified_tm', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      console.log("Fetched patients:", data);
      setPatients(data as Patient[]);
    } catch (err) {
      console.error("Error fetching patients:", err);
      toast.error("Failed to load patients");
    } finally {
      setIsLoadingPatients(false);
    }
  };
  
  // Filter patients based on search query
  const filteredPatients = patients.filter(patient => {
    const query = searchQuery.toLowerCase();
    return (
      patient.patient_name?.toLowerCase().includes(query) ||
      patient.Patient_ID?.toLowerCase().includes(query) ||
      patient.phone?.toLowerCase().includes(query)
    );
  });
  
  // Navigate to patient report viewer
  const viewPatientReport = (patientId: string) => {
    navigate(`/report-viewer?patientId=${patientId}`);
  };
  
  // Show loading state while checking authorization
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking permissions...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  // Show unauthorized message if not admin
  if (!isAuthorized) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <ShieldAlert className="h-16 w-16 text-health-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page. Only administrators can add new patients.
            </p>
            <Button onClick={() => navigate('/')} variant="health">
              Back to Home
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  // Admin view
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Manage Patients
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              View, add and manage patient records
            </p>
            <div className="inline-flex items-center justify-center mt-2 px-3 py-1 bg-health-100 text-health-700 rounded-full text-sm">
              <span className="font-medium">Admin Access</span>
            </div>
          </div>
          
          <div className="mt-8">
            <Tabs defaultValue="patients" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="patients">
                  <User className="mr-2 h-4 w-4" />
                  Patient List
                </TabsTrigger>
                <TabsTrigger value="add-patient">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Patient
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="patients" className="mt-6">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-4 border-b">
                    <div className="flex items-center">
                      <Search className="h-5 w-5 text-gray-400 mr-2" />
                      <Input
                        placeholder="Search patients by name, ID or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-md"
                      />
                    </div>
                  </div>
                  
                  {isLoadingPatients ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading patients...</p>
                    </div>
                  ) : filteredPatients.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-600">No patients found. Add a new patient to get started.</p>
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
                          {filteredPatients.map((patient) => (
                            <TableRow key={patient.Patient_ID}>
                              <TableCell className="font-medium">{patient.Patient_ID}</TableCell>
                              <TableCell>{patient.patient_name || "Not specified"}</TableCell>
                              <TableCell>{patient.phone || "Not specified"}</TableCell>
                              <TableCell>
                                {patient.last_modified_tm
                                  ? new Date(patient.last_modified_tm).toLocaleString()
                                  : "Not specified"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => viewPatientReport(patient.Patient_ID)}
                                  disabled={!patient.report_url}
                                >
                                  View Report
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="add-patient" className="mt-6">
                <div className="flex justify-center">
                  <PatientRecordForm onSuccess={fetchPatients} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="mt-6 text-center">
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
