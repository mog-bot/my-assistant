import './globals.css'

export const metadata = {
  title: 'My Assistant - AI Agents for Your Business',
  description: 'Custom AI assistants trained on your business data. Help your customers 24/7.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
