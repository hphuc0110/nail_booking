import type React from "react"
import type { Metadata, Viewport } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { LanguageProvider } from "@/components/language-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Amici Nail Salon | Nail Salon Booking",
  description:
    "High-quality manicure and pedicure, acrylic and gel nails, nail design and more. Book your appointment today!",
  generator: "v0.app",
  keywords: ["nail salon", "manicure", "pedicure", "gel nails", "acrylic nails", "Rastatt", "booking"],
  openGraph: {
    title: "Amici Nail Salon",
    description: "Premium nail salon services in Rastatt",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: "#f43f5e",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans antialiased bg-white text-gray-900">
        <LanguageProvider>
          <Header />
          {children}
          <Footer />
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
