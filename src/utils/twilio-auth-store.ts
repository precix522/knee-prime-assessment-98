
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the User interface
interface User {
  id: string;
  phone: string;
  name?: string;
}

// Define the auth store interface
interface TwilioAuthState {
  user: User | null;
  isLoading: boolean;
  isVerifying: boolean;
  error: string | null;
  phoneNumber: string;
  
  // Auth methods
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  sendOTP: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, code: string) => Promise<void>;
  validateSession: () => Promise<boolean>;
  clearError: () => void;
}

// Create the auth store with persistence
export const useTwilioAuthStore = create<TwilioAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isVerifying: false,
      error: null,
      phoneNumber: "",
      
      login: async (user: User) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would call an API to verify login
          // For demo purposes, we'll just set the user directly
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({ user });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Login failed" });
        } finally {
          set({ isLoading: false });
        }
      },
      
      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would call an API to logout
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({ user: null, isVerifying: false, phoneNumber: "" });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Logout failed" });
        } finally {
          set({ isLoading: false });
        }
      },
      
      sendOTP: async (phone: string) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would call a Twilio API to send OTP
          // For demo purposes, we'll just simulate the API delay
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // In a real implementation, this would be successful response from Twilio
          console.log(`OTP code would be sent to ${phone} in a real implementation`);
          
          // Update state to reflect OTP was sent
          set({ isVerifying: true, phoneNumber: phone });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Failed to send verification code" });
        } finally {
          set({ isLoading: false });
        }
      },
      
      verifyOTP: async (phone: string, code: string) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would call a Twilio API to verify OTP
          // For demo purposes, we'll just simulate the API delay and successful verification
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Simple validation - in a real app this would check with Twilio
          if (code === "123456" || code.length === 6) { // Accept any 6-digit code for demo
            // Mock successful login after verification
            const user: User = {
              id: "user_" + Date.now(),
              phone: phone,
              name: "Test User"
            };
            
            // Log the user in
            set({ user, isVerifying: false });
            return;
          }
          
          // If code doesn't match, throw error
          throw new Error("Invalid verification code. Please try again.");
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Verification failed" });
        } finally {
          set({ isLoading: false });
        }
      },
      
      validateSession: async () => {
        const { user } = get();
        
        // In a real app, this would validate the session with server
        // For demo, we'll just check if we have a user in the store
        
        // Simulate short delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return !!user;
      },
      
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'twilio-auth-storage',
    }
  )
);
