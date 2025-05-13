
export interface User {
  id: string;
  phone: string;
  profile_type?: string; // Profile type from database
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isVerifying: boolean;
  error: string | null;
  phoneNumber: string;
  sessionId: string | null;
  sessionExpiry: number | null;
  rememberMe: boolean;
  
  setPhoneNumber: (phone: string) => void;
  setRememberMe: (remember: boolean) => void;
  sendOTP: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, code: string) => Promise<User | null>; 
  logout: () => void;
  clearError: () => void;
  validateSession: () => Promise<boolean>;
  
  setLoginUser: (user: any) => void;
  setAuthUser: (user: any) => void;
}

export interface UserProfile {
  id: string;
  phone: string;
  profile_type?: string;
  created_at?: string;
  updated_at?: string;
}
