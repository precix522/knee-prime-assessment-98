import { useCallback } from 'react';
import { toast } from 'sonner';
import { AuthState } from './types';

export const useOtp = (
  state: AuthState,
  updateState: (updates: Partial<AuthState>) => void,
  authStore: any
) => {
  const handleSendOTP = useCallback(async () => {
    try {
      if (state.loading) return;

      // Clear previous errors
      updateState({ loading: true, error: null });

      if (!state.phone || state.phone.trim() === '') {
        updateState({
          loading: false,
          error: 'Phone number is required'
        });
        
        toast.error("Phone number is required");
        return;
      }

      if (state.devMode) {
        // In dev mode, bypass actual OTP sending
        updateState({
          loading: false,
          otpSent: true,
          requestId: 'dev-mode-request-id',
          error: null
        });
        
        toast.success("Dev Mode - OTP sending bypassed. Enter any code to verify.");
        
        return;
      }

      console.log('Sending OTP to:', state.phone);
      toast.loading("Sending verification code...", {
        id: 'sending-otp',
      });
      
      // Reset any redirect loop detection
      sessionStorage.removeItem('loginRedirectCount');
      
      // Use direct function call to service for better debugging
      authStore.sendOTP(state.phone)
        .then(() => {
          // If we get here, the OTP was sent successfully
          updateState({
            loading: false,
            otpSent: true,
            error: null
          });

          toast.success("Verification code has been sent to your phone.");
          
          // Dismiss the sending toast
          toast.dismiss('sending-otp');
        })
        .catch((error: any) => {
          console.error('Error sending OTP:', error);
          updateState({
            loading: false,
            error: error.message || 'Failed to send verification code'
          });
          
          // Dismiss the sending toast
          toast.dismiss('sending-otp');
          
          toast.error(error.message || 'Failed to send OTP. Please try again.');
        });
    } catch (error: any) {
      console.error('Error in handleSendOTP:', error);
      updateState({
        loading: false,
        error: error.message || 'Failed to send verification code'
      });
      
      // Dismiss the sending toast
      toast.dismiss('sending-otp');
      
      toast.error(error.message || 'Failed to send OTP. Please try again.');
    }
  }, [state.loading, state.phone, state.devMode, updateState, authStore]);

  const handleVerifyOTP = useCallback(async () => {
    try {
      if (state.loading) return;

      updateState({ loading: true, error: null });

      if (!state.otp.trim()) {
        updateState({
          loading: false,
          error: 'Verification code is required'
        });
        toast.error("Error", {
          description: 'Verification code is required'
        });
        return;
      }

      if (state.devMode) {
        // In dev mode, bypass actual verification
        // Check if the phone number appears to be an admin number
        // Phones containing "admin" or starting with "999" are considered admin in dev mode
        const isAdminPhone = state.phone.toLowerCase().includes('admin') || 
                            state.phone.startsWith('999');
        
        const profileType = isAdminPhone ? 'admin' : 'patient';
        console.log(`Dev mode: Detected profile type as '${profileType}' based on phone number`);
        
        const userData = {
          phone_number: state.phone,
          name: isAdminPhone ? 'Admin User' : 'Patient User',
          profile_type: profileType
        };
        
        // Reset any redirect loop detection
        sessionStorage.removeItem('loginRedirectCount');
        sessionStorage.removeItem('lastRedirect');
        
        return { isDevMode: true, userData };
      }

      toast.info("Verifying Code", {
        id: 'verifying-otp',
        description: 'Verifying your code...'
      });
      
      // Clear any previous redirect loop detection
      sessionStorage.removeItem('loginRedirectCount');
      sessionStorage.removeItem('lastRedirect');
      
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: state.otp,
          phone_number: state.phone
        })
      });

      console.log('OTP verification response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error verification response text:', errorText);
        
        let errorMessage = 'Failed to verify code';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Failed to parse verification error response:', e);
        }
        
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      console.log('OTP verification response text:', responseText);
      
      if (!responseText || responseText.trim() === '') {
        throw new Error('Empty response from verification server');
      }
      
      const data = JSON.parse(responseText);
      console.log('OTP verification parsed data:', data);

      if (!data.success) {
        throw new Error(data.message || 'Failed to verify code');
      }

      // Authentication successful
      toast.dismiss('verifying-otp');
      
      return { isDevMode: false, data };
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      updateState({
        loading: false,
        error: error.message || 'Failed to verify code'
      });
      
      toast.dismiss('verifying-otp');
      toast.error("Verification Failed", {
        description: error.message || 'Failed to verify OTP. Please try again.'
      });
      
      return null;
    }
  }, [state.loading, state.otp, state.devMode, state.phone, updateState]);

  return {
    handleSendOTP,
    handleVerifyOTP
  };
};
