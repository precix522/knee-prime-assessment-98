
import { create } from 'zustand';
import { supabase } from './supabase';

interface User {
  id: string;
  phone: string;
  [key: string]: any; // For additional user data
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isVerifying: boolean;
  error: string | null;
  phoneNumber: string;
  
  // Auth methods
  setPhoneNumber: (phone: string) => void;
  sendOTP: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  validateSession: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true, // Start as true since we're checking session on init
  isVerifying: false,
  error: null,
  phoneNumber: '',
  
  validateSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (data.session) {
        // User is logged in
        set({
          user: {
            id: data.session.user.id,
            phone: data.session.user.phone || '',
            ...data.session.user
          },
          isLoading: false
        });
        return true;
      } else {
        // No active session
        set({ user: null, isLoading: false });
        return false;
      }
    } catch (error: any) {
      console.error('Error validating session:', error.message);
      set({ user: null, isLoading: false, error: 'Failed to validate session' });
      return false;
    }
  },
  
  setPhoneNumber: (phone) => set({ phoneNumber: phone }),
  
  sendOTP: async (phone) => {
    set({ isLoading: true, error: null });
    try {
      // Validate phone number format (modified to accommodate Singapore's 8-digit number with +65 prefix)
      const e164Regex = /^\+[1-9]\d{7,14}$/; // Changed to accept min 7 digits after country code
      if (!e164Regex.test(phone)) {
        throw new Error('Please enter a valid phone number in international format (e.g., +65XXXXXXXX for Singapore)');
      }
      
      console.log('Attempting to send OTP to:', phone);
      
      // Send OTP to the provided phone number
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          shouldCreateUser: true, // Create a new user if they don't exist
          channel: 'sms' // Explicitly specify SMS channel
        }
      });
      
      if (error) {
        console.error('Supabase OTP error:', error);
        throw error;
      }
      
      // If successful, set isVerifying to true to show OTP input
      set({ isVerifying: true, phoneNumber: phone });
    } catch (error: any) {
      console.error('Send OTP error:', error);
      set({ error: error.message || 'Failed to send verification code' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  verifyOTP: async (phone, code) => {
    set({ isLoading: true, error: null });
    try {
      // Verify the OTP code
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: code,
        type: 'sms'
      });
      
      if (error) throw error;
      
      // If verified, set the user data
      if (data?.user) {
        set({
          user: {
            id: data.user.id,
            phone: phone,
            ...data.user
          },
          isVerifying: false
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to verify code' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null });
    } catch (error: any) {
      set({ error: error.message || 'Failed to log out' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  clearError: () => set({ error: null })
}));
