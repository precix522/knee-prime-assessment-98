
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTwilioAuthStore } from "@/utils/auth";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/Button";
import { Clipboard, FileClock, FileStack, FileText } from "lucide-react";

export default function PatientDashboard() {
  const { user, validateSession } = useTwilioAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isValid = await validateSession();
        if (!isValid) {
          toast.error("Session expired. Please log in again.");
          navigate("/general-login", { replace: true });
          return;
        }
        
        // Verify user is patient type
        const profileType = user?.profile_type || localStorage.getItem('userProfileType');
        if (profileType !== 'patient') {
          toast.error("Unauthorized. Redirecting to appropriate dashboard.");
          if (profileType === 'admin') {
            navigate("/dashboard", { replace: true }); // Changed from '/admin-dashboard' to '/dashboard'
          } else {
            navigate("/dashboard", { replace: true });
          }
          return;
        }
        
        // Since we want patients to use report-viewer now, redirect there
        toast.info("Redirecting to reports viewer...");
        navigate("/report-viewer", { replace: true });
        return;
        
        // Note: The code below won't execute due to the redirect above
        setIsLoading(false);
      } catch (err) {
        console.error("Session validation error:", err);
        toast.error("Authentication error. Please log in again.");
        navigate("/general-login", { replace: true });
      }
    };
    
    checkAuth();
  }, [navigate, validateSession, user]);

  const handleViewReports = () => {
    navigate("/report-viewer");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back{user?.name ? `, ${user.name}` : ''}! Access your health reports and information.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <FileText className="mr-2 text-orange-500" size={20} />
                Your Reports
              </CardTitle>
              <CardDescription>
                View your PRIME assessment reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-600">
                Access your latest health assessment reports and view your progress over time.
              </p>
              <Button variant="health" className="w-full" onClick={handleViewReports}>
                View Reports
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <FileClock className="mr-2 text-orange-500" size={20} />
                History
              </CardTitle>
              <CardDescription>
                View your historical data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-600">
                Track your health progress over time with historical data and trend analysis.
              </p>
              <Button variant="outline" className="w-full border-health-500 text-health-600">
                Coming Soon
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <Clipboard className="mr-2 text-orange-500" size={20} />
                Patient ID
              </CardTitle>
              <CardDescription>
                Access your patient ID
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-600">
                Your patient ID is needed to access your reports. Keep it secure.
              </p>
              <Button 
                variant="outline" 
                className="w-full border-health-500 text-health-600"
                onClick={() => navigate("/patient/:id")}
              >
                Enter Patient ID
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
