
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Login() {
  // Page loading state - shows while checking auth status
  const [pageLoading, setPageLoading] = useState(true);
  const [phoneInput, setPhoneInput] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [formattedPhone, setFormattedPhone] = useState("");
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  
  // Auth store state and methods
  const {
    user,
    isLoading,
    isVerifying,
    error,
    phoneNumber,
    sendOTP,
    verifyOTP,
    clearError,
    validateSession
  } = useTwilioAuthStore();
  
  // Initialize auth session and redirect if already logged in
  useEffect(() => {
    setPageLoading(true);
    
    // Check for existing session using Twilio auth
    const checkSession = async () => {
      try {
        // Check if we have a valid session
        const isValid = await validateSession();
        
        if (isValid) {
          // User is logged in, redirect to dashboard
          navigate("/dashboard");
        } else {
          // No active session
          setPageLoading(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setPageLoading(false);
      }
    };
   
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Access Your PRIME Report</h1>
                <p className="mt-2 text-gray-600">
                  {isVerifying 
                    ? "Enter the verification code sent to your phone" 
                    : "Enter your phone number to access your personalized knee health report"}
                </p>
              </div>
              
              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              {isVerifying ? (
                <form onSubmit={handleVerifyOTP}>
                  <div className="mb-6">
                    <Label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                      Verification Code
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full"
                      maxLength={6}
                      autoComplete="one-time-code"
                      disabled={isLoading}
                      required
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      For demo purposes, enter any 6 digits
                    </p>
                  </div>
                  
                  <div className="flex flex-col space-y-3">
                    <Button
                      type="submit"
                      variant="health"
                      size="lg"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Verifying..." : "Verify Code"}
                    </Button>
                    
                    <div className="text-center">
                      {countdown > 0 ? (
                        <p className="text-sm text-gray-600">
                          Resend code in {countdown} seconds
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            sendOTP(formattedPhone || phoneNumber);
                            setCountdown(60);
                          }}
                          className="text-sm text-orange-600 hover:text-orange-700"
                          disabled={isLoading}
                        >
                          Didn't receive the code? Send again
                        </button>
                      )}
                    </div>
                    
                    <button
                      type="button"
                      className="text-sm text-orange-600 hover:text-orange-700"
                      onClick={() => {
                        clearError();
                        useTwilioAuthStore.setState({ isVerifying: false });
                      }}
                      disabled={isLoading}
                    >
                      Back to Phone Entry
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSendOTP}>
                  <div className="mb-6">
                    <Label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </Label>
                    <Input
                      type="tel"
                      id="phone"
                      className="w-full"
                      placeholder="(123) 456-7890"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    variant="health"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Verification Code"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}


