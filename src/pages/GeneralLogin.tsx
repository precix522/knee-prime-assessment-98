
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
import { useNavigate, useLocation } from "react-router-dom";

export default function GeneralLogin() {
  const navigate = useNavigate();
  const location = useLocation();
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
    console.log('GeneralLogin component mounted', location.pathname);
    
    // Check if we were redirected from a previous failed redirect attempt
    const redirectAttempt = sessionStorage.getItem('redirectAttempt');
    if (redirectAttempt) {
      console.log('Detected previous redirect attempt, clearing to prevent loops');
      sessionStorage.removeItem('redirectAttempt');
      return;
    }
    
    const checkSession = async () => {
      try {
        const isValid = await validateSession();
        const { user } = useTwilioAuthStore.getState();
        
        if (isValid && user) {
          console.log("Already authenticated in GeneralLogin:", user);
          console.log("User profile type in GeneralLogin:", user.profile_type);
          
          // Store that we're attempting a redirect to detect loops
          sessionStorage.setItem('redirectAttempt', 'true');
          
          // Use replace to prevent back button issues
          if (user.profile_type === 'admin') {
            console.log('GeneralLogin: Redirecting admin to manage-patients');
            navigate('/manage-patients', { replace: true });
          } else if (user.profile_type === 'patient') {
            console.log('GeneralLogin: Redirecting patient to report-viewer');
            navigate('/report-viewer', { replace: true });
          } else {
            console.log('GeneralLogin: Profile type not recognized, redirecting to dashboard');
            navigate('/dashboard', { replace: true });
          }
        } else {
          console.log('User not authenticated or session invalid');
        }
      } catch (error) {
        console.error("Session check error:", error);
      }
    };
    
    checkSession();
  }, [validateSession, navigate, location.pathname]);

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
