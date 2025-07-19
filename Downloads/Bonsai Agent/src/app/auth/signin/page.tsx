import Link from 'next/link'
import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Sign In - Bonsai',
  description: 'Sign in to your Bonsai account to continue your SAT prep journey.',
}

export default function SignInPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Bonsai
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Bonsai transformed my SAT prep. The AI-powered insights and real-time assistance 
              helped me improve my score by 200 points in just 8 weeks."
            </p>
            <footer className="text-sm">Sofia Rodriguez, Georgetown University</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>
          
          <div className="text-center text-sm">
            Don't have an account?{' '}
            <Link
              href="/auth/signup"
              className="underline hover:text-primary"
            >
              Sign up
            </Link>
          </div>
          
          <div className="text-center text-sm">
            <Link
              href="/auth/forgot-password"
              className="underline hover:text-primary"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}