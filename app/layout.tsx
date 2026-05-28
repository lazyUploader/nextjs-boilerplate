import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'Next.js Boilerplate',
  description: 'Next.js + Tailwind + shadcn + Clerk + Drizzle',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="ko">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
