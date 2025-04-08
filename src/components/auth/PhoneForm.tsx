
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RememberMeCheckbox } from "./RememberMeCheckbox";

interface PhoneFormProps {
  phoneInput: string;
  setPhoneInput: (value: string) => void;
  handleSendOTP: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: string | null;
  rememberMe?: boolean;
  setRememberMe?: (checked: boolean) => void;
}

export const PhoneForm = ({
  phoneInput,
  setPhoneInput,
  handleSendOTP,
  isLoading,
  error,
  rememberMe = false,
  setRememberMe,
}: PhoneFormProps) => {
  return (
    <form onSubmit={handleSendOTP} className="space-y-4">
      <div className="space-y-2">
        <div className="relative">
          <Input
            type="tel"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            placeholder="Enter phone number (e.g., +6512345678)"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="tel"
            required
          />
        </div>
        
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
        disabled={isLoading}
      >
        {isLoading ? "Sending..." : "Send Verification Code"}
      </Button>
    </form>
  );
};
