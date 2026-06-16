import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "SAIMM - Sistema de Avaliação de Impacto Meteorológico Militar",
  description:
    "Planejamento de operações militares sob diretrizes climatológicas do Manual de Campanha.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} bg-slate-50`}>
      <body className="bg-slate-50 text-slate-800 font-sans min-h-screen military-grid pb-12 antialiased">
        {children}
      </body>
    </html>
  )
}
