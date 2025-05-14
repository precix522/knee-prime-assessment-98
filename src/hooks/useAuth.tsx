
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
    const result = await handleVerifyOTP();
    if (!result) return;
    
    const { isDevMode, userData, data } = result as any;
    
    if (isDevMode) {
      // Use setTimeout to give the UI time to update before proceeding
      setTimeout(() => {
        handleOTPSuccess('dev-mode-session-id', userData);
      }, 100);
    } else {
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
