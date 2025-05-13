
import React, { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTwilioAuthStore } from "../utils/auth";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { AuthPhoneForm } from "@/components/auth/AuthPhoneForm";
import { AuthOTPForm } from "@/components/auth/AuthOTPForm";
import { DevModeToggle } from "@/components/auth/DevModeToggle";

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
    const checkSession = async () => {
      try {
        const isValid = await validateSession();
        const { user } = useTwilioAuthStore.getState();
        
        if (isValid && user) {
          console.log("Already authenticated:", user);
          // User is already authenticated, handle redirect in useAuth hook
        }
      } catch (error) {
        console.error("Session check error:", error);
      }
    };
    
    checkSession();
  }, [validateSession]);

  return (
    <AuthContainer>
      <div className="bg-white shadow-md rounded-md p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Login with OTP
        </h2>
        
        {!state.otpSent ? (
          <>
            <AuthPhoneForm
              state={state}
              updateState={updateState}
              onSubmit={handleSendOTP}
            />
            <DevModeToggle
              devMode={state.devMode}
              onToggle={handleToggleDevMode}
            />
          </>
        ) : (
          <AuthOTPForm
            state={state}
            updateState={updateState}
            onSubmit={handleVerifyOTP}
            onBack={resetToPhoneInput}
          />
        )}
      </div>
    </AuthContainer>
  );
}
