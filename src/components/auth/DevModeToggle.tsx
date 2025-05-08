
import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface DevModeToggleProps {
  devMode: boolean;
  onToggle: () => void;
}

export function DevModeToggle({ devMode, onToggle }: DevModeToggleProps) {
  return (
    <div className="mt-4">
      {devMode && (
        <Alert variant="default" className="bg-amber-50 border-amber-200 mb-4">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Developer Mode Active</AlertTitle>
          <AlertDescription className="text-amber-700">
            OTP verification is bypassed. Any code will work, and a mock user will be created if needed.
          </AlertDescription>
        </Alert>
      )}
      
      <Separator className="my-4" />
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Developer Mode</span>
        <button
          type="button"
          onClick={onToggle}
          className={`px-3 py-1 text-xs rounded-full ${
            devMode 
              ? "bg-green-500 text-white" 
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {devMode ? "Enabled" : "Disabled"}
        </button>
      </div>
    </div>
  );
}
