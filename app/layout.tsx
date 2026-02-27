import type { Metadata } from 'next'
import './globals.css'
import { IdentityInit } from '@/components/IdentityInit'

export const metadata: Metadata = {
  title: 'PidgeonNetwork',
  description: 'fully anonymous. no accounts. no traces.',
  openGraph: {
    title: 'PidgeonNetwork',
    description: 'fully anonymous. no accounts. no traces.',
    type: 'website',
    images: ['/logo.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-surface font-body text-white min-h-screen">
        <IdentityInit />
        {children}
      </body>
    </html>
  )
}
