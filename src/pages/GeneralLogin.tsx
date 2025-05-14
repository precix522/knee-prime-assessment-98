
import React, { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTwilioAuthStore } from "../utils/auth";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { AuthPhoneForm } from "@/components/auth/AuthPhoneForm";
import { AuthOTPForm } from "@/components/auth/AuthOTPForm";
import { DevModeToggle } from "@/components/auth/DevModeToggle";
import { Toaster } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GeneralLogin() {
  const {
    state,
    updateState,
    handleSendOTP,
    handleVerifyOTP,
    handleToggleDevMode,
    resetToPhoneInput
  } = useAuth();
  
  const { validateSession } = useTwilioAuthStore();

  useEffect(() => {
    console.log('GeneralLogin component mounted');
    
    const checkSession = async () => {
      try {
        const isValid = await validateSession();
        const { user } = useTwilioAuthStore.getState();
        
        if (isValid && user) {
          console.log("Already authenticated in GeneralLogin:", user);
          console.log("User profile type in GeneralLogin:", user.profile_type);
          // AuthInitializer component will handle the redirection based on user type
        }
      } catch (error) {
        console.error("Session check error:", error);
      }
    };
    
    checkSession();
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
            <Alert className="bg-amber-50 border-amber-200 text-amber-800">
              <InfoIcon className="h-4 w-4 text-amber-800" />
              <AlertDescription>
                <strong>Developer Mode Active:</strong> OTP verification is bypassed.
              </AlertDescription>
            </Alert>
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
