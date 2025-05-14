
import { useState, useCallback } from 'react';
import { AuthState } from './types';

export const useAuthState = () => {
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

  return {
    state,
    updateState,
    resetToPhoneInput
  };
};
