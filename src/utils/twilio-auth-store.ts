
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
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
}

// Create the auth store with persistence
export const useTwilioAuthStore = create<TwilioAuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      
      login: async (user: User) => {
        set({ isLoading: true });
        try {
          // In a real app, this would call an API to verify login
          // For demo purposes, we'll just set the user directly
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({ user });
        } finally {
          set({ isLoading: false });
        }
      },
      
      logout: async () => {
        set({ isLoading: true });
        try {
          // In a real app, this would call an API to logout
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({ user: null });
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'twilio-auth-storage',
    }
  )
);
