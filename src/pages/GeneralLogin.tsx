
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import { RememberMeCheckbox } from "../components/auth/RememberMeCheckbox";
import { Phone, KeyRound } from "lucide-react";
import { supabase } from "../utils/supabase";
import { getUserProfileByPhone } from "../utils/supabase/user-db";
import { Separator } from "@/components/ui/separator";

export default function GeneralLogin() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const { setLoginUser } = useTwilioAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSendOTP = async () => {
    if (!phone) {
      toast({
        title: "Error",
        description: "Please enter your phone number.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (devMode) {
        // In dev mode, skip the actual OTP sending
        console.log("Dev mode: Simulating OTP sent to", phone);
        setOtpSent(true);
        toast({
          title: "Success",
          description: "Dev mode: OTP code is 123456",
        });
      } else {
        const { data, error } = await supabase.functions.invoke('send-sms', {
          body: { phone: `+${phone}` },
        });

        if (error) {
          console.error("Error sending OTP:", error);
          toast({
            title: "Error",
            description: "Failed to send OTP. Please try again.",
            variant: "destructive",
          });
          return;
        }

        setOtpSent(true);
        toast({
          title: "Success",
          description: "OTP sent to your phone number.",
        });
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async () => {
    if (!otp) {
      toast({
        title: "Error",
        description: "Please enter the OTP.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (devMode) {
        // In dev mode, accept any code
        console.log("Dev mode: Simulating OTP verification for", phone);
        
        const userProfile = await getUserProfileByPhone(`+${phone}`);
        
        if (userProfile) {
          setLoginUser(userProfile);
          handleOTPSuccess(userProfile);
          toast({
            title: "Success",
            description: "Dev mode: OTP verified successfully.",
          });
        } else {
          toast({
            title: "Error",
            description: "User profile not found.",
            variant: "destructive",
          });
        }
      } else {
        const { data, error } = await supabase.functions.invoke('verify-otp', {
          body: { phone: `+${phone}`, otp: otp },
        });

        if (error) {
          console.error("Error verifying OTP:", error);
          toast({
            title: "Error",
            description: "Failed to verify OTP. Please try again.",
            variant: "destructive",
          });
          return;
        }
        
        if (data?.success) {
          const userProfile = await getUserProfileByPhone(`+${phone}`);
          
          if (userProfile) {
            setLoginUser(userProfile);
            handleOTPSuccess(userProfile);
            toast({
              title: "Success",
              description: "OTP verified successfully.",
            });
          } else {
            toast({
              title: "Error",
              description: "User profile not found.",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Error",
            description: "Invalid OTP. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleOTPSuccess = (user: any) => {
    if (user.profile_type === 'admin') {
      navigate("/dashboard");
      return;
    }
    
    navigate("/dashboard");
  };

  const toggleDevMode = () => {
    setDevMode(!devMode);
    toast({
      title: devMode ? "Developer Mode Disabled" : "Developer Mode Enabled",
      description: devMode 
        ? "Normal OTP verification will be used." 
        : "OTP verification will be bypassed.",
    });
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="bg-white shadow-md rounded-md p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Login with OTP
        </h2>
        {!otpSent ? (
          <>
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone" className="text-gray-700">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="tel"
                    id="phone"
                    placeholder="Enter your phone number"
                    className="pl-10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <Button
              className="w-full mt-6"
              onClick={handleSendOTP}
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>
            
            <Separator className="my-4" />
            
            <div className="flex items-center justify-between mt-4">
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
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <Label htmlFor="otp" className="text-gray-700">
                  OTP Code
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    id="otp"
                    placeholder="Enter OTP code"
                    className="pl-10"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <Button
              className="w-full mt-6"
              onClick={handleOTPSubmit}
              disabled={loading}
            >
              {loading ? "Verifying OTP..." : "Verify OTP"}
            </Button>
            
            {devMode && (
              <p className="text-sm text-center mt-4 text-green-600">
                Developer mode: Enter any code to log in
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
