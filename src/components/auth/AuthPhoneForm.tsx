
import React from "react";
import { Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "../Button";
import { RememberMeCheckbox } from "./RememberMeCheckbox";
import { CaptchaVerification } from "./CaptchaVerification";
import { AuthState } from "@/hooks/auth/types";

interface AuthPhoneFormProps {
  state: AuthState;
  updateState: (updates: Partial<AuthState>) => void;
  onSubmit: () => void;
}

export function AuthPhoneForm({ state, updateState, onSubmit }: AuthPhoneFormProps) {
  const handleCaptchaVerify = (token: string | null) => {
    if (token) {
      updateState({ captchaVerified: true, captchaError: null });
    } else {
      updateState({
        captchaVerified: false,
        captchaError: "Captcha verification failed. Please try again."
      });
    }
  };

  const handleCaptchaExpire = () => {
    updateState({
      captchaVerified: false,
      captchaError: "Captcha has expired. Please verify again."
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  // Add null check to prevent accessing properties of undefined
  const phone = state?.phone || '';
  const devMode = state?.devMode || false;
  const captchaVerified = state?.captchaVerified || false;
  const captchaError = state?.captchaError || null;
  const rememberMe = state?.rememberMe || false;
  const error = state?.error || null;
  const loading = state?.loading || false;

  return (
    <form onSubmit={handleSubmit}>
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
              onChange={(e) => updateState({ phone: e.target.value })}
            />
          </div>
        </div>
        
        {!devMode && (
          <div className="mt-4">
            <CaptchaVerification 
              onVerify={handleCaptchaVerify}
              onExpire={handleCaptchaExpire}
              error={captchaError}
            />
          </div>
        )}
        
        <RememberMeCheckbox 
          checked={rememberMe}
          onCheckedChange={(checked) => updateState({ rememberMe: checked })}
        />
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
      
      <Button
        className="w-full mt-6"
        type="submit"
        disabled={loading || (!captchaVerified && !devMode)}
      >
        {loading ? "Sending OTP..." : "Send OTP"}
      </Button>
    </form>
  );
}
