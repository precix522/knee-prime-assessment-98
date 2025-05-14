
import { useTwilioAuthStore } from '@/utils/auth';
import { useAuthState } from './auth/useAuthState';
import { useDevMode } from './auth/useDevMode';
import { useOtp } from './auth/useOtp';
import { useAuthSession } from './auth/useAuthSession';
import { UseAuthReturn } from './auth/types';

// Change this line to use "export type" syntax for TypeScript isolatedModules
export type { AuthState } from './auth/types';

export const useAuth = (): UseAuthReturn => {
  const authStore = useTwilioAuthStore();
  const { state, updateState, resetToPhoneInput } = useAuthState();
  const { handleToggleDevMode } = useDevMode(state, updateState);
  const { handleSendOTP, handleVerifyOTP } = useOtp(state, updateState, authStore);
  const { handleOTPSuccess } = useAuthSession(state, updateState, authStore);

  const handleVerifyOTPWrapper = async () => {
    console.log('Starting OTP verification process...');
    const result = await handleVerifyOTP();
    if (!result) {
      console.log('OTP verification failed or was cancelled');
      return;
    }
    
    const { isDevMode, userData, data } = result as any;
    
    if (isDevMode) {
      console.log('Dev mode OTP verification success, userData:', userData);
      // Use setTimeout to give the UI time to update before proceeding
      setTimeout(() => {
        handleOTPSuccess('dev-mode-session-id', userData);
      }, 100);
    } else {
      console.log('Regular OTP verification success, data:', data);
      handleOTPSuccess(data.session_id, {
        phone_number: state.phone
      });
    }
  };

  return {
    state,
    updateState,
    handleSendOTP,
    handleVerifyOTP: handleVerifyOTPWrapper,
    handleToggleDevMode,
    resetToPhoneInput,
    handleOTPSuccess
  };
};
