
export interface AuthState {
  phone: string;
  otp: string;
  otpSent: boolean;
  loading: boolean;
  error: string | null;
  requestId: string | null;
  rememberMe: boolean;
  captchaVerified: boolean;
  captchaError: string | null;
  devMode: boolean;
}

export interface UseAuthReturn {
  state: AuthState;
  updateState: (updates: Partial<AuthState>) => void;
  handleSendOTP: () => Promise<void>;
  handleVerifyOTP: () => Promise<any>;
  handleToggleDevMode: () => void;
  resetToPhoneInput: () => void;
  handleOTPSuccess: (sessionId: string, userData: any) => void;
}
