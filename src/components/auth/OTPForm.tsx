
import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/Button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface OTPFormProps {
  otpCode: string;
  setOtpCode: (value: string) => void;
  handleVerifyOTP: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  formattedPhone: string;
  phoneNumber: string;
  countdown: number;
  onResendOTP: () => void;
  onBackToPhone: () => void;
  devMode?: boolean;
}

export function OTPForm({
  otpCode,
  setOtpCode,
  handleVerifyOTP,
  isLoading,
  error,
  formattedPhone,
  phoneNumber,
  countdown,
  onResendOTP,
  onBackToPhone,
  devMode = false,
}: OTPFormProps) {
  return (
    <form onSubmit={handleVerifyOTP}>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="mb-6">
        <Label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-3">
          Verification Code
        </Label>
        <div className="flex justify-center mb-4">
          <InputOTP 
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
            disabled={isLoading}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <p className="mt-2 text-sm text-center text-gray-500">
          The code was sent to {formattedPhone || phoneNumber}
        </p>
        
        {devMode && (
          <p className="mt-2 text-xs text-center text-amber-600">
            Developer mode: Enter code <strong>123456</strong> to verify
          </p>
        )}
      </div>
      
      <div className="flex flex-col space-y-3">
        <Button
          type="submit"
          variant="health"
          size="lg"
          className="w-full"
          disabled={isLoading || !otpCode || otpCode.length < 6}
        >
          {isLoading ? "Verifying..." : "Verify Code"}
        </Button>
        
        <div className="text-center">
          {countdown > 0 ? (
            <p className="text-sm text-gray-600">
              Resend code in {countdown} seconds
            </p>
          ) : (
            <button
              type="button"
              onClick={onResendOTP}
              className="text-sm text-orange-600 hover:text-orange-700"
              disabled={isLoading}
            >
              Didn't receive the code? Send again
            </button>
          )}
        </div>
        
        <button
          type="button"
          className="text-sm text-orange-600 hover:text-orange-700"
          onClick={onBackToPhone}
          disabled={isLoading}
        >
          Back to Phone Entry
        </button>
      </div>
    </form>
  );
}
