
import React from "react";
import { KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "../Button";
import { AuthState } from "@/hooks/auth/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface AuthOTPFormProps {
  state: AuthState;
  updateState: (updates: Partial<AuthState>) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function AuthOTPForm({ state, updateState, onSubmit, onBack }: AuthOTPFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  // Add null safety checks
  const otp = state?.otp || '';
  const devMode = state?.devMode || false;
  const loading = state?.loading || false;
  const error = state?.error || null;

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {devMode && (
          <Alert className="bg-blue-50 border-blue-200 text-blue-800">
            <InfoIcon className="h-4 w-4 text-blue-800" />
            <AlertDescription>
              Developer mode is active. Use code <strong className="font-mono">123456</strong> for testing.
            </AlertDescription>
          </Alert>
        )}
        
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
              onChange={(e) => updateState({ otp: e.target.value })}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            A verification code has been sent to your phone number
            {devMode && ' (In dev mode, no actual SMS is sent)'}
          </p>
        </div>
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
      
      <div className="flex flex-col gap-2 mt-6">
        <Button
          className="w-full"
          type="submit"
          disabled={loading}
        >
          {loading ? "Verifying OTP..." : "Verify OTP"}
        </Button>
        
        <Button
          className="w-full"
          variant="outline"
          type="button"
          onClick={onBack}
          disabled={loading}
        >
          Back
        </Button>
      </div>
      
      {devMode && (
        <p className="text-sm text-center mt-4 text-green-600">
          Developer mode: Enter code <strong className="font-mono">123456</strong> to log in
        </p>
      )}
    </form>
  );
}
