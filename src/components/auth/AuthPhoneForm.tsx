
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

  // Safely access state properties with fallbacks
  const phone = state?.phone || '';
  const devMode = state?.devMode || false;
  const captchaVerified = state?.captchaVerified || false;
  const captchaError = state?.captchaError || null;
  const rememberMe = state?.rememberMe || false;
  const loading = state?.loading || false;

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-5">
        <div>
          <Label htmlFor="phone" className="text-gray-700 text-base font-medium mb-2 block">
            Phone Number
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="tel"
              id="phone"
              placeholder="Enter your phone number"
              className="pl-10 py-6 text-base"
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
            <p className="text-sm text-gray-500 mt-2">
              This verification helps us ensure you're a human and not a bot.
            </p>
          </div>
        )}
        
        <RememberMeCheckbox 
          checked={rememberMe}
          onCheckedChange={(checked) => updateState({ rememberMe: checked })}
          label="Keep me signed in for 30 days"
        />
      </div>
      
      <Button
        className="w-full mt-6 py-6 bg-orange-300 hover:bg-orange-400 text-white font-medium text-lg"
        type="submit"
        disabled={loading || (!captchaVerified && !devMode)}
      >
        {loading ? "Sending OTP..." : "Send OTP"}
      </Button>
    </form>
  );
}
