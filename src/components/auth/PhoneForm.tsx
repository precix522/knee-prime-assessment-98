
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RememberMeCheckbox } from "./RememberMeCheckbox";
import { CaptchaVerification } from "./CaptchaVerification";
import { formatPhoneNumber, validatePhoneNumber } from "./AuthUtils";

interface PhoneFormProps {
  phoneInput: string;
  setPhoneInput: (value: string) => void;
  handleSendOTP: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: string | null;
  rememberMe?: boolean;
  setRememberMe?: (checked: boolean) => void;
  captchaVerified?: boolean;
  setCaptchaVerified?: (verified: boolean) => void;
  captchaError?: string | null;
  setCaptchaError?: (error: string | null) => void;
  devMode?: boolean;
}

export const PhoneForm = ({
  phoneInput,
  setPhoneInput,
  handleSendOTP,
  isLoading,
  error,
  rememberMe = false,
  setRememberMe,
  captchaVerified,
  setCaptchaVerified,
  captchaError,
  setCaptchaError,
  devMode = false,
}: PhoneFormProps) => {
  
  const handleCaptchaVerify = (token: string | null) => {
    if (setCaptchaVerified) {
      if (token) {
        setCaptchaVerified(true);
        setCaptchaError && setCaptchaError(null);
      } else {
        setCaptchaVerified(false);
        setCaptchaError && setCaptchaError("Captcha verification failed. Please try again.");
      }
    }
  };

  const handleCaptchaExpire = () => {
    if (setCaptchaVerified) {
      setCaptchaVerified(false);
      setCaptchaError && setCaptchaError("Captcha has expired. Please verify again.");
    }
  };
  
  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format phone number as user types
    const rawInput = e.target.value;
    const formattedPhone = formatPhoneNumber(rawInput);
    setPhoneInput(formattedPhone);
  };

  const isPhoneValid = phoneInput ? validatePhoneNumber(phoneInput) : false;

  return (
    <form onSubmit={handleSendOTP} className="space-y-4">
      <div className="space-y-2">
        <div className="relative">
          <Input
            type="tel"
            value={phoneInput}
            onChange={handlePhoneInputChange}
            placeholder="Enter phone number (e.g., +6512345678)"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              phoneInput && !isPhoneValid ? 'border-red-500' : ''
            }`}
            autoComplete="tel"
            required
          />
          {phoneInput && !isPhoneValid && (
            <p className="text-xs text-red-500 mt-1">
              Please enter a valid phone number in international format (e.g., +6512345678)
            </p>
          )}
        </div>
        
        {!devMode && setCaptchaVerified && (
          <div className="mt-4">
            <CaptchaVerification 
              onVerify={handleCaptchaVerify}
              onExpire={handleCaptchaExpire}
              error={captchaError}
            />
          </div>
        )}
        
        {setRememberMe && (
          <RememberMeCheckbox 
            checked={rememberMe} 
            onCheckedChange={setRememberMe} 
          />
        )}
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
      
      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
        disabled={isLoading || (!captchaVerified && !devMode && setCaptchaVerified !== undefined) || (phoneInput && !isPhoneValid)}
      >
        {isLoading ? "Sending..." : "Send Verification Code"}
      </Button>
      
      {devMode && (
        <p className="text-xs text-center mt-2 text-amber-600">
          Developer mode: Twilio OTP verification is bypassed. Use code <strong>123456</strong> for testing.
        </p>
      )}
    </form>
  );
};
