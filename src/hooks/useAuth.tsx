import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTwilioAuthStore } from '@/utils/twilio-auth-store';
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
  const { toast } = useToast();
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
        
        toast({
          title: 'Dev Mode',
          description: 'OTP sending bypassed. Enter any code to verify.',
        });
        
        return;
      }

      console.log('Sending OTP to:', state.phone);
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone_number: state.phone })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send verification code');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to send verification code');
      }

      updateState({
        loading: false,
        otpSent: true,
        requestId: data.request_id,
        error: null
      });

      toast({
        title: 'OTP Sent',
        description: 'Verification code has been sent to your phone.',
      });
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      updateState({
        loading: false,
        error: error.message || 'Failed to send verification code'
      });
      
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to send OTP. Please try again.',
      });
    }
  }, [state.loading, state.phone, state.devMode, updateState, toast]);

  const handleVerifyOTP = useCallback(async () => {
    try {
      if (state.loading) return;

      updateState({ loading: true, error: null });

      if (!state.otp.trim()) {
        updateState({
          loading: false,
          error: 'Verification code is required'
        });
        return;
      }

      if (state.devMode) {
        // In dev mode, bypass actual verification
        handleOTPSuccess('dev-mode-session-id', {
          phone_number: state.phone,
          name: 'Developer User'
        });
        return;
      }

      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: state.otp,
          request_id: state.requestId,
          phone_number: state.phone
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify code');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to verify code');
      }

      // Authentication successful
      handleOTPSuccess(data.session_id, {
        phone_number: state.phone
      });
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      updateState({
        loading: false,
        error: error.message || 'Failed to verify code'
      });
      
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to verify OTP. Please try again.',
      });
    }
  }, [state.loading, state.otp, state.devMode, state.requestId, state.phone, updateState, toast]);

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

    toast({
      title: 'Logged In',
      description: 'You have successfully logged in.',
    });

    // Redirect to dashboard or home
    setTimeout(() => {
      navigate('/dashboard');
    }, 500);
  }, [authStore, updateState, navigate, toast]);

  const handleToggleDevMode = useCallback(() => {
    updateState({ 
      devMode: !state.devMode,
      captchaVerified: !state.devMode, // Auto verify captcha in dev mode
    });
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
