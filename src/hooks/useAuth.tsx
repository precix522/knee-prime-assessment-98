import { useState, useCallback } from 'react';
import { toast } from "sonner";
import { useTwilioAuthStore } from '@/utils/auth';
import { useNavigate } from 'react-router-dom';

export interface AuthState {
  phone: string;
  otp: string;
  otpSent: boolean;
  loading: boolean;
  error: string | null;
  requestId: string | null;
  rememberMe: boolean;
  captchaVerified: boolean;
  captchaError: string | null;
  devMode: boolean;
}

export const useAuth = () => {
  const navigate = useNavigate();
  const authStore = useTwilioAuthStore();

  const [state, setState] = useState<AuthState>({
    phone: '',
    otp: '',
    otpSent: false,
    loading: false,
    error: null,
    requestId: null,
    rememberMe: true,
    captchaVerified: false,
    captchaError: null,
    devMode: false
  });

  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetToPhoneInput = useCallback(() => {
    updateState({
      otpSent: false,
      otp: '',
      error: null
    });
  }, [updateState]);

  const handleSendOTP = useCallback(async () => {
    try {
      if (state.loading) return;

      // Clear previous errors
      updateState({ loading: true, error: null });

      if (!state.phone.trim()) {
        updateState({
          loading: false,
          error: 'Phone number is required'
        });
        
        toast.error('Phone number is required');
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
        
        toast.success('Dev Mode: OTP sending bypassed. Enter any code to verify.', {
          duration: 5000
        });
        
        return;
      }

      console.log('Sending OTP to:', state.phone);
      toast.info('Sending verification code...', { id: 'sending-otp' });
      
      // Use direct function call to service for better debugging
      authStore.sendOTP(state.phone)
        .then(() => {
          // If we get here, the OTP was sent successfully
          updateState({
            loading: false,
            otpSent: true,
            error: null
          });

          toast.success('Verification code has been sent to your phone.', {
            duration: 5000
          });
          
          // Dismiss the sending toast
          toast.dismiss('sending-otp');
        })
        .catch((error) => {
          console.error('Error sending OTP:', error);
          updateState({
            loading: false,
            error: error.message || 'Failed to send verification code'
          });
          
          // Dismiss the sending toast
          toast.dismiss('sending-otp');
          
          toast.error(error.message || 'Failed to send OTP. Please try again.', {
            duration: 5000
          });
        });
    } catch (error: any) {
      console.error('Error in handleSendOTP:', error);
      updateState({
        loading: false,
        error: error.message || 'Failed to send verification code'
      });
      
      // Dismiss the sending toast
      toast.dismiss('sending-otp');
      
      toast.error(error.message || 'Failed to send OTP. Please try again.', {
        duration: 5000
      });
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
        toast.error('Verification code is required');
        return;
      }

      if (state.devMode) {
        // In dev mode, bypass actual verification
        handleOTPSuccess('dev-mode-session-id', {
          phone_number: state.phone,
          name: 'Developer User',
          profile_type: 'admin' // Default to admin in dev mode for testing
        });
        return;
      }

      toast.info('Verifying code...', { id: 'verifying-otp' });
      
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
      handleOTPSuccess(data.session_id, {
        phone_number: state.phone
      });
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      updateState({
        loading: false,
        error: error.message || 'Failed to verify code'
      });
      
      toast.dismiss('verifying-otp');
      toast.error(error.message || 'Failed to verify OTP. Please try again.', {
        duration: 5000
      });
    }
  }, [state.loading, state.otp, state.devMode, state.phone, updateState]);

  const handleOTPSuccess = useCallback((sessionId: string, userData: any) => {
    const user = {
      id: sessionId,
      phone: userData.phone_number,
      name: userData.name || 'User',
      ...userData
    };

    authStore.setAuthUser(user);
    
    updateState({
      loading: false,
      error: null,
    });

    toast.success('You have successfully logged in.', {
      duration: 5000
    });

    // Redirect based on user profile type
    setTimeout(() => {
      const { user: authenticatedUser } = authStore.getState();
      console.log('Redirecting based on profile type:', authenticatedUser?.profile_type);
      
      if (authenticatedUser?.profile_type === 'admin') {
        navigate('/manage-patients');
      } else if (authenticatedUser?.profile_type === 'patient') {
        navigate('/report-viewer');
      } else {
        // Default fallback if profile type is not set
        navigate('/dashboard');
      }
    }, 500);
  }, [authStore, updateState, navigate]);

  const handleToggleDevMode = useCallback(() => {
    updateState({ 
      devMode: !state.devMode,
      captchaVerified: !state.devMode, // Auto verify captcha in dev mode
    });
    
    if (!state.devMode) {
      toast.info('Developer mode activated. OTP verification will be bypassed.', {
        duration: 5000
      });
    } else {
      toast.info('Developer mode deactivated.', {
        duration: 5000
      });
    }
  }, [state.devMode, updateState]);

  return {
    state,
    updateState,
    handleSendOTP,
    handleVerifyOTP,
    handleToggleDevMode,
    resetToPhoneInput
  };
};
