
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';

// User interface
export interface User {
  id: string;
  email: string;
  role?: string;
}

// Authentication store interface
interface AuthState {
  user: User | null;
  session: any | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: any | null) => void;
  logout: () => Promise<void>;
}

// Create the auth store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setSession: (session) => set({ session }),
      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
