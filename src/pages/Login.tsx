import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import { Button } from "../components/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Icons } from "../components/Icons";
import { Separator } from "@/components/ui/separator";
import { supabase } from "../utils/supabase";
import { getUserProfileByPhone, createUserProfile } from "../utils/supabase/user-db";
import { RememberMeCheckbox } from "../components/auth/RememberMeCheckbox";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Navbar } from "../components/Navbar";
import { CaptchaVerification } from "../components/auth/CaptchaVerification";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionVerified, setSessionVerified] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null); // For Vonage verification
  const { verifyOTP, validateSession, setAuthUser } = useTwilioAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientID = searchParams.get("patientId");
  
  useEffect(() => {
    const storedPhone = localStorage.getItem('rememberedPhone');
    if (storedPhone) {
      setPhone(storedPhone);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const isValid = await validateSession();
        const { user } = useTwilioAuthStore.getState();
        
        console.log('Initial auth check:', isValid, user);
        
        if (isValid && user) {
          handleRedirectBasedOnRole(user);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      }
    };
    
    checkAuthStatus();
  }, [navigate, patientID, validateSession]);

  const handleRedirectBasedOnRole = (user) => {
    console.log('Redirecting based on role:', user.profile_type);
    
    if (user.profile_type === 'admin') {
      toast.success("Welcome admin! Redirecting to dashboard...");
      navigate("/dashboard");
    } else if (user.profile_type === 'patient') {
      toast.success("Welcome patient! Redirecting to dashboard...");
      navigate("/dashboard");
    } else if (patientID) {
      toast.success("Welcome! Redirecting to your report...");
      navigate(`/report-viewer?patientId=${encodeURIComponent(patientID)}`);
    } else {
      toast.success("Welcome! Redirecting to your dashboard...");
      navigate("/dashboard");
    }
  };

  const handleCaptchaVerify = (token: string | null) => {
    if (token) {
      setCaptchaVerified(true);
      setCaptchaError(null);
    } else {
      setCaptchaVerified(false);
      setCaptchaError("Captcha verification failed. Please try again.");
    }
  };

  const handleCaptchaExpire = () => {
    setCaptchaVerified(false);
    setCaptchaError("Captcha has expired. Please verify again.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!phone) {
      setError("Phone number is required.");
      setLoading(false);
      return;
    }

    if (!captchaVerified && !devMode) {
      setCaptchaError("Please verify that you are human.");
      setError("Please complete the captcha verification.");
      setLoading(false);
      return;
    }

    try {
      if (devMode) {
        console.log("Dev mode: Simulating OTP sent to", phone);
        setOtpSent(true);
        toast.success("Dev mode: OTP code is 123456");
      } else {
        // Send OTP via API route
        const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
        
        const response = await fetch('/api/send-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phone_number: formattedPhone }),
        });
        
        const data = await response.json();

        if (!data.success) {
          console.error("Error sending OTP:", data);
          setError(data.message || "Failed to send OTP. Please try again.");
          toast.error(data.message || "Failed to send OTP. Please try again.");
          setLoading(false);
          return;
        }
        
        // For Vonage, store request_id for verification
        if (data.request_id) {
          setRequestId(data.request_id);
        }
        
        console.log("OTP sent successfully:", data);
        setOtpSent(true);
        toast.success("OTP sent successfully!");
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      setError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!otp) {
      setError("OTP is required.");
      setLoading(false);
      return;
    }

    try {
      if (devMode) {
        console.log("Dev mode: Simulating OTP verification for", phone);
        
        let userProfile;
        try {
          const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
          userProfile = await getUserProfileByPhone(formattedPhone);
          console.log("Retrieved user profile in dev mode:", userProfile);
          
          if (!userProfile) {
            const altPhone = phone.startsWith('+') ? phone.substring(1) : `+${phone}`;
            userProfile = await getUserProfileByPhone(altPhone);
            console.log("Retrieved user profile with alt format:", userProfile);
          }
        } catch (profileError) {
          console.error("Error fetching user profile:", profileError);
          try {
            const { data, error } = await supabase
              .from('patient')
              .insert([{
                Patient_ID: `dev-user-${Date.now()}`,
                phone: phone.startsWith('+') ? phone : `+${phone}`,
                profile_type: "patient",
                patient_name: "Dev Patient",
                last_modified_tm: new Date().toLocaleString()
              }])
              .select();
              
            if (!error && data) {
              userProfile = {
                id: data[0].Patient_ID,
                phone: data[0].phone,
                profile_type: data[0].profile_type,
                created_at: data[0].last_modified_tm,
                name: data[0].patient_name
              };
            } else {
              userProfile = {
                id: "dev-user-id",
                phone: phone.startsWith('+') ? phone : `+${phone}`,
                profile_type: "patient",
                created_at: new Date().toISOString(),
                name: "Dev Patient",
                email: "patient@example.com"
              };
            }
          } catch (createError) {
            console.error("Error creating user in patient table:", createError);
            userProfile = {
              id: "dev-user-id",
              phone: phone.startsWith('+') ? phone : `+${phone}`,
              profile_type: "patient",
              created_at: new Date().toISOString(),
              name: "Dev Patient",
              email: "patient@example.com"
            };
          }
        }
        
        if (!userProfile) {
          try {
            userProfile = await createUserProfile(phone, "patient");
          } catch (createError) {
            console.error("Error creating user profile:", createError);
            userProfile = {
              id: "dev-user-id",
              phone: phone.startsWith('+') ? phone : `+${phone}`,
              profile_type: "patient",
              created_at: new Date().toISOString(),
              name: "Dev Patient", 
              email: "patient@example.com"
            };
          }
        }
        
        setAuthUser(userProfile);
        handleOTPSuccess(userProfile);
        
        if (rememberMe) {
          localStorage.setItem('rememberedPhone', phone);
        } else {
          localStorage.removeItem('rememberedPhone');
        }
        
        if (!localStorage.getItem('gator_prime_session_id')) {
          const sessionId = `session_${Date.now()}`;
          const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
          localStorage.setItem('gator_prime_session_id', sessionId);
          localStorage.setItem('gator_prime_session_expiry', expiryTime.toString());
        }
        
        toast.success("Dev mode: Login successful");
      } else {
        // Verify OTP
        if (requestId) {
          // Use Vonage verification
          try {
            const response = await fetch('/api/verify-otp', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                request_id: requestId,
                code: otp
              }),
            });
            
            const result = await response.json();
            
            if (!result.success) {
              setError(result.message || "Failed to verify OTP. Please try again.");
              toast.error(result.message || "Failed to verify OTP. Please try again.");
              setLoading(false);
              return;
            }
            
            // Look up user profile
            const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
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
            
            setAuthUser(userProfile);
            
            if (rememberMe) {
              localStorage.setItem('rememberedPhone', phone);
            } else {
              localStorage.removeItem('rememberedPhone');
            }
            
            handleOTPSuccess(userProfile);
            
          } catch (error) {
            console.error("Error verifying OTP:", error);
            setError("Failed to verify OTP. Please try again.");
            toast.error("Failed to verify OTP. Please try again.");
          }
        } else {
          // Fallback to Twilio method
          const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
          const user = await verifyOTP(formattedPhone, otp);
          
          if (!user) {
            setError("Failed to verify OTP. Please try again.");
            toast.error("Failed to verify OTP. Please try again.");
            setLoading(false);
            return;
          }
          
          if (rememberMe) {
            localStorage.setItem('rememberedPhone', phone);
          } else {
            localStorage.removeItem('rememberedPhone');
          }
          
          handleOTPSuccess(user);
        }
      }
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
      toast.error(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleOTPSuccess = (user: any) => {
    console.log("OTP success with user:", user);
    handleRedirectBasedOnRole(user);
  };

  const toggleDevMode = () => {
    setDevMode(!devMode);
    if (!devMode) {
      toast.info("Developer mode enabled. OTP verification will be bypassed.");
    } else {
      toast.info("Developer mode disabled.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col items-center justify-center flex-grow py-10">
        <Card className="w-full max-w-md space-y-4 p-4">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {otpSent ? "Verify OTP" : "Login"}
            </CardTitle>
            <CardDescription className="text-center">
              {otpSent
                ? "Enter the verification code we sent to your phone."
                : "Enter your phone number to receive a verification code."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {devMode && (
              <Alert variant="default" className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Developer Mode Active</AlertTitle>
                <AlertDescription className="text-amber-700">
                  OTP verification is bypassed. Any code will work, and a mock user will be created if needed.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+1234567890"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={otpSent}
              />
            </div>
            
            {!otpSent && !devMode && (
              <div className="mt-2">
                <CaptchaVerification 
                  onVerify={handleCaptchaVerify}
                  onExpire={handleCaptchaExpire}
                  error={captchaError}
                />
              </div>
            )}
            
            {otpSent && (
              <div className="grid gap-2">
                <Label htmlFor="otp">OTP Code</Label>
                <Input
                  id="otp"
                  placeholder="123456"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            )}
            {!otpSent && (
              <RememberMeCheckbox 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked)}
              />
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {otpSent ? (
              <Button onClick={handleOtp} disabled={loading} className="w-full">
                {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Verify OTP
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="w-full">
                {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Send OTP
              </Button>
            )}
            
            <Separator className="my-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Developer Mode</span>
              <button
                type="button"
                onClick={toggleDevMode}
                className={`px-3 py-1 text-xs rounded-full ${
                  devMode 
                    ? "bg-green-500 text-white" 
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {devMode ? "Enabled" : "Disabled"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
