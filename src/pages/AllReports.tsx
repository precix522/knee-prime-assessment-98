import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import { FileText, Download, Eye, Search, Filter, ArrowUpDown } from "lucide-react";
import { Button } from "../components/Button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "../utils/supabase";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table";

type Report = {
  patientId: string;
  patientName: string;
  timestamp: string;
  fileName: string;
  fileUrl: string;
  assessmentId?: string;
};

export default function AllReports() {
  const { user, isLoading } = useTwilioAuthStore();
  const [pageLoading, setPageLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!user) {
          navigate("/login");
          return;
        }
        
        if (user.profile_type !== 'admin') {
          toast.error("You don't have permission to access this page");
          navigate("/dashboard");
          return;
        }
        
        await fetchPatientReports();
      } catch (error) {
        console.error("Error checking authentication:", error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [user, navigate]);

  const fetchPatientReports = async () => {
    try {
      setPageLoading(true);
      
      const { data, error } = await supabase
        .from('patient')
        .select('Patient_ID, patient_name, report_url, last_modified_tm, assessment_id')
        .order('last_modified_tm', { ascending: false });
      
      if (error) {
        console.error("Error fetching patient reports:", error);
        toast.error("Failed to load patient reports");
        setPageLoading(false);
        return;
      }
      
      const transformedReports: Report[] = data.map(patient => {
        let reportUrl = patient.report_url || "";
        if (reportUrl.includes(',')) {
          reportUrl = reportUrl.split(',')[0].trim();
        }
        
        const fileName = reportUrl ? reportUrl.split('/').pop() || 'report.pdf' : 'report.pdf';
        
        let formattedTimestamp = '';
        if (patient.last_modified_tm) {
          try {
            if (typeof patient.last_modified_tm === 'string') {
              formattedTimestamp = patient.last_modified_tm;
            } else {
              const date = new Date(patient.last_modified_tm);
              formattedTimestamp = date.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
              });
            }
          } catch (e) {
            formattedTimestamp = String(patient.last_modified_tm || '');
          }
        }
        
        return {
          patientId: patient.Patient_ID || '',
          patientName: patient.patient_name || 'Unknown',
          timestamp: formattedTimestamp,
          fileName: fileName,
          fileUrl: reportUrl || '#',
          assessmentId: patient.assessment_id || undefined
        };
      });
      
      setReports(transformedReports);
      setPageLoading(false);
      
      if (transformedReports.length === 0) {
        toast.info("No patient reports found in the database");
      } else {
        toast.success(`Loaded ${transformedReports.length} patient reports`);
      }
    } catch (error) {
      console.error("Error in fetchPatientReports:", error);
      toast.error("An error occurred while loading reports");
      setPageLoading(false);
    }
  };

  const filteredReports = reports
    .filter(report => 
      report.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.timestamp.includes(searchQuery) ||
      (report.assessmentId && report.assessmentId.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      const fieldA = a[sortField as keyof Report] as string;
      const fieldB = b[sortField as keyof Report] as string;
      
      if (sortDirection === "asc") {
        return fieldA.localeCompare(fieldB);
      } else {
        return fieldB.localeCompare(fieldA);
      }
    });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleRefresh = () => {
    fetchPatientReports();
  };

  if (pageLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  const handleViewReport = (patientId: string) => {
    navigate(`/report-viewer?patientId=${encodeURIComponent(patientId)}`);
  };

  const handleDownloadReport = (fileUrl: string, fileName: string) => {
    if (fileUrl && fileUrl !== '#') {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName || 'patient-report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloading ${fileName}`);
    } else {
      toast.error("No report file available to download");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow pt-24 pb-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h1 className="text-2xl font-bold text-white flex items-center">
                    <FileText className="h-6 w-6 mr-2 text-white" />
                    All Patient Reports
                  </h1>
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary"
                      onClick={handleRefresh}
                      className="bg-white text-orange-600 hover:bg-orange-50"
                    >
                      Refresh
                    </Button>
                    <Button 
                      variant="secondary"
                      onClick={() => navigate('/dashboard')}
                      className="bg-white text-orange-600 hover:bg-orange-50"
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Search by patient ID, name, date..."
                      className="pl-10 pr-4 py-2 w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => handleSort("timestamp")}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                      {sortDirection === "asc" ? "Oldest First" : "Newest First"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {filteredReports.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableCaption>All patient reports in the system</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50" 
                            onClick={() => handleSort("patientId")}
                          >
                            <div className="flex items-center">
                              Patient ID
                              {sortField === "patientId" && (
                                <ArrowUpDown className="ml-1 h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50" 
                            onClick={() => handleSort("patientName")}
                          >
                            <div className="flex items-center">
                              Name
                              {sortField === "patientName" && (
                                <ArrowUpDown className="ml-1 h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50" 
                            onClick={() => handleSort("timestamp")}
                          >
                            <div className="flex items-center">
                              Date
                              {sortField === "timestamp" && (
                                <ArrowUpDown className="ml-1 h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead>Assessment ID</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReports.map((report, index) => (
                          <TableRow key={index} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{report.patientId}</TableCell>
                            <TableCell>{report.patientName}</TableCell>
                            <TableCell>{report.timestamp}</TableCell>
                            <TableCell>{report.assessmentId || 'N/A'}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewReport(report.patientId)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button
                                  variant="health"
                                  size="sm"
                                  onClick={() => handleDownloadReport(report.fileUrl, report.fileName)}
                                  disabled={!report.fileUrl || report.fileUrl === '#'}
                                >
                                  <Download className="h-4 w-4 mr-1" />
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
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h3>
                    <p className="text-gray-500">
                      {searchQuery ? "No reports match your search criteria." : "There are no patient reports in the system yet."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
