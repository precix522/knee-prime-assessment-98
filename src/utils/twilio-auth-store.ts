import { create } from 'zustand';
import brain from 'brain';

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
      
      // Send OTP through our Twilio API
      const response = await brain.send_otp({
        phone_number: phone
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to send verification code');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to send verification code');
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
      // Call our custom verify OTP endpoint
      const response = await brain.verify_otp({
        phone_number: phone,
        otp_code: code
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to verify code');
      }
      
      const data = await response.json();
      
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
      } else {
        throw new Error('No session ID received after verification');
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to verify code' });
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
      
      // Validate the session with our backend
      const response = await brain.validate_session({
        session_id: sessionId
      });
      
      if (!response.ok) {
        throw new Error('Failed to validate session');
      }
      
      const data = await response.json();
      
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
  },
  
  clearError: () => set({ error: null })
}));
// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
// import { toast } from 'sonner';

// // Define the User interface
// interface User {
//   id: string;
//   phone: string;
//   name?: string;
// }

// // Define the auth store interface
// interface TwilioAuthState {
//   user: User | null;
//   isLoading: boolean;
//   isVerifying: boolean;
//   error: string | null;
//   phoneNumber: string;
  
//   // Auth methods
//   login: (user: User) => Promise<void>;
//   logout: () => Promise<void>;
//   sendOTP: (phone: string) => Promise<void>;
//   verifyOTP: (phone: string, code: string) => Promise<void>;
//   validateSession: () => Promise<boolean>;
//   clearError: () => void;
// }

// // Create the auth store with persistence
// export const useTwilioAuthStore = create<TwilioAuthState>()(
//   persist(
//     (set, get) => ({
//       user: null,
//       isLoading: false,
//       isVerifying: false,
//       error: null,
//       phoneNumber: "",
      
//       login: async (user: User) => {
//         set({ isLoading: true, error: null });
//         try {
//           // In a real app, this would call an API to verify login
//           // For demo purposes, we'll just set the user directly
          
//           // Simulate API delay
//           await new Promise(resolve => setTimeout(resolve, 1000));
          
//           set({ user });
//         } catch (error) {
//           set({ error: error instanceof Error ? error.message : "Login failed" });
//         } finally {
//           set({ isLoading: false });
//         }
//       },
      
//       logout: async () => {
//         set({ isLoading: true, error: null });
//         try {
//           // In a real app, this would call an API to logout
//           // Simulate API delay
//           await new Promise(resolve => setTimeout(resolve, 1000));
          
//           set({ user: null, isVerifying: false, phoneNumber: "" });
//         } catch (error) {
//           set({ error: error instanceof Error ? error.message : "Logout failed" });
//         } finally {
//           set({ isLoading: false });
//         }
//       },
      
//       sendOTP: async (phone: string) => {
//         set({ isLoading: true, error: null });
//         try {
//           // Make a request to your backend API that will interact with Twilio
//           const response = await fetch('/api/send-verification', {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ phone }),
//           });
          
//           const data = await response.json();
          
//           if (!response.ok) {
//             throw new Error(data.message || 'Failed to send verification code');
//           }
          
//           console.log(`OTP code sent to ${phone}`);
//           toast.success('Verification code sent to your phone');
          
//           // Update state to reflect OTP was sent
//           set({ isVerifying: true, phoneNumber: phone });
//         } catch (error) {
//           console.error('Error sending OTP:', error);
//           const errorMessage = error instanceof Error ? error.message : "Failed to send verification code";
//           set({ error: errorMessage });
//           toast.error(errorMessage);
//         } finally {
//           set({ isLoading: false });
//         }
//       },
      
//       verifyOTP: async (phone: string, code: string) => {
//         set({ isLoading: true, error: null });
//         try {
//           // Make a request to your backend API that will interact with Twilio to verify the code
//           const response = await fetch('/api/verify-code', {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ phone, code }),
//           });
          
//           const data = await response.json();
          
//           if (!response.ok) {
//             throw new Error(data.message || 'Verification failed');
//           }
          
//           if (data.valid) {
//             // Create user after successful verification
//             const user: User = {
//               id: data.userId || "user_" + Date.now(),
//               phone: phone,
//               name: data.name || "User"
//             };
            
//             // Log the user in
//             set({ user, isVerifying: false });
//             toast.success('Phone verified successfully');
//             return;
//           } else {
//             throw new Error('Invalid verification code. Please try again.');
//           }
//         } catch (error) {
//           console.error('Error verifying OTP:', error);
//           const errorMessage = error instanceof Error ? error.message : "Verification failed";
//           set({ error: errorMessage });
//           toast.error(errorMessage);
//         } finally {
//           set({ isLoading: false });
//         }
//       },
      
//       validateSession: async () => {
//         const { user } = get();
        
//         // In a real app, this would validate the session with server
//         // For demo, we'll just check if we have a user in the store
        
//         // Simulate short delay
//         await new Promise(resolve => setTimeout(resolve, 300));
        
//         return !!user;
//       },
      
//       clearError: () => {
//         set({ error: null });
//       }
//     }),
//     {
//       name: 'twilio-auth-storage',
//     }
//   )
// );
