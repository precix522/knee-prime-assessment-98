import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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

  const handleSendOTP = async () => {
    try {
      await sendOTP(phoneNumber);
      setIsVerifying(true);
    } catch (err) {
      console.error("Failed to send OTP:", err);
      toast.error("Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const user = await verifyOTP(phoneNumber, otp);
      if (user) {
        setLoginUser(user);
        navigate("/dashboard");
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("OTP verification failed:", err);
      toast.error("OTP verification failed. Please try again.");
    }
  };

  const handleToggleDevMode = () => {
    setDevMode(!devMode);
  };

  // Create state object for AuthPhoneForm and AuthOTPForm
  const authState = {
    phone: phoneNumber,
    otp,
    otpSent: isVerifying,
    loading: isLoading,
    error,
    requestId: null,
    rememberMe: true,
    captchaVerified: devMode, // In dev mode, consider captcha verified
    captchaError: null,
    devMode
  };

  const updateAuthState = (updates: any) => {
    if (updates.phone !== undefined) setPhoneNumber(updates.phone);
    if (updates.otp !== undefined) setOtp(updates.otp);
    if (updates.rememberMe !== undefined) {
      // Handle remember me if needed
    }
    // Other state updates can be handled here
  };

  return (
    <AuthContainer>
      <Card className="w-full max-w-md space-y-4 p-4">
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

        <CardContent>
          {error && (
            <Alert variant="destructive">
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
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
            <AuthPhoneForm
              state={authState}
              updateState={updateAuthState}
              onSubmit={handleSendOTP}
            />
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <DevModeToggle
          devMode={devMode}
          onToggle={handleToggleDevMode}
        />
      </div>
    </AuthContainer>
  );
}
