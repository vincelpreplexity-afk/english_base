import type { Metadata } from 'next'
import { Geist, Geist_Mono, Unbounded } from 'next/font/google'
import './globals.css'

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
})

const unbounded = Unbounded({
  variable: '--font-unbounded',
  subsets: ['latin', 'cyrillic'],
  weight: ['600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'English Base',
  description: 'Рабочее пространство репетитора',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="ru"
      className={`${geist.variable} ${geistMono.variable} ${unbounded.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
