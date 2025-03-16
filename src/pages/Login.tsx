
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
    
    checkSession();
  }, [navigate, validateSession]);
  
  // Countdown timer for resending OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);
  
  // Format phone number to E.164 format
  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, "");
    
    // Check if the phone already has a country code (starts with +)
    if (phone.startsWith("+")) {
      return phone;
    }
    
    // For Singapore numbers (8 digits, should have +65 prefix)
    if (digits.length === 8) {
      return `+65${digits}`; // Singapore format
    }
    // For US/Canada (10 digits, should have +1 prefix)
    else if (digits.length === 10) {
      return `+1${digits}`; // US/Canada format
    } 
    // If starting with 65 and has 10 digits total, it's likely a Singapore number without +
    else if (digits.length === 10 && digits.startsWith("65")) {
      return `+${digits}`;
    }
    // For other international numbers
    else {
      return `+${digits}`;
    }
  };
  
  // Validate phone number format
  const validatePhoneNumber = (phone: string): boolean => {
    // Basic E.164 validation (+ followed by at least 8 digits for Singapore)
    const e164Regex = /^\+[1-9]\d{7,14}$/;
    return e164Regex.test(phone);
  };
  
  // Handle phone submission
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    // Format and validate phone number
    const formattedNumber = formatPhoneNumber(phoneInput);
    setFormattedPhone(formattedNumber);
    
    // Enhanced validation
    if (!validatePhoneNumber(formattedNumber)) {
      useTwilioAuthStore.setState({ 
        error: "Please enter a valid phone number in international format (e.g., +65XXXXXXXX for Singapore)" 
      });
      return;
    }
    
    // Send OTP to the phone number
    await sendOTP(formattedNumber);
    
    // Start countdown for resend (60 seconds)
    setCountdown(60);
  };
  
  // Handle OTP verification
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    // Basic validation
    if (!otpCode || otpCode.length < 6) {
      useTwilioAuthStore.setState({
        error: "Please enter the 6-digit verification code"
      });
      return;
    }
    
    // Call the verification function
    try {
      if (formattedPhone || phoneNumber) {
        // Twilio verifyOTP requires both phone and code
        await verifyOTP(formattedPhone || phoneNumber, otpCode);
        
        // After successful verification, navigate to dashboard
        toast.success("Verification successful!");
        navigate('/dashboard');
      } else {
        useTwilioAuthStore.setState({
          error: "Phone number is missing. Please restart the verification process."
        });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
    }
  };
  
  // Show loading spinner while checking auth status
  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
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
