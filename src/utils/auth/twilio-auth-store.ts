
import { create } from 'zustand';
import { toast } from 'sonner';
import { sendOTP as sendOTPService, verifyOTP as verifyOTPService, validateSession as validateSessionService } from '../../api/twilio-service';
import { getOrCreateUserProfile } from './user-profile-service';
import { 
  getStoredSessionId, 
  getStoredSessionExpiry, 
  getRememberMePreference, 
  saveSession, 
  clearSession, 
  isSessionExpired,
  setRememberMePreference
} from './session-service';
import { AuthState, User } from './types';

export const useTwilioAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isVerifying: false,
  error: null,
  phoneNumber: '',
  sessionId: getStoredSessionId(),
  sessionExpiry: getStoredSessionExpiry(),
  rememberMe: getRememberMePreference(),
  
  setPhoneNumber: (phone) => set({ phoneNumber: phone }),
  
  setRememberMe: (remember) => {
    setRememberMePreference(remember);
    set({ rememberMe: remember });
  },
  
  sendOTP: async (phone) => {
    set({ isLoading: true, error: null });
    try {
      const e164Regex = /^\+[1-9]\d{7,14}$/;
      if (!e164Regex.test(phone)) {
        throw new Error('Please enter a valid phone number in international format (e.g., +65XXXXXXXX for Singapore)');
      }
      
      console.log('Attempting to send OTP to:', phone);
      
      const response = await sendOTPService(phone);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to send verification code');
      }
      
      if (response.message.includes('Development mode')) {
        toast.info('Development mode: Using "123456" as verification code');
      } else {
        toast.success('Verification code sent to your phone');
      }
      
      set({ isVerifying: true, phoneNumber: phone });
    } catch (error: any) {
      console.error('Send OTP error:', error);
      set({ error: error.message || 'Failed to send verification code' });
      toast.error(error.message || 'Failed to send verification code');
    } finally {
      set({ isLoading: false });
    }
  },
  
  verifyOTP: async (phone, code) => {
    set({ isLoading: true, error: null });
    try {
      const response = await verifyOTPService(phone, code);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to verify code');
      }
      
      if (response.session_id) {
        const { sessionId, sessionExpiry } = saveSession(
          response.session_id, 
          get().rememberMe,
          phone
        );
        
        const user = await getOrCreateUserProfile(phone, response.session_id);
        
        set({
          user,
          sessionId,
          sessionExpiry,
          isVerifying: false,
          isLoading: false
        });
        
        return user;
      } else {
        throw new Error('No session ID received after verification');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      set({ error: error.message || 'Failed to verify code', isLoading: false });
      toast.error(error.message || 'Failed to verify code');
      return null;
    }
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
  },
  
  clearError: () => set({ error: null }),
  
  setLoginUser: (user) => {
    // Add null check and default values
    if (!user) {
      console.error('setLoginUser called with null or undefined user');
      return;
    }
    
    const phone = user.phone || '';
    
    // Store the authenticated phone for dev mode
    if (phone) {
      localStorage.setItem('authenticatedPhone', phone);
    }
    
    set({
      user: {
        id: user.id || '',
        phone: phone,
        profile_type: user.profile_type || 'user'
      },
      isVerifying: false
    });
  },
  
  setAuthUser: (user) => {
    // Add null check and default values
    if (!user) {
      console.error('setAuthUser called with null or undefined user');
      return;
    }
    
    const phone = user.phone || '';
    
    // Store the authenticated phone for dev mode
    if (phone) {
      localStorage.setItem('authenticatedPhone', phone);
    }
    
    set({
      user: {
        id: user.id || '',
        phone: phone,
        profile_type: user.profile_type || 'user'
      },
      isVerifying: false
    });
  }
}));
