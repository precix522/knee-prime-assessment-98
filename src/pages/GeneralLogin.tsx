
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
import { useNavigate } from "react-router-dom";

export default function GeneralLogin() {
  const navigate = useNavigate();
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
          
          // Add a small delay to ensure the session state is fully updated
          setTimeout(() => {
            // Redirect based on profile type
            if (user.profile_type === 'admin') {
              console.log('GeneralLogin: Redirecting admin to manage-patients');
              navigate('/manage-patients');
            } else if (user.profile_type === 'patient') {
              console.log('GeneralLogin: Redirecting patient to report-viewer');
              navigate('/report-viewer');
            } else {
              console.log('GeneralLogin: Profile type not recognized, redirecting to dashboard');
              navigate('/dashboard');
            }
          }, 100);
        }
      } catch (error) {
        console.error("Session check error:", error);
      }
    };
    
    checkSession();
  }, [validateSession, navigate]);

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
