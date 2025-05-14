
import { create } from 'zustand';
import { AuthState } from './types';
import { createSessionState } from './auth-session';
import { createOtpState } from './auth-otp';
import { createUserState } from './user-state';

export const useTwilioAuthStore = create<AuthState>((set, get) => ({
  ...createSessionState(set, get),
  ...createOtpState(set, get),
  ...createUserState(set),
  
  // Common state
  error: null,
  isLoading: true,
  
  // Developer mode state
  devMode: false
}));
