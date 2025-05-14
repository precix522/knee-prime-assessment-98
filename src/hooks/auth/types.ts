
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

export interface AuthActions {
  updateState: (updates: Partial<AuthState>) => void;
  resetToPhoneInput: () => void;
  handleSendOTP: () => Promise<void>;
  handleVerifyOTP: () => Promise<void>;
  handleToggleDevMode: () => void;
  handleOTPSuccess: (sessionId: string, userData: any) => Promise<void>;
}

export type UseAuthReturn = {
  state: AuthState;
} & AuthActions;
