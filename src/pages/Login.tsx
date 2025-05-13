
import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { AuthPhoneForm } from "@/components/auth/AuthPhoneForm";
import { AuthOTPForm } from "@/components/auth/AuthOTPForm";
import { DevModeToggle } from "@/components/auth/DevModeToggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "sonner";

export default function Login() {
  const {
    state,
    updateState,
    handleSendOTP,
    handleVerifyOTP,
    handleToggleDevMode,
    resetToPhoneInput
  } = useAuth();
  
  const { validateSession } = useTwilioAuthStore();
  const [searchParams] = useSearchParams();
  const patientID = searchParams.get("patientId");

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const isValid = await validateSession();
        const { user } = useTwilioAuthStore.getState();
        
        console.log('Initial auth check:', isValid, user);
        
        // If user is already authenticated, handleOTPSuccess in useAuth will handle redirect
      } catch (error) {
        console.error("Error checking auth status:", error);
      }
    };
    
    checkAuthStatus();
  }, [validateSession]);

  return (
    <AuthContainer>
      <Toaster position="bottom-left" />
      <Card className="w-full max-w-md space-y-4 p-4">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {state.otpSent ? "Verify OTP" : "Login"}
          </CardTitle>
          <CardDescription className="text-center">
            {state.otpSent
              ? "Enter the verification code we sent to your phone."
              : "Enter your phone number to receive a verification code."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="grid gap-4">
          {state.devMode && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-4">
                <p className="text-amber-700">
                  <strong>Developer Mode Active:</strong> OTP verification is bypassed.
                  Any code will work, and a mock user will be created if needed.
                </p>
              </CardContent>
            </Card>
          )}
          
          {!state.otpSent ? (
            <AuthPhoneForm
              state={state}
              updateState={updateState}
              onSubmit={handleSendOTP}
            />
          ) : (
            <AuthOTPForm
              state={state}
              updateState={updateState}
              onSubmit={handleVerifyOTP}
              onBack={resetToPhoneInput}
            />
          )}
          
          {!state.otpSent && (
            <DevModeToggle
              devMode={state.devMode}
              onToggle={handleToggleDevMode}
            />
          )}
        </CardContent>
      </Card>
    </AuthContainer>
  );
}
