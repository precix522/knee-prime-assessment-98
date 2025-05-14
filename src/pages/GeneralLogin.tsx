
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTwilioAuthStore } from "@/utils/auth";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { AuthPhoneForm } from "@/components/auth/AuthPhoneForm";
import { AuthOTPForm } from "@/components/auth/AuthOTPForm";
import { DevModeToggle } from "@/components/auth/DevModeToggle";
import { toast } from "@/hooks/use-toast";
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
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      clearError();
    }
  }, [error, clearError]);

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSendOTP = async () => {
    try {
      console.log("Sending OTP to:", phoneNumber);
      
      if (devMode) {
        // In dev mode, bypass actual OTP sending
        setIsVerifying(true);
        toast({
          title: "Developer Mode",
          description: "Use code 123456 to verify",
          variant: "default",
        });
        return;
      }
      
      await sendOTP(phoneNumber);
      setIsVerifying(true);
    } catch (err) {
      console.error("Failed to send OTP:", err);
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
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
        toast({
          title: "Success",
          description: "Login successful!",
          variant: "default",
        });
        navigate("/dashboard");
      } else {
        console.error("OTP verification returned no user");
        toast({
          title: "Error",
          description: "Invalid OTP. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("OTP verification failed:", err);
      toast({
        title: "Error",
        description: "OTP verification failed. Please try again.",
        variant: "destructive",
      });
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
