
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/Button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface PhoneFormProps {
  phoneInput: string;
  setPhoneInput: (value: string) => void;
  handleSendOTP: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function PhoneForm({
  phoneInput,
  setPhoneInput,
  handleSendOTP,
  isLoading,
  error,
}: PhoneFormProps) {
  return (
    <form onSubmit={handleSendOTP}>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="mb-6">
        <Label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </Label>
        <Input
          type="tel"
          id="phone"
          className="w-full"
          placeholder="+1 (123) 456-7890"
          value={phoneInput}
          onChange={(e) => setPhoneInput(e.target.value)}
          disabled={isLoading}
          required
        />
        <p className="mt-2 text-xs text-gray-500">
          Enter your full number with country code (e.g., +65xxxxxxxx for Singapore)
        </p>
      </div>
      
      <Button
        type="submit"
        variant="health"
        size="lg"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Sending..." : "Send Verification Code"}
      </Button>
    </form>
  );
}
