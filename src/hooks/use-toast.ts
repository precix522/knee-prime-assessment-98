
import * as React from "react"
import { toast as sonnerToast } from "sonner"

export type ToastProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  type?: "default" | "error" | "success"
  variant?: "default" | "destructive"
}

// Define the toast function
const toast = (props: ToastProps) => {
  if (props.variant === "destructive") {
    sonnerToast.error(props.title as string, {
      description: props.description as string,
      action: props.action,
    })
  } else {
    sonnerToast(props.title as string, {
      description: props.description as string,
      action: props.action,
    })
  }
}

// Add convenience methods
toast.error = (message: string, options?: any) => sonnerToast.error(message, options)
toast.success = (message: string, options?: any) => sonnerToast.success(message, options)
toast.info = (message: string, options?: any) => sonnerToast.info(message, options)
toast.warning = (message: string, options?: any) => sonnerToast.warning(message, options)

// Hook for accessing toast functionality
function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
    toasts: [] as any[],
  }
}

// Export functions
export { toast, useToast }
