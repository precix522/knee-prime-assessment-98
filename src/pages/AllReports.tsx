
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import { FileText, Download, Eye } from "lucide-react";
import { Button } from "../components/Button";
import { toast } from "sonner";
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
  timestamp: string;
  fileName: string;
  fileUrl: string;
};

export default function AllReports() {
  const { user, isLoading } = useTwilioAuthStore();
  const [pageLoading, setPageLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
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
        
        // In a real implementation, we would fetch reports from Supabase here
        // For now, let's use dummy data
        const dummyReports: Report[] = [
          {
            patientId: "PAT12345",
            timestamp: "2023-04-07",
            fileName: "report-12345.pdf",
            fileUrl: "#"
          },
          {
            patientId: "PAT67890",
            timestamp: "2023-04-06",
            fileName: "report-67890.pdf",
            fileUrl: "#"
          },
          {
            patientId: "PAT54321",
            timestamp: "2023-04-05",
            fileName: "report-54321.pdf",
            fileUrl: "#"
          }
        ];
        
        setReports(dummyReports);
        setPageLoading(false);
      } catch (error) {
        console.error("Error checking authentication:", error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [user, navigate]);

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
    toast.info("Download feature will be implemented in the future");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FileText className="h-6 w-6 mr-2 text-health-600" />
                All Patient Reports
              </h1>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                {reports.length > 0 ? (
                  <Table>
                    <TableCaption>All patient reports in the system</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Filename</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{report.patientId}</TableCell>
                          <TableCell>{report.timestamp}</TableCell>
                          <TableCell>{report.fileName}</TableCell>
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
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h3>
                    <p className="text-gray-500">There are no patient reports in the system yet.</p>
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
