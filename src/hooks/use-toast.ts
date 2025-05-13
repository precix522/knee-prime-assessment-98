
import * as React from "react"
import { toast as sonnerToast } from "sonner"

export interface ToastProps {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

export const useToast = () => {
  return {
    toast: (props: ToastProps) => {
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
    },
    // Maintain compatibility with the toaster component
    toasts: [] as any[]
  }
}

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
