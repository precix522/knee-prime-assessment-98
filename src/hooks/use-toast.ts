
import * as React from "react"
import { useToast as useSonnerToast, toast as sonnerToast } from "sonner"

export interface ToastProps {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

export const useToast = () => {
  // Use the sonner toast hook under the hood
  const sonnerHook = useSonnerToast()

  return {
    ...sonnerHook,
    toast: (props: ToastProps) => {
      sonnerToast[props.variant === "destructive" ? "error" : "success"](
        props.title,
        {
          description: props.description,
          action: props.action,
        }
      )
    }
  }
}

export const toast = sonnerToast
