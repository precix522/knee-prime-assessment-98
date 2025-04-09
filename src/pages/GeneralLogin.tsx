import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import { RememberMeCheckbox } from "../components/auth/RememberMeCheckbox";
import { Phone, KeyRound, AlertCircle } from "lucide-react";
import { supabase } from "../utils/supabase";
import { getUserProfileByPhone } from "../utils/supabase/user-db";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Navbar } from "../components/Navbar";

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
        console.log("Dev mode: Simulating OTP verification for", phone);
        
        let userProfile;
        try {
          userProfile = await getUserProfileByPhone(`+${phone}`);
        } catch (profileError) {
          console.error("Error fetching user profile:", profileError);
          
          const mockUser = {
            id: "dev-user-id",
            phone: `+${phone}`,
            profile_type: "admin",
            created_at: new Date().toISOString(),
            name: "Dev User",
            email: "dev@example.com"
          };
          
          try {
            const { data, error } = await supabase
              .from('patient')
              .insert([{
                Patient_ID: mockUser.id,
                phone: mockUser.phone,
                profile_type: mockUser.profile_type,
                patient_name: mockUser.name,
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
              userProfile = mockUser;
            }
          } catch (createError) {
            console.error("Error creating mock user in patient table:", createError);
            userProfile = mockUser;
          }
        }
        
        if (userProfile) {
          setLoginUser(userProfile);
          handleOTPSuccess(userProfile);
          toast({
            title: "Success",
            description: "Dev mode: OTP verified successfully.",
          });
        } else {
          const mockUser = {
            id: "dev-user-id",
            phone: `+${phone}`,
            profile_type: "admin",
            created_at: new Date().toISOString(),
            name: "Dev User",
            email: "dev@example.com"
          };
          setLoginUser(mockUser);
          handleOTPSuccess(mockUser);
          toast({
            title: "Success",
            description: "Dev mode: Created mock user and verified successfully.",
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center flex-grow">
        <div className="bg-white shadow-md rounded-md p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Login with OTP
          </h2>
          
          {devMode && (
            <Alert variant="default" className="bg-amber-50 border-amber-200 mb-4">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Developer Mode Active</AlertTitle>
              <AlertDescription className="text-amber-700">
                OTP verification is bypassed. Any code will work, and a mock user will be created if needed.
              </AlertDescription>
            </Alert>
          )}
          
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
    </div>
  );
}
