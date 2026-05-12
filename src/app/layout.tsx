import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Výlety s přáteli',
  description: 'Plánování výletů s přáteli',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  )
}
