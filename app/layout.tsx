import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Takenlijst',
  description: 'Jouw persoonlijke takenlijst met AI samenvatting',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
