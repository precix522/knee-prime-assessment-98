
import { create } from 'zustand';
import { toast } from 'sonner';
import { sendOTP as sendOTPService, verifyOTP as verifyOTPService, validateSession as validateSessionService } from '../api/twilio-service';
import { getUserProfileByPhone, createUserProfile, UserProfile } from './supabase';

interface User {
  id: string;
  phone: string;
  profile_type?: string; // Profile type from database
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isVerifying: boolean;
  error: string | null;
  phoneNumber: string;
  sessionId: string | null;
  sessionExpiry: number | null;
  rememberMe: boolean;
  
  setPhoneNumber: (phone: string) => void;
  setRememberMe: (remember: boolean) => void;
  sendOTP: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, code: string) => Promise<User | null>; 
  logout: () => void;
  clearError: () => void;
  validateSession: () => Promise<boolean>;
  
  setLoginUser: (user: any) => void;
  setAuthUser: (user: any) => void;
}

// Default session duration: 2 hours
const DEFAULT_SESSION_EXPIRY_TIME = 2 * 60 * 60 * 1000;
// Extended session duration: 30 days
const EXTENDED_SESSION_EXPIRY_TIME = 30 * 24 * 60 * 60 * 1000;

export const useTwilioAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isVerifying: false,
  error: null,
  phoneNumber: '',
  sessionId: localStorage.getItem('gator_prime_session_id'),
  sessionExpiry: Number(localStorage.getItem('gator_prime_session_expiry')) || null,
  rememberMe: localStorage.getItem('gator_prime_remember_me') === 'true',
  
  setPhoneNumber: (phone) => set({ phoneNumber: phone }),
  
  setRememberMe: (remember) => {
    localStorage.setItem('gator_prime_remember_me', remember.toString());
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
        // Use the extended session time if rememberMe is true
        const expiryTime = Date.now() + (get().rememberMe 
          ? EXTENDED_SESSION_EXPIRY_TIME 
          : DEFAULT_SESSION_EXPIRY_TIME);
        
        localStorage.setItem('gator_prime_session_id', response.session_id);
        localStorage.setItem('gator_prime_session_expiry', expiryTime.toString());
        
        console.log('Fetching user profile for phone:', phone);
        let userProfile: UserProfile | null = await getUserProfileByPhone(phone);
        
        console.log('User profile from database:', userProfile);
        
        if (!userProfile) {
          console.log('Creating new user profile for phone:', phone);
          userProfile = await createUserProfile(phone, 'user');
          console.log('Created new user profile:', userProfile);
        }
        
        const profile_type = userProfile?.profile_type || 'user';
        console.log('User profile type:', profile_type);
        
        const user = {
          id: userProfile?.id || response.session_id,
          phone: phone,
          profile_type: profile_type
        };
        
        set({
          user,
          sessionId: response.session_id,
          sessionExpiry: expiryTime,
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
    const sessionId = get().sessionId || localStorage.getItem('gator_prime_session_id');
    const sessionExpiry = Number(localStorage.getItem('gator_prime_session_expiry')) || null;
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
    
    if (sessionExpiry && Date.now() > sessionExpiry) {
      localStorage.removeItem('gator_prime_session_id');
      localStorage.removeItem('gator_prime_session_expiry');
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
          const userProfile = await getUserProfileByPhone(storedPhone);
          if (userProfile) {
            const user = {
              id: userProfile.id,
              phone: storedPhone,
              profile_type: userProfile.profile_type || 'user'
            };
            set({ user, isLoading: false });
            return true;
          }
        }
      }
      
      const response = await validateSessionService(sessionId);
      
      if (!response.valid) {
        localStorage.removeItem('gator_prime_session_id');
        localStorage.removeItem('gator_prime_session_expiry');
        set({ user: null, sessionId: null, sessionExpiry: null, isLoading: false });
        return false;
      } else {
        const phone = response.phone_number;
        
        if (!phone) {
          throw new Error('Phone number not found in session');
        }
        
        // Store the authenticated phone for dev mode
        localStorage.setItem('authenticatedPhone', phone);
        
        const userProfile = await getUserProfileByPhone(phone);
        const profile_type = userProfile?.profile_type || 'user';
        
        set({
          user: {
            id: userProfile?.id || sessionId,
            phone: phone,
            profile_type: profile_type
          },
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
    localStorage.removeItem('gator_prime_session_id');
    localStorage.removeItem('gator_prime_session_expiry');
    localStorage.removeItem('authenticatedPhone');
    // Don't remove the rememberMe preference when logging out
    set({ user: null, sessionId: null, sessionExpiry: null, isVerifying: false });
    toast.success('Logged out successfully');
  },
  
  clearError: () => set({ error: null }),
  
  setLoginUser: (user) => {
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
