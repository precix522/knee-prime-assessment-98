
export interface User {
  id: string;
  phone: string;
  profile_type?: string;
  [key: string]: any;
}

export interface UserProfile {
  id: string;
  phone?: string;
  profile_type?: string;
  [key: string]: any;
}

// Combined state from all auth modules
export interface AuthState {
  // User state
  user: User | null;
  clearError: () => void;
  setLoginUser: (user: User) => void;
  setAuthUser: (user: User) => void;
  
  // Session state
  sessionId: string | null;
  sessionExpiry: string | null;
  rememberMe: boolean;
  setRememberMe: (remember: boolean) => void;
  validateSession: () => Promise<boolean>;
  logout: () => void;
  
  // OTP state
  phoneNumber: string;
  isVerifying: boolean;
  setPhoneNumber: (phone: string) => void;
  sendOTP: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, code: string) => Promise<User | null>;
  
  // Common state
  isLoading: boolean;
  error: string | null;
}
