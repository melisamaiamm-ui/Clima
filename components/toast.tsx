"use client"

import { createContext, useCallback, useContext, useRef, useState } from "react"

type ToastTipo = "info" | "success" | "error"

interface ToastData {
  titulo: string
  msg: string
  tipo: ToastTipo
}

interface ToastContextValue {
  showToast: (titulo: string, msg: string, tipo?: ToastTipo) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast precisa estar dentro de ToastProvider")
  return ctx
}

const ICONS: Record<ToastTipo, React.ReactNode> = {
  success: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

const WRAPPER_CLASSES: Record<ToastTipo, string> = {
  success: "bg-emerald-100 border-emerald-200 text-emerald-800",
  error: "bg-rose-100 border-rose-200 text-rose-800",
  info: "bg-blue-100 border-blue-200 text-blue-800",
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null)
  const [visible, setVisible] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const showToast = useCallback((titulo: string, msg: string, tipo: ToastTipo = "info") => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setToast({ titulo, msg, tipo })
    setVisible(true)

    timers.current.push(
      setTimeout(() => {
        setVisible(false)
        timers.current.push(setTimeout(() => setToast(null), 300))
      }, 4500),
    )
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-4 right-4 z-[9999] bg-white border border-slate-200 rounded-lg shadow-2xl p-4 max-w-sm flex transform transition duration-300 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded border flex-shrink-0 ${WRAPPER_CLASSES[toast.tipo]}`}>
              {ICONS[toast.tipo]}
            </div>
            <div>
              <h4 className="font-mono font-bold text-sm text-slate-800">{toast.titulo}</h4>
              <p className="text-xs text-slate-600 mt-0.5">{toast.msg}</p>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}
