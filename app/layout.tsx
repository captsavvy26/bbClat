import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: {
    default: 'bbClat - Free CLAT, AILET & SLAT Past Year Papers',
    template: '%s | bbClat',
  },
  description:
    'Practice real CLAT, AILET and SLAT past year papers for free. Get marks, section-wise analysis and rank. No login needed.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white text-gray-900">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  )
}