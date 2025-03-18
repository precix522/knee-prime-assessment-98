import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";

export default function Dashboard() {
  const { user, logout, isLoading } = useTwilioAuthStore();
  const [pageLoading, setPageLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const navigate = useNavigate();

  // Check authentication (using Twilio session)
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

  // Redirect to login if not authenticated after initialization
  useEffect(() => {
    if (!pageLoading && !isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, pageLoading, navigate]);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Handle PDF report download and redirect after download completes (Approach #4)
  const handleDownloadReport = async () => {
    if (!user?.id) {
      setDownloadError("User not found");
      return;
    }

    try {
      setDownloadLoading(true);
      setDownloadError("");

      // Simulate PDF generation
      setTimeout(() => {
        setDownloadLoading(false);
        // In a real app, this would download a file instead
        alert("PDF Report would download here in a real application");
        // Redirect to the "Thank You" page after PDF generation/download
        navigate("/thank-you");
      }, 2000);
    } catch (error) {
      console.error("Error downloading report:", error);
      setDownloadError(
        error instanceof Error ? error.message : "Failed to download report"
      );
      setDownloadLoading(false);
    }
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
                {/* Removed the placeholder for report data */}

                {/* Report actions */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      variant="health"
                      size="default"
                      onClick={handleDownloadReport}
                      disabled={downloadLoading}
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
                  </div>

                  {downloadError && (
                    <div className="text-red-500 text-sm mt-2">
                      Error: {downloadError}. Please try again.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Logout section */}
            <div className="mt-8 text-center">
              <Button
                variant="ghost"
                onClick={() => navigate("/logout")}
                disabled={isLoading}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
