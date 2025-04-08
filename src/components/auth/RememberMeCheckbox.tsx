
import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface RememberMeCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const RememberMeCheckbox = ({ checked, onCheckedChange }: RememberMeCheckboxProps) => {
  return (
    <div className="flex items-center space-x-2 mt-2">
      <Checkbox 
        id="remember-me" 
        checked={checked} 
        onCheckedChange={onCheckedChange} 
      />
      <Label htmlFor="remember-me" className="text-sm text-gray-600 cursor-pointer">
        Keep me signed in for 30 days
      </Label>
    </div>
  );
};
