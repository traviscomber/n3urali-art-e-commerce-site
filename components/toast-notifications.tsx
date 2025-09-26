"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface Toast {
  id: string
  type: "success" | "error" | "info" | "warning"
  title: string
  message?: string
  duration?: number
}

interface ToastNotificationsProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const toastStyles = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
}

export function ToastNotifications({ toasts, onRemove }: ToastNotificationsProps) {
  useEffect(() => {
    toasts.forEach((toast) => {
      if (toast.duration !== 0) {
        const timer = setTimeout(() => {
          onRemove(toast.id)
        }, toast.duration || 5000)

        return () => clearTimeout(timer)
      }
    })
  }, [toasts, onRemove])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => {
        const Icon = toastIcons[toast.type]
        return (
          <div
            key={toast.id}
            className={`p-4 rounded-lg border shadow-lg animate-in slide-in-from-right-2 duration-300 ${toastStyles[toast.type]}`}
          >
            <div className="flex items-start gap-3">
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">{toast.title}</h4>
                {toast.message && <p className="text-sm opacity-90 mt-1">{toast.message}</p>}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(toast.id)}
                className="h-6 w-6 p-0 hover:bg-black/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Toast context and hook
import { createContext, useContext, type ReactNode } from "react"

interface ToastContextType {
  showToast: (toast: Omit<Toast, "id">) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastNotifications toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
