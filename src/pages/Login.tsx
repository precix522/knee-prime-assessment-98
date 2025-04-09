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
import { getUserProfileByPhone } from "../utils/supabase/user-db";
import { RememberMeCheckbox } from "../components/auth/RememberMeCheckbox";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginUser, setLoginUser] = useState<any>(null);
  const [sessionVerified, setSessionVerified] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
        // Check if there's an active session in localStorage
        const storedSession = localStorage.getItem('twilio-auth-session');
        if (!storedSession) {
          return;
        }
        
        const session = JSON.parse(storedSession);
        if (!session?.user?.phone) {
          return;
        }
        
        // Verify session with Supabase
        const { data: verifiedSession, error: verificationError } = await supabase
          .functions.invoke('verify-session', {
            body: { phone: session.user.phone, token: session.token },
          });
          
        if (verificationError) {
          console.error("Session verification error:", verificationError);
          return;
        }
        
        if (verifiedSession?.verified) {
          // If user is already verified
          const userProfile = verifiedSession.user;
          
          if (userProfile) {
            setLoginUser(userProfile);
            setSessionVerified(true);
            
            // If user is an admin, redirect to dashboard instead of report-viewer
            if (userProfile.profile_type === 'admin') {
              navigate("/dashboard");
            } else {
              // For regular users, navigate to report-viewer if patient ID is available
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
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone, otp },
      });

      if (error) {
        console.error("Error verifying OTP:", error);
        setError("Failed to verify OTP. Please try again.");
        toast.error("Failed to verify OTP. Please try again.");
      } else {
        console.log("OTP verification successful:", data);
        
        // Fetch user profile from Supabase
        const userProfile = await getUserProfileByPhone(phone);
        
        if (!userProfile) {
          setError("User profile not found. Please contact support.");
          toast.error("User profile not found. Please contact support.");
          setLoading(false);
          return;
        }
        
        // Call success handler with user profile and patient ID
        handleOTPSuccess(userProfile, patientID);
        
        // Store phone number if rememberMe is checked
        if (rememberMe) {
          localStorage.setItem('rememberedPhone', phone);
        } else {
          localStorage.removeItem('rememberedPhone');
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
    // If the user is an admin, always redirect to dashboard
    if (user.profile_type === 'admin') {
      navigate("/dashboard");
      return;
    }
    
    // For regular users, continue with existing logic
    if (patientId) {
      navigate(`/report-viewer?patientId=${encodeURIComponent(patientId)}`);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
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
        </CardContent>
      </Card>
    </div>
  );
}
