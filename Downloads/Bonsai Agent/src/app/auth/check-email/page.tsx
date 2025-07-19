import Link from 'next/link'
import { Metadata } from 'next'
import { Mail } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Check Your Email - Bonsai',
  description: 'Please check your email to verify your account.',
}

export default function CheckEmailPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-blue-100 p-3">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We've sent you a confirmation link to verify your account
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Click the link in the email to activate your account and start your SAT prep journey.
              </p>
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/auth/signin">
                  Continue to Sign In
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/signup">
                  Try a different email
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center text-sm">
          <Link
            href="/"
            className="underline hover:text-primary"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}