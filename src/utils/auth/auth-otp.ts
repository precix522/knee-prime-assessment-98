
import { toast } from 'sonner';
import { sendOTP as sendOTPService, verifyOTP as verifyOTPService } from '../../api/twilio-service';
import { getOrCreateUserProfile } from './user-profile-service';
import { saveSession } from './session-service';
import { User } from './types';

export interface OtpState {
  phoneNumber: string;
  isVerifying: boolean;
  
  setPhoneNumber: (phone: string) => void;
  sendOTP: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, code: string) => Promise<User | null>;
}

export const createOtpState = (
  set: Function,
  get: Function
): OtpState => ({
  phoneNumber: '',
  isVerifying: false,
  
  setPhoneNumber: (phone) => set({ phoneNumber: phone }),
  
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
      // Check for dev mode
      const devMode = get().devMode;
      
      // If in dev mode and code is 123456, bypass API verification
      if (devMode && code === '123456') {
        console.log('Dev mode active - bypassing OTP verification with test code');
        
        // Generate a session ID
        const sessionId = `dev_${Date.now()}_${phone.replace(/[^0-9]/g, '')}`;
        
        const { sessionId: storedSessionId, sessionExpiry } = saveSession(
          sessionId, 
          get().rememberMe,
          phone
        );
        
        // Get or create user profile
        const user = await getOrCreateUserProfile(phone, sessionId);
        
        set({
          user,
          sessionId: storedSessionId,
          sessionExpiry,
          isVerifying: false,
          isLoading: false
        });
        
        toast.success('Development mode: Login successful');
        return user;
      }
      
      // Regular verification flow
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
  }
});
