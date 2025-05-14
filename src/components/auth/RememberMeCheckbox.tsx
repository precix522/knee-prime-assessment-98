
import { Checkbox } from "@/components/ui/checkbox";

interface RememberMeCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
}

export function RememberMeCheckbox({ 
  checked, 
  onCheckedChange,
  label = "Remember me" 
}: RememberMeCheckboxProps) {
  return (
    <div className="flex items-center space-x-2 mt-2">
      <Checkbox 
        id="remember"
        checked={checked} 
        onCheckedChange={onCheckedChange}
        className="border-orange-400 data-[state=checked]:bg-orange-400"
      />
      <label
        htmlFor="remember"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </label>
    </div>
  );
}
