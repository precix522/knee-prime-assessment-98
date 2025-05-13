
import { toast } from 'sonner';
import { 
  getStoredSessionId, 
  getStoredSessionExpiry, 
  getRememberMePreference, 
  saveSession, 
  clearSession, 
  isSessionExpired,
  setRememberMePreference
} from './session-service';
import { validateSession as validateSessionService } from '../../api/twilio-service';
import { getOrCreateUserProfile } from './user-profile-service';
import { User } from './types';

export interface SessionState {
  sessionId: string | null;
  sessionExpiry: string | null;
  rememberMe: boolean;
  isLoading: boolean;
  error: string | null;
  
  setRememberMe: (remember: boolean) => void;
  validateSession: () => Promise<boolean>;
  logout: () => void;
}

export const createSessionState = (
  set: Function,
  get: Function
): SessionState => ({
  sessionId: getStoredSessionId(),
  sessionExpiry: getStoredSessionExpiry(),
  rememberMe: getRememberMePreference(),
  isLoading: true,
  error: null,
  
  setRememberMe: (remember) => {
    setRememberMePreference(remember);
    set({ rememberMe: remember });
  },
  
  validateSession: async () => {
    const sessionId = get().sessionId || getStoredSessionId();
    const sessionExpiry = getStoredSessionExpiry();
    const currentUser = get().user;
    
    // If we already have a user in state, consider the session valid
    if (currentUser) {
      set({ isLoading: false });
      return true;
    }
    
    if (!sessionId) {
      set({ user: null, isLoading: false });
      return false;
    }
    
    if (sessionExpiry && isSessionExpired(sessionExpiry)) {
      clearSession();
      set({ 
        user: null, 
        sessionId: null, 
        sessionExpiry: null,
        isLoading: false, 
        error: 'Your session has expired. Please log in again.' 
      });
      toast.info('Your session has expired. Please log in again.');
      return false;
    }
    
    try {
      set({ isLoading: true });
      
      // Skip the external validation in development mode if we have a session ID
      if (process.env.NODE_ENV === 'development' && sessionId) {
        const storedPhone = localStorage.getItem('authenticatedPhone');
        if (storedPhone) {
          const user = await getOrCreateUserProfile(storedPhone, sessionId);
          set({ user, isLoading: false });
          return true;
        }
      }
      
      const response = await validateSessionService(sessionId);
      
      if (!response.valid) {
        clearSession();
        set({ user: null, sessionId: null, sessionExpiry: null, isLoading: false });
        return false;
      } else {
        const phone = response.phone_number;
        
        if (!phone) {
          throw new Error('Phone number not found in session');
        }
        
        // Store the authenticated phone for dev mode
        localStorage.setItem('authenticatedPhone', phone);
        
        const user = await getOrCreateUserProfile(phone, sessionId);
        
        set({
          user,
          isLoading: false
        });
        return true;
      }
    } catch (error) {
      console.error('Session validation error:', error);
      // Don't clear the session on error, just return false
      set({ isLoading: false });
      return false;
    }
  },
  
  logout: () => {
    clearSession();
    // Don't remove the rememberMe preference when logging out
    set({ user: null, sessionId: null, sessionExpiry: null, isVerifying: false });
    toast.success('Logged out successfully');
  }
});
