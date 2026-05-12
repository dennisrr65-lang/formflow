import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FormFlow — AI-Powered Form Builder',
  description: 'Create beautiful forms and surveys in seconds with AI. Just describe what you need.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
