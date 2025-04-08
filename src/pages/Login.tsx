
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import { toast } from "sonner";
import { PhoneForm } from "../components/auth/PhoneForm";
import { OTPForm } from "../components/auth/OTPForm";
import { LoadingSpinner } from "../components/auth/LoadingSpinner";
import { formatPhoneNumber, validatePhoneNumber } from "../components/auth/AuthUtils";

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
    rememberMe,
    setRememberMe,
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
    
    try {
      // Send OTP to the phone number
      await sendOTP(formattedNumber);
      
      // Start countdown for resend (60 seconds)
      setCountdown(60);
    } catch (err) {
      console.error("Error in handleSendOTP:", err);
    }
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
        
        // After successful verification, navigate to patient ID page
        toast.success("Verification successful!");
        navigate('/patient-id');
      } else {
        useTwilioAuthStore.setState({
          error: "Phone number is missing. Please restart the verification process."
        });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
    }
  };

  // Handle resend OTP
  const handleResendOTP = () => {
    sendOTP(formattedPhone || phoneNumber);
    setCountdown(60);
  };

  // Handle going back to phone input
  const handleBackToPhone = () => {
    clearError();
    useTwilioAuthStore.setState({ isVerifying: false });
  };
  
  // Show loading spinner while checking auth status
  if (pageLoading) {
    return <LoadingSpinner />;
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
              
              {isVerifying ? (
                <OTPForm 
                  otpCode={otpCode}
                  setOtpCode={setOtpCode}
                  handleVerifyOTP={handleVerifyOTP}
                  isLoading={isLoading}
                  error={error}
                  formattedPhone={formattedPhone}
                  phoneNumber={phoneNumber}
                  countdown={countdown}
                  onResendOTP={handleResendOTP}
                  onBackToPhone={handleBackToPhone}
                />
              ) : (
                <PhoneForm
                  phoneInput={phoneInput}
                  setPhoneInput={setPhoneInput}
                  handleSendOTP={handleSendOTP}
                  isLoading={isLoading}
                  error={error}
                  rememberMe={rememberMe}
                  setRememberMe={setRememberMe}
                />
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
