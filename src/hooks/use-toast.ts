import * as React from "react"
import { toast as sonnerToast } from "sonner"

export interface ToastProps {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

// Re-export toast from sonner
import { toast } from "sonner";

// Keep the existing useToast interface for backward compatibility
export { toast };

// Simplified useToast for compatibility with existing components
export const useToast = () => {
  return {
    toast,
    // Provide an empty toasts array for compatibility with shadcn/ui toast
    toasts: [],
  };
};

export const toast = (props: ToastProps) => {
  if (props.variant === "destructive") {
    sonnerToast.error(props.title as string, {
      description: props.description,
      action: props.action,
    })
  } else {
    sonnerToast.success(props.title as string, {
      description: props.description,
      action: props.action,
    })
  }
}
