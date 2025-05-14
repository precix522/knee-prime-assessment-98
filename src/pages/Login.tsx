
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTwilioAuthStore } from "../utils/auth";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { AuthPhoneForm } from "@/components/auth/AuthPhoneForm";
import { AuthOTPForm } from "@/components/auth/AuthOTPForm";
import { DevModeToggle } from "@/components/auth/DevModeToggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const {
    state,
    updateState,
    handleSendOTP,
    handleVerifyOTP,
    handleToggleDevMode,
    resetToPhoneInput
  } = useAuth();
  
  const { validateSession, toggleDevMode } = useTwilioAuthStore();
  const [searchParams] = useSearchParams();
  const patientID = searchParams.get("patientId");
  
  // Sync devMode between the useAuth hook state and the Twilio auth store
  useEffect(() => {
    if (toggleDevMode && state.devMode !== useTwilioAuthStore.getState().devMode) {
      toggleDevMode();
    }
  }, [state.devMode, toggleDevMode]);

  useEffect(() => {
    console.log('Login component mounted');
    console.log('Current auth state:', state);
    
    const checkAuthStatus = async () => {
      try {
        const isValid = await validateSession();
        const { user } = useTwilioAuthStore.getState();
        
        console.log('Initial auth check:', isValid, user);
        
        // If already authenticated, redirect based on user type
        if (isValid && user) {
          const profileType = user.profile_type || localStorage.getItem('userProfileType') || 'patient';
          if (profileType === 'admin') {
            navigate('/dashboard', { replace: true });
          } else if (profileType === 'patient') {
            navigate('/report-viewer', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      }
    };
    
    checkAuthStatus();
  }, [validateSession, state, navigate]);

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
                <strong>Developer Mode Active:</strong> Twilio OTP verification is bypassed.
                Use code <strong className="font-mono">123456</strong> to login.
              </AlertDescription>
            </Alert>
          )}
          
          {!state.otpSent ? (
            <AuthPhoneForm
              state={state}
              updateState={updateState}
              onSubmit={() => {
                console.log('Submit button clicked in AuthPhoneForm');
                handleSendOTP();
              }}
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
