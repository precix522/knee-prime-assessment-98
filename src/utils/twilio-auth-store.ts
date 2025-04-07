import { create } from 'zustand';
import { toast } from 'sonner';
import { sendOTP as sendOTPService, verifyOTP as verifyOTPService, validateSession as validateSessionService } from '../api/twilio-service';

interface User {
  id: string;
  phone: string;
  profile_type?: string; // Add profile_type to track user role
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isVerifying: boolean;
  error: string | null;
  phoneNumber: string;
  sessionId: string | null;
  sessionExpiry: number | null;
  
  // Auth methods
  setPhoneNumber: (phone: string) => void;
  sendOTP: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, code: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  validateSession: () => Promise<boolean>;
}

// Define response types for API responses
interface OTPResponse {
  success: boolean;
  message: string;
}

interface VerifyOTPResponse {
  success: boolean;
  message: string;
  session_id: string;
}

interface ValidateSessionResponse {
  valid: boolean;
  phone_number: string | null;
}

// Session expiration time in milliseconds (2 hours)
const SESSION_EXPIRY_TIME = 2 * 60 * 60 * 1000;

export const useTwilioAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isVerifying: false,
  error: null,
  phoneNumber: '',
  sessionId: localStorage.getItem('gator_prime_session_id'),
  sessionExpiry: Number(localStorage.getItem('gator_prime_session_expiry')) || null,
  
  setPhoneNumber: (phone) => set({ phoneNumber: phone }),
  
  sendOTP: async (phone) => {
    set({ isLoading: true, error: null });
    try {
      // Validate phone number format
      const e164Regex = /^\+[1-9]\d{7,14}$/;
      if (!e164Regex.test(phone)) {
        throw new Error('Please enter a valid phone number in international format (e.g., +65XXXXXXXX for Singapore)');
      }
      
      console.log('Attempting to send OTP to:', phone);
      
      // Use the service function directly instead of API route
      const response = await sendOTPService(phone);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to send verification code');
      }
      
      // Show message about development mode if present
      if (response.message.includes('Development mode')) {
        toast.info('Development mode: Using "123456" as verification code');
      } else {
        // Show success toast
        toast.success('Verification code sent to your phone');
      }
      
      // If successful, set isVerifying to true to show OTP input
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
      // Use the service function directly instead of API route
      const response = await verifyOTPService(phone, code);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to verify code');
      }
      
      // If verification successful, create a user object and store session
      if (response.session_id) {
        // Calculate expiry time (current time + 2 hours)
        const expiryTime = Date.now() + SESSION_EXPIRY_TIME;
        
        // Store the session ID and expiry time in localStorage
        localStorage.setItem('gator_prime_session_id', response.session_id);
        localStorage.setItem('gator_prime_session_expiry', expiryTime.toString());
        
        // Determine user profile type based on phone number (for demo purposes)
        // In a real app, this would come from a database lookup
        const profile_type = phone === '+6596739493' ? 'admin' : 'user';
        
        set({
          user: {
            id: response.session_id,
            phone: phone,
            profile_type: profile_type
          },
          sessionId: response.session_id,
          sessionExpiry: expiryTime,
          isVerifying: false
        });
        
        // Show success toast
        toast.success('Verification successful!');
      } else {
        throw new Error('No session ID received after verification');
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to verify code' });
      toast.error(error.message || 'Failed to verify code');
    } finally {
      set({ isLoading: false });
    }
  },
  
  validateSession: async () => {
    const sessionId = get().sessionId || localStorage.getItem('gator_prime_session_id');
    const sessionExpiry = Number(localStorage.getItem('gator_prime_session_expiry')) || null;
    
    // Check if session exists
    if (!sessionId) {
      set({ user: null, isLoading: false });
      return false;
    }
    
    // Check if session has expired
    if (sessionExpiry && Date.now() > sessionExpiry) {
      // Session expired, clear it
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
      
      // Use the service function directly instead of API route
      const response = await validateSessionService(sessionId);
      
      if (!response.valid) {
        // Session is invalid
        localStorage.removeItem('gator_prime_session_id');
        localStorage.removeItem('gator_prime_session_expiry');
        set({ user: null, sessionId: null, sessionExpiry: null, isLoading: false });
        return false;
      } else {
        // Determine profile type based on phone number (for demo purposes)
        // In a real app, this would come from a database lookup
        const profile_type = response.phone_number === '+6596739493' ? 'admin' : 'user';
        
        // Session is valid
        set({
          user: {
            id: sessionId,
            phone: response.phone_number,
            profile_type: profile_type
          },
          isLoading: false
        });
        return true;
      }
    } catch (error) {
      console.error('Session validation error:', error);
      localStorage.removeItem('gator_prime_session_id');
      localStorage.removeItem('gator_prime_session_expiry');
      set({ user: null, sessionId: null, sessionExpiry: null, isLoading: false, error: 'Session expired. Please log in again.' });
      return false;
    }
  },
  
  logout: () => {
    localStorage.removeItem('gator_prime_session_id');
    localStorage.removeItem('gator_prime_session_expiry');
    set({ user: null, sessionId: null, sessionExpiry: null, isVerifying: false });
    toast.success('Logged out successfully');
  },
  
  clearError: () => set({ error: null })
}));
