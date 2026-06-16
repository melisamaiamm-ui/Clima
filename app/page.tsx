import { ToastProvider } from "@/components/toast"
import { SaimmApp } from "@/components/saimm-app"

export default function Page() {
  return (
    <ToastProvider>
      <SaimmApp />
    </ToastProvider>
  )
}
