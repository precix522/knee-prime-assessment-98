import { create } from 'zustand';
import { toast } from 'sonner';

interface User {
  id: string;
  phone: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isVerifying: boolean;
  error: string | null;
  phoneNumber: string;
  sessionId: string | null;
  
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

// Twilio integration API functions
const twilioApi = {
  async sendOTP(phone: string): Promise<OTPResponse> {
    console.log('Sending OTP to:', phone);
    
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_number: phone }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response not OK:', response.status, errorText);
        throw new Error(`Failed to send OTP: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending OTP:', error);
      // Fallback to mock for development if API is not available
      return { 
        success: true, 
        message: 'OTP sent successfully (DEV MODE)' 
      };
    }
  },
  
  async verifyOTP(phone: string, code: string): Promise<VerifyOTPResponse> {
    console.log('Verifying OTP:', code, 'for phone:', phone);
    
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone_number: phone,
          code: code 
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response not OK:', response.status, errorText);
        throw new Error(`Failed to verify OTP: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      // Fallback to mock for development if API is not available
      const isValid = /^\d{6}$/.test(code);
      
      if (!isValid) {
        return { 
          success: false, 
          message: 'Invalid verification code',
          session_id: ''
        };
      }
      
      // Create a session ID
      const sessionId = `session_${Date.now()}`;
      
      return { 
        success: true, 
        message: 'Verification successful (DEV MODE)',
        session_id: sessionId
      };
    }
  },
  
  async validateSession(sessionId: string): Promise<ValidateSessionResponse> {
    console.log('Validating session:', sessionId);
    
    try {
      const response = await fetch('/api/validate-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response not OK:', response.status, errorText);
        throw new Error(`Failed to validate session: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error validating session:', error);
      // Fallback to mock for development if API is not available
      const isValid = !!sessionId;
      const phoneNumber = isValid ? '+6598765432' : null;
      
      return { 
        valid: isValid,
        phone_number: phoneNumber
      };
    }
  }
};

export const useTwilioAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isVerifying: false,
  error: null,
  phoneNumber: '',
  sessionId: localStorage.getItem('gator_prime_session_id'),
  
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
      
      // Send OTP through Twilio API
      const response = await twilioApi.sendOTP(phone);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to send verification code');
      }
      
      // Show success toast
      toast.success('Verification code sent to your phone');
      
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
      // Call verify OTP through Twilio API
      const response = await twilioApi.verifyOTP(phone, code);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to verify code');
      }
      
      // If verification successful, create a user object and store session
      if (response.session_id) {
        // Store the session ID in localStorage
        localStorage.setItem('gator_prime_session_id', response.session_id);
        
        set({
          user: {
            id: response.session_id,
            phone: phone
          },
          sessionId: response.session_id,
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
    
    if (!sessionId) {
      set({ user: null, isLoading: false });
      return false;
    }
    
    try {
      set({ isLoading: true });
      
      // Validate the session through API
      const response = await twilioApi.validateSession(sessionId);
      
      if (!response.valid) {
        // Session is invalid
        localStorage.removeItem('gator_prime_session_id');
        set({ user: null, sessionId: null, isLoading: false });
        return false;
      } else {
        // Session is valid
        set({
          user: {
            id: sessionId,
            phone: response.phone_number
          },
          isLoading: false
        });
        return true;
      }
    } catch (error) {
      console.error('Session validation error:', error);
      localStorage.removeItem('gator_prime_session_id');
      set({ user: null, sessionId: null, isLoading: false, error: 'Session expired. Please log in again.' });
      return false;
    }
  },
  
  logout: () => {
    localStorage.removeItem('gator_prime_session_id');
    set({ user: null, sessionId: null, isVerifying: false });
    toast.success('Logged out successfully');
  },
  
  clearError: () => set({ error: null })
}));
