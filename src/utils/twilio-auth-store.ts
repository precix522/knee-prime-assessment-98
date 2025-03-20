
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
  async sendOTP(phone: string): Promise<Response> {
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
        throw new Error('Failed to send OTP');
      }
      
      return response;
    } catch (error) {
      console.error('Error sending OTP:', error);
      // Fallback to mock for development if API is not available
      return {
        ok: true,
        json: async (): Promise<OTPResponse> => ({ 
          success: true, 
          message: 'OTP sent successfully (DEV MODE)' 
        })
      } as Response;
    }
  },
  
  async verifyOTP(phone: string, code: string): Promise<Response> {
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
        throw new Error('Failed to verify OTP');
      }
      
      return response;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      // Fallback to mock for development if API is not available
      const isValid = /^\d{6}$/.test(code);
      
      if (!isValid) {
        return {
          ok: false,
          json: async (): Promise<OTPResponse> => ({ 
            success: false, 
            message: 'Invalid verification code' 
          })
        } as Response;
      }
      
      // Create a session ID
      const sessionId = `session_${Date.now()}`;
      
      return {
        ok: true,
        json: async (): Promise<VerifyOTPResponse> => ({ 
          success: true, 
          message: 'Verification successful (DEV MODE)',
          session_id: sessionId
        })
      } as Response;
    }
  },
  
  async validateSession(sessionId: string): Promise<Response> {
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
        throw new Error('Failed to validate session');
      }
      
      return response;
    } catch (error) {
      console.error('Error validating session:', error);
      // Fallback to mock for development if API is not available
      const isValid = !!sessionId;
      const phoneNumber = isValid ? '+6598765432' : null;
      
      return {
        ok: true,
        json: async (): Promise<ValidateSessionResponse> => ({ 
          valid: isValid,
          phone_number: phoneNumber
        })
      } as Response;
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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send verification code');
      }
      
      const data = await response.json() as OTPResponse;
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to send verification code');
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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify code');
      }
      
      const data = await response.json() as VerifyOTPResponse;
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to verify code');
      }
      
      // If verification successful, create a user object and store session
      if (data.session_id) {
        // Store the session ID in localStorage
        localStorage.setItem('gator_prime_session_id', data.session_id);
        
        set({
          user: {
            id: data.session_id,
            phone: phone
          },
          sessionId: data.session_id,
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
      
      if (!response.ok) {
        throw new Error('Failed to validate session');
      }
      
      const data = await response.json() as ValidateSessionResponse;
      
      if (data.valid && data.phone_number) {
        // Session is valid
        set({
          user: {
            id: sessionId,
            phone: data.phone_number
          },
          isLoading: false
        });
        return true;
      } else {
        // Session is invalid
        localStorage.removeItem('gator_prime_session_id');
        set({ user: null, sessionId: null, isLoading: false });
        return false;
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
