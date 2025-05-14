
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTwilioAuthStore } from "@/utils/auth";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/Button";
import { Users, FileText, Upload, Settings } from "lucide-react";

export default function AdminDashboard() {
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
        
        // Verify user is admin type
        const profileType = user?.profile_type || localStorage.getItem('userProfileType');
        if (profileType !== 'admin') {
          toast.error("Unauthorized. Redirecting to appropriate dashboard.");
          if (profileType === 'patient') {
            navigate("/patient-dashboard", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
          return;
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Session validation error:", err);
        toast.error("Authentication error. Please log in again.");
        navigate("/general-login", { replace: true });
      }
    };
    
    checkAuth();
  }, [navigate, validateSession, user]);

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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, Admin! Manage patients, reports, and system settings.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <Users className="mr-2 text-orange-500" size={20} />
                Manage Patients
              </CardTitle>
              <CardDescription>
                View and manage patient records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-600">
                Add, edit, or review patient information and associated records.
              </p>
              <Button 
                variant="health" 
                className="w-full"
                onClick={() => navigate("/manage-patients")}
              >
                Manage Patients
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <FileText className="mr-2 text-orange-500" size={20} />
                All Reports
              </CardTitle>
              <CardDescription>
                Browse all patient reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-600">
                Access and review all patient reports across the system.
              </p>
              <Button 
                variant="health" 
                className="w-full"
                onClick={() => navigate("/all-reports")}
              >
                View Reports
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <Upload className="mr-2 text-orange-500" size={20} />
                Upload Reports
              </CardTitle>
              <CardDescription>
                Upload new patient reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-600">
                Upload and associate new reports with patient records.
              </p>
              <Button 
                variant="outline" 
                className="w-full border-health-500 text-health-600"
                onClick={() => navigate("/manage-patients")}
              >
                Upload Reports
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <Settings className="mr-2 text-orange-500" size={20} />
                User Management
              </CardTitle>
              <CardDescription>
                Manage system users and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-600">
                Add, edit, or remove system users and their access levels.
              </p>
              <Button 
                variant="health" 
                className="w-full"
                onClick={() => navigate("/manage-users")}
              >
                Manage Users
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
