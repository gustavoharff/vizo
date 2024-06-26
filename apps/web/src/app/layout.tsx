import './globals.css'
import 'antd/dist/reset.css'

import { AntdRegistry } from '@ant-design/nextjs-registry'
import { G2 } from '@ant-design/plots'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { Header } from '@/components/header'
import { Toaster } from '@/components/ui/sonner'

import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

const dark = G2.getTheme('dark')

dark.geometries.interval.rect.active.style.stroke = '#151718'

G2.registerTheme('custom-dark', {
  ...dark,
  background: 'transparent',
})

export const metadata: Metadata = {
  title: 'Vizo',
  description: 'Compare social sentiment analysis tools',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          type="image/<generated>"
          href="/favicon.svg"
          sizes="<generated>"
        />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <AntdRegistry>
          <Providers>
            <Toaster />

            <Header />

            {children}
          </Providers>
        </AntdRegistry>
      </body>
    </html>
  )
}
