import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";

export default function Dashboard() {
  const { user, logout, isLoading } = useTwilioAuthStore();
  const [pageLoading, setPageLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportError, setReportError] = useState("");
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [userType, setUserType] = useState("office_worker"); // Default user type
  const navigate = useNavigate();

  // Check authentication (using Twilio session)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // We already have the authentication state from the store
        // Just need to validate if user exists and is authenticated
        if (!user) {
          // No user in store, redirect to login
          navigate('/login');
        }
        
        setPageLoading(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        // If any error, redirect to login
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [user, navigate]);

  // Redirect to login if not authenticated after initialization
  useEffect(() => {
    if (!pageLoading && !isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, pageLoading, navigate]);
  
  // Fetch report data when user type changes or on initial load
  useEffect(() => {
    if (user?.id) {
      fetchReportData();
    }
  }, [userType, user?.id]);
  
  // Function to fetch report data
  const fetchReportData = async () => {
    if (!user?.id) return;
    
    try {
      setReportLoading(true);
      setReportError("");
      
      // Simulate API call with mock data
      setTimeout(() => {
        const mockData = getMockData(userType);
        setReportData(mockData);
        setReportLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setReportError(error instanceof Error ? error.message : 'Failed to fetch report data');
      setReportLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Handle PDF report download
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
      }, 2000);
      
    } catch (error) {
      console.error('Error downloading report:', error);
      setDownloadError(error instanceof Error ? error.message : 'Failed to download report');
      setDownloadLoading(false);
    }
  };

  // Mock data generator function
  const getMockData = (type) => {
    const data = {
      office_worker: {
        overall_score: 68,
        risk_level: "Good",
        categories: [
          { name: "Joint Stability", score: 18, max_score: 25 },
          { name: "Mobility", score: 16, max_score: 25 },
          { name: "Strength", score: 17, max_score: 25 },
          { name: "Pain Level", score: 17, max_score: 25 }
        ],
        recommendations: [
          "Take regular standing breaks during work hours",
          "Adjust your office chair to promote proper posture",
          "Consider using an ergonomic keyboard and mouse",
          "Perform daily stretching exercises for your knees"
        ]
      },
      elderly: {
        overall_score: 52,
        risk_level: "Moderate",
        categories: [
          { name: "Joint Stability", score: 12, max_score: 25 },
          { name: "Mobility", score: 11, max_score: 25 },
          { name: "Strength", score: 14, max_score: 25 },
          { name: "Pain Level", score: 15, max_score: 25 }
        ],
        recommendations: [
          "Practice balance exercises 3 times per week",
          "Use supportive footwear when walking",
          "Consider water-based exercises for lower impact",
          "Maintain regular check-ups with your physician"
        ]
      },
      athlete: {
        overall_score: 81,
        risk_level: "Excellent",
        categories: [
          { name: "Joint Stability", score: 22, max_score: 25 },
          { name: "Mobility", score: 18, max_score: 25 },
          { name: "Strength", score: 23, max_score: 25 },
          { name: "Pain Level", score: 18, max_score: 25 }
        ],
        recommendations: [
          "Implement proper warm-up and cool-down routines",
          "Monitor training load to prevent overtraining",
          "Focus on recovery nutrition post-workout",
          "Consider cross-training to avoid repetitive stress"
        ]
      }
    };
    
    return data[type];
  };

  // Show loading spinner while checking auth
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
                <h1 className="text-2xl font-bold text-gray-900">Your GATOR PRIME Report</h1>
                <p className="mt-2 text-gray-600">Welcome to your personalized knee health dashboard.</p>
              </div>
              
              <div className="p-6 sm:p-8">
                {/* User information */}
                <div className="mb-8 pb-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Your Information</h2>
                  <p className="text-gray-600">
                    <span className="font-medium">Phone:</span> {user?.phone || "N/A"}
                  </p>
                </div>
                
                {/* Placeholder for report data */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">PRIME Score Summary</h2>
                  
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    {reportLoading ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-gray-600">Loading report data...</p>
                      </div>
                    ) : reportError ? (
                      <div className="text-center py-8">
                        <p className="text-red-500 mb-2">Error loading report data</p>
                        <p className="text-gray-600 text-sm">{reportError}</p>
                        <button 
                          onClick={fetchReportData}
                          className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm"
                        >
                          Try Again
                        </button>
                      </div>
                    ) : reportData ? (
                      <>
                        <div className="text-center mb-4">
                          <span className="text-5xl font-bold text-orange-600">{reportData.overall_score}</span>
                          <span className="text-lg text-gray-500 ml-1">/{reportData.categories.reduce((total, cat) => total + cat.max_score, 0)}</span>
                          <p className="text-gray-600 mt-1">Your PRIME Score</p>
                          <div className="mt-2 inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                            {reportData.risk_level}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          {reportData.categories.map((category, index) => (
                            <div key={index} className="bg-white border border-gray-100 rounded-md p-3 shadow-sm">
                              <h4 className="text-sm font-semibold text-gray-900">{category.name}</h4>
                              <div className="flex items-center justify-between mt-2">
                                <div className="w-3/4">
                                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className="bg-orange-500 h-3 rounded-full" 
                                      style={{ width: `${(category.score / category.max_score) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                  {category.score}/{category.max_score}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden mt-6 mb-2">
                          <div 
                            className="bg-orange-500 h-4 rounded-full" 
                            style={{ width: `${(reportData.overall_score / reportData.categories.reduce((total, cat) => total + cat.max_score, 0)) * 100}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0</span>
                          <span>25</span>
                          <span>50</span>
                          <span>75</span>
                          <span>100</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600">No report data available</p>
                      </div>
                    )}
                  </div>
                  
                  {/* User Type Selector */}
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Personalize your report:</h3>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => setUserType("office_worker")}
                        className={`px-4 py-2 text-sm rounded-full ${userType === "office_worker" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                      >
                        Office Worker
                      </button>
                      <button 
                        onClick={() => setUserType("elderly")}
                        className={`px-4 py-2 text-sm rounded-full ${userType === "elderly" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                      >
                        Elderly
                      </button>
                      <button 
                        onClick={() => setUserType("athlete")}
                        className={`px-4 py-2 text-sm rounded-full ${userType === "athlete" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                      >
                        Athlete
                      </button>
                    </div>
                  </div>
                </div>
                
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
                    <Button 
                      variant="outline" 
                      size="default"
                      onClick={() => {
                        if (reportData) {
                          // Show recommendations in a modal or expand them below
                          // For now, we'll just alert the first recommendation
                          alert(`Recommendations for ${userType.replace('_', ' ')}:\n\n- ${reportData.recommendations.join('\n- ')}`);
                        }
                      }}
                      disabled={!reportData}
                    >
                      View Recommendations
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
