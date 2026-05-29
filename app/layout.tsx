import type { Metadata } from "next"
import { Instrument_Serif, Nunito } from "next/font/google"
import "./globals.css"

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
})

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "La Mise",
  description: "Your wardrobe, figured out.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${nunito.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  )
}
