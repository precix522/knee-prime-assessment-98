
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import { getUserProfileByPhone, createUserProfile } from "../utils/supabase/user-db";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

export interface AuthState {
  phone: string;
  otp: string;
  otpSent: boolean;
  loading: boolean;
  error: string | null;
  requestId: string | null;
  devMode: boolean;
  rememberMe: boolean;
  captchaVerified: boolean;
  captchaError: string | null;
}

export function useAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { verifyOTP, validateSession, setAuthUser, setLoginUser } = useTwilioAuthStore();
  
  const [state, setState] = useState<AuthState>({
    phone: localStorage.getItem('rememberedPhone') || "",
    otp: "",
    otpSent: false,
    loading: false,
    error: null,
    requestId: null,
    devMode: false,
    rememberMe: !!localStorage.getItem('rememberedPhone'),
    captchaVerified: false,
    captchaError: null
  });

  const updateState = (updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleSendOTP = async () => {
    if (!state.phone) {
      updateState({ error: "Please enter your phone number." });
      toast({
        title: "Error",
        description: "Please enter your phone number.",
        variant: "destructive",
      });
      return;
    }

    if (!state.captchaVerified && !state.devMode) {
      updateState({ captchaError: "Please verify that you are human." });
      toast({
        title: "Error",
        description: "Please complete the captcha verification.",
        variant: "destructive",
      });
      return;
    }

    updateState({ loading: true, error: null });
    try {
      if (state.devMode) {
        console.log("Dev mode: Simulating OTP sent to", state.phone);
        updateState({ otpSent: true });
        toast({
          title: "Success",
          description: "Dev mode: OTP code is 123456",
        });
      } else {
        // Send OTP via API route
        const formattedPhone = state.phone.startsWith('+') ? state.phone : `+${state.phone}`;
        
        const response = await fetch('/api/send-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phone_number: formattedPhone }),
        });
        
        const result = await response.json();
        
        if (!result.success) {
          updateState({ error: result.message || "Failed to send OTP. Please try again." });
          toast({
            title: "Error",
            description: result.message || "Failed to send OTP. Please try again.",
            variant: "destructive",
          });
          return;
        }
        
        // For Vonage, store request_id for verification
        if (result.request_id) {
          updateState({ requestId: result.request_id });
        }
        
        updateState({ otpSent: true });
        toast({
          title: "Success",
          description: "OTP sent to your phone number.",
        });
      }
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      updateState({ error: error.message || "Failed to send OTP. Please try again." });
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      updateState({ loading: false });
    }
  };

  const handleVerifyOTP = async () => {
    if (!state.otp) {
      updateState({ error: "Please enter the OTP." });
      toast({
        title: "Error",
        description: "Please enter the OTP.",
        variant: "destructive",
      });
      return;
    }

    updateState({ loading: true, error: null });
    try {
      if (state.devMode) {
        console.log("Dev mode: Simulating OTP verification for", state.phone);
        
        let userProfile;
        try {
          const formattedPhone = state.phone.startsWith('+') ? state.phone : `+${state.phone}`;
          userProfile = await getUserProfileByPhone(formattedPhone);
          
          console.log("Retrieved user profile in dev mode:", userProfile);
          
          if (!userProfile) {
            const altPhone = state.phone.startsWith('+') ? state.phone.substring(1) : `+${state.phone}`;
            userProfile = await getUserProfileByPhone(altPhone);
            console.log("Retrieved user profile with alt format:", userProfile);
          }
        } catch (profileError) {
          console.error("Error fetching user profile:", profileError);
        }
        
        if (!userProfile) {
          const mockUser = {
            id: "dev-user-id-" + Date.now(),
            phone: state.phone.startsWith('+') ? state.phone : `+${state.phone}`,
            profile_type: "patient",
            created_at: new Date().toISOString(),
            name: "Dev Patient",
            email: "patient@example.com"
          };
          
          console.log("Using mock user in dev mode:", mockUser);
          userProfile = mockUser;
        }
        
        setLoginUser(userProfile);
        handleOTPSuccess(userProfile);
        toast({
          title: "Success",
          description: "Dev mode: OTP verified successfully.",
        });
      } else {
        // Verify OTP via API route or direct call
        if (state.requestId) {
          // Use Vonage verification
          try {
            const response = await fetch('/api/verify-otp', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                request_id: state.requestId,
                code: state.otp
              }),
            });
            
            const result = await response.json();
            
            if (!result.success) {
              updateState({ error: result.message || "Failed to verify OTP. Please try again." });
              toast({
                title: "Error",
                description: result.message || "Failed to verify OTP. Please try again.",
                variant: "destructive",
              });
              return;
            }
            
            // Look up user profile
            const formattedPhone = state.phone.startsWith('+') ? state.phone : `+${state.phone}`;
            let userProfile = await getUserProfileByPhone(formattedPhone);
            
            if (!userProfile) {
              try {
                userProfile = await createUserProfile(formattedPhone, "patient");
              } catch (createError) {
                console.error("Error creating user profile:", createError);
                userProfile = {
                  id: "user-" + Date.now(),
                  phone: formattedPhone,
                  profile_type: "patient",
                  created_at: new Date().toISOString(),
                  name: "",
                  email: ""
                };
              }
            }
            
            setLoginUser(userProfile);
            handleOTPSuccess(userProfile);
            
          } catch (error) {
            console.error("Error verifying OTP:", error);
            updateState({ error: "Failed to verify OTP. Please try again." });
            toast({
              title: "Error",
              description: "Failed to verify OTP. Please try again.",
              variant: "destructive",
            });
          }
        } else {
          // Fallback to Twilio method
          const formattedPhone = state.phone.startsWith('+') ? state.phone : `+${state.phone}`;
          const user = await verifyOTP(formattedPhone, state.otp);
          
          if (!user) {
            updateState({ error: "Failed to verify OTP. Please try again." });
            toast({
              title: "Error",
              description: "Failed to verify OTP. Please try again.",
              variant: "destructive",
            });
            return;
          }
          
          handleOTPSuccess(user);
          toast({
            title: "Success",
            description: "OTP verified successfully.",
          });
        }
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      updateState({ error: error.message || "Failed to verify OTP. Please try again." });
      toast({
        title: "Error",
        description: error.message || "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      updateState({ loading: false });
    }
  };

  const handleOTPSuccess = (user: any) => {
    console.log("OTP success with user:", user);
    
    if (!user) {
      console.error("OTP success called with null or undefined user");
      toast({
        title: "Error",
        description: "User profile not found.",
        variant: "destructive",
      });
      return;
    }
    
    const validUser = {
      id: user.id || `temp-${Date.now()}`,
      phone: user.phone || state.phone,
      profile_type: user.profile_type || 'patient'
    };
    
    if (!localStorage.getItem('gator_prime_session_id')) {
      const sessionId = `session_${Date.now()}`;
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      localStorage.setItem('gator_prime_session_id', sessionId);
      localStorage.setItem('gator_prime_session_expiry', expiryTime.toString());
    }
    
    if (state.rememberMe) {
      localStorage.setItem('rememberedPhone', state.phone);
    } else {
      localStorage.removeItem('rememberedPhone');
    }
    
    setAuthUser(validUser);
    
    if (validUser.profile_type === 'admin') {
      sonnerToast.success("Welcome admin! Redirecting to dashboard...");
      navigate("/dashboard");
    } else if (validUser.profile_type === 'patient') {
      sonnerToast.success("Welcome patient! Redirecting to dashboard...");
      navigate("/dashboard");
    } else {
      sonnerToast.success("Welcome! Redirecting to dashboard...");
      navigate("/dashboard");
    }
  };

  const handleToggleDevMode = () => {
    const newDevMode = !state.devMode;
    updateState({ devMode: newDevMode });
    toast({
      title: newDevMode ? "Developer Mode Enabled" : "Developer Mode Disabled",
      description: newDevMode 
        ? "OTP verification will be bypassed." 
        : "Normal OTP verification will be used.",
    });
  };

  const resetToPhoneInput = () => {
    updateState({ otpSent: false, otp: "", requestId: null });
  };

  return {
    state,
    updateState,
    handleSendOTP,
    handleVerifyOTP,
    handleToggleDevMode,
    resetToPhoneInput,
  };
}
