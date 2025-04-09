
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

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginUser, setLoginUser] = useState<any>(null);
  const [sessionVerified, setSessionVerified] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const { setAuthUser } = useTwilioAuthStore();
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
    const checkAuthAndVerify = async () => {
      try {
        const storedSession = localStorage.getItem('twilio-auth-session');
        if (!storedSession) {
          return;
        }
        
        const session = JSON.parse(storedSession);
        if (!session?.user?.phone) {
          return;
        }
        
        const { data: verifiedSession, error: verificationError } = await supabase
          .functions.invoke('verify-session', {
            body: { phone: session.user.phone, token: session.token },
          });
          
        if (verificationError) {
          console.error("Session verification error:", verificationError);
          return;
        }
        
        if (verifiedSession?.verified) {
          const userProfile = verifiedSession.user;
          
          if (userProfile) {
            setLoginUser(userProfile);
            setSessionVerified(true);
            
            if (userProfile.profile_type === 'admin') {
              navigate("/dashboard");
            } else {
              if (patientID) {
                navigate(`/report-viewer?patientId=${encodeURIComponent(patientID)}`);
              } else {
                navigate("/dashboard");
              }
            }
          }
        }
      } catch (error) {
        console.error("Error during session verification:", error);
      }
    };

    checkAuthAndVerify();
  }, [navigate, patientID]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!phone) {
      setError("Phone number is required.");
      setLoading(false);
      return;
    }

    try {
      if (devMode) {
        console.log("Dev mode: Simulating OTP sent to", phone);
        setOtpSent(true);
        toast.success("Dev mode: OTP code is 123456");
      } else {
        const { data, error } = await supabase.functions.invoke('send-otp', {
          body: { phone },
        });

        if (error) {
          console.error("Error sending OTP:", error);
          setError("Failed to send OTP. Please try again.");
          toast.error("Failed to send OTP. Please try again.");
        } else {
          console.log("OTP sent successfully:", data);
          setOtpSent(true);
          toast.success("OTP sent successfully!");
        }
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
          userProfile = await getUserProfileByPhone(phone);
        } catch (profileError) {
          console.error("Error fetching user profile:", profileError);
          try {
            const { data, error } = await supabase
              .from('patient')
              .insert([{
                Patient_ID: `dev-user-${Date.now()}`,
                phone: phone,
                profile_type: "admin",
                patient_name: "Dev User",
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
                phone: phone,
                profile_type: "admin",
                created_at: new Date().toISOString(),
                name: "Dev User",
                email: "dev@example.com"
              };
            }
          } catch (createError) {
            console.error("Error creating user in patient table:", createError);
            userProfile = {
              id: "dev-user-id",
              phone: phone,
              profile_type: "admin",
              created_at: new Date().toISOString(),
              name: "Dev User",
              email: "dev@example.com"
            };
          }
        }
        
        if (!userProfile) {
          try {
            userProfile = await createUserProfile(phone, "admin");
          } catch (createError) {
            console.error("Error creating user profile:", createError);
            userProfile = {
              id: "dev-user-id",
              phone: phone,
              profile_type: "admin",
              created_at: new Date().toISOString(),
              name: "Dev User", 
              email: "dev@example.com"
            };
          }
        }
        
        setAuthUser(userProfile);
        handleOTPSuccess(userProfile, patientID);
        
        if (rememberMe) {
          localStorage.setItem('rememberedPhone', phone);
        } else {
          localStorage.removeItem('rememberedPhone');
        }
        
        toast.success("Dev mode: Login successful");
      } else {
        const { data, error } = await supabase.functions.invoke('verify-otp', {
          body: { phone, otp },
        });

        if (error) {
          console.error("Error verifying OTP:", error);
          setError("Failed to verify OTP. Please try again.");
          toast.error("Failed to verify OTP. Please try again.");
        } else {
          console.log("OTP verification successful:", data);
          
          const userProfile = await getUserProfileByPhone(phone);
          
          if (!userProfile) {
            setError("User profile not found. Please contact support.");
            toast.error("User profile not found. Please contact support.");
            setLoading(false);
            return;
          }
          
          handleOTPSuccess(userProfile, patientID);
          
          if (rememberMe) {
            localStorage.setItem('rememberedPhone', phone);
          } else {
            localStorage.removeItem('rememberedPhone');
          }
        }
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleOTPSuccess = (user: any, patientId?: string) => {
    if (user.profile_type === 'admin') {
      navigate("/dashboard");
      return;
    }
    
    if (patientId) {
      navigate(`/report-viewer?patientId=${encodeURIComponent(patientId)}`);
    } else {
      navigate("/dashboard");
    }
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
