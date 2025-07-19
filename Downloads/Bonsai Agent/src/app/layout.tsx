import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bonsai - SAT Prep for Adult Learners',
  description: 'Comprehensive SAT preparation platform designed for college students, professionals, and career changers.',
  keywords: ['SAT prep', 'adult learners', 'college students', 'professionals', 'test preparation'],
  authors: [{ name: 'Bonsai Team' }],
  creator: 'Bonsai',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bonsaisat.com',
    title: 'Bonsai - SAT Prep for Adult Learners',
    description: 'AI-powered SAT preparation with screen monitoring, collaborative learning, and expert tutoring.',
    siteName: 'Bonsai',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bonsai SAT Prep Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bonsai - SAT Prep for Adult Learners',
    description: 'AI-powered SAT preparation with screen monitoring, collaborative learning, and expert tutoring.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, 'min-h-screen antialiased')}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}