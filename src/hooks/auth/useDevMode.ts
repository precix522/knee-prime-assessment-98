
import { useCallback } from 'react';
import { toast } from 'sonner';

export const useDevMode = (
  state: { devMode: boolean },
  updateState: (updates: any) => void
) => {
  const handleToggleDevMode = useCallback(() => {
    const newDevMode = !state.devMode;
    updateState({ 
      devMode: newDevMode,
      captchaVerified: newDevMode, // Auto verify captcha in dev mode
    });
    
    if (newDevMode) {
      toast.info('Developer mode activated. OTP verification will be bypassed.', {
        duration: 5000
      });
    } else {
      toast.info('Developer mode deactivated.', {
        duration: 5000
      });
    }
  }, [state.devMode, updateState]);

  return { handleToggleDevMode };
};
