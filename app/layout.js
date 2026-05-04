import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import Script from 'next/script'

export const metadata = {
  title: 'My Assistant - AI Agents for Your Business',
  description: 'Custom AI assistants trained on your business data. Help your customers 24/7.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Script
          src="/widget.js"
          data-agent-id="demo"
          data-greeting="Hey! 👋 I'm a demo of My Assistant. Ask me anything about the product!"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
