
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTwilioAuthStore } from "@/utils/auth";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { AuthPhoneForm } from "@/components/auth/AuthPhoneForm";
import { AuthOTPForm } from "@/components/auth/AuthOTPForm";
import { DevModeToggle } from "@/components/auth/DevModeToggle";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GeneralLogin() {
  const {
    user,
    phoneNumber,
    setPhoneNumber,
    sendOTP,
    verifyOTP,
    isLoading,
    error,
    clearError,
    setLoginUser,
  } = useTwilioAuthStore();
  
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  useEffect(() => {
    // If user is already logged in, redirect based on profile type
    if (user) {
      const profileType = user.profile_type || localStorage.getItem('userProfileType') || 'patient';
      console.log("Already logged in, redirecting user with profile type:", profileType);
      
      if (profileType === 'admin') {
        navigate("/admin-dashboard", { replace: true });
      } else if (profileType === 'patient') {
        navigate("/report-viewer", { replace: true }); // Changed from "/patient-dashboard" back to "/report-viewer"
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSendOTP = async () => {
    try {
      console.log("Sending OTP to:", phoneNumber);
      
      if (devMode) {
        // In dev mode, bypass actual OTP sending
        setIsVerifying(true);
        toast("Developer Mode - Use code 123456 to verify");
        return;
      }
      
      await sendOTP(phoneNumber);
      setIsVerifying(true);
    } catch (err) {
      console.error("Failed to send OTP:", err);
      toast.error("Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOTP = async () => {
    try {
      console.log("Verifying OTP:", otp, "for phone:", phoneNumber);
      
      // Update Twilio Auth Store with devMode value
      if (devMode) {
        useTwilioAuthStore.setState({ devMode: true });
      }
      
      const user = await verifyOTP(phoneNumber, otp);
      if (user) {
        setLoginUser(user);
        
        // Get profile type with fallback to localStorage
        const profileType = user.profile_type || localStorage.getItem('userProfileType') || 'patient';
        console.log("Login successful! Redirecting based on profile type:", profileType);
        
        toast.success("Login successful!");
        
        // Redirect based on profile type
        if (profileType === 'admin') {
          navigate("/admin-dashboard", { replace: true });
        } else if (profileType === 'patient') {
          navigate("/report-viewer", { replace: true }); // Changed from "/patient-dashboard" back to "/report-viewer"
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else {
        console.error("OTP verification returned no user");
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("OTP verification failed:", err);
      toast.error("OTP verification failed. Please try again.");
    }
  };

  const handleToggleDevMode = () => {
    setDevMode(!devMode);
    // Also update the global state
    useTwilioAuthStore.setState({ devMode: !devMode });
  };

  // Create state object for AuthPhoneForm and AuthOTPForm with proper defaults
  const authState = {
    phone: phoneNumber || '',
    otp: otp || '',
    otpSent: isVerifying,
    loading: isLoading,
    error: error || null,
    requestId: null,
    rememberMe: true,
    captchaVerified: devMode, // In dev mode, consider captcha verified
    captchaError: null,
    devMode
  };

  const updateAuthState = (updates: any) => {
    if (updates.phone !== undefined) setPhoneNumber(updates.phone);
    if (updates.otp !== undefined) setOtp(updates.otp);
    // Other state updates can be handled here
  };

  return (
    <AuthContainer>
      <div className="w-full max-w-md">
        <Card className="w-full p-4">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {isVerifying ? "Enter verification code" : "Login or Register"}
            </CardTitle>
            <CardDescription className="text-center">
              {isVerifying
                ? "We've sent a code to your phone"
                : "Enter your phone number to login or register"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {devMode && !isVerifying && (
              <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                <InfoIcon className="h-4 w-4 text-amber-800" />
                <AlertDescription>
                  <strong>Developer Mode Active:</strong> OTP verification is bypassed.
                  Enter any phone number and use code <strong className="font-mono">123456</strong> to login.
                </AlertDescription>
              </Alert>
            )}

            {isVerifying ? (
              <AuthOTPForm
                state={authState}
                updateState={updateAuthState}
                onSubmit={handleVerifyOTP}
                onBack={() => setIsVerifying(false)}
              />
            ) : (
              <>
                <AuthPhoneForm
                  state={authState}
                  updateState={updateAuthState}
                  onSubmit={handleSendOTP}
                />
                <div className="mt-4">
                  <DevModeToggle
                    devMode={devMode}
                    onToggle={handleToggleDevMode}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthContainer>
  );
}
