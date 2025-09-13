import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Space_Grotesk, DM_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "@/components/providers"
import { Suspense } from "react"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "RecruitAI - Platforma Rekrutacyjna z Asystentem AI",
  description: "Nowoczesna platforma rekrutacyjna wykorzystująca sztuczną inteligencję do optymalizacji procesów HR",
  generator: "v0.app",
}

export const dynamic = "force-dynamic"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pl">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${spaceGrotesk.variable} ${dmSans.variable}`}>
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
          <Providers>
            {children}
          </Providers>
        </div>
        <Analytics />
      </body>
    </html>
  )
}
