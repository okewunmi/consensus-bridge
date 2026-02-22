import './globals.css'
import type { Metadata } from 'next'
import { OnboardingProvider } from '@/lib/onboarding/page'
export const metadata: Metadata = {
  title: 'Consensus Bridge - AI-Facilitated Cross-Partisan Dialogue',
  description: 'Scaling deliberative democracy without hollowing it out. Build genuine consensus across political divides.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950">
        <OnboardingProvider>{children}</OnboardingProvider>
      </body>
    </html>
  )
}

