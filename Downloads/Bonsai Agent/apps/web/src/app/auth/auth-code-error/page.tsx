import Link from 'next/link'
import { Metadata } from 'next'
import { AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Authentication Error - Bonsai',
  description: 'There was an error with your authentication.',
}

export default function AuthCodeErrorPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-red-100 p-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Authentication Error</CardTitle>
            <CardDescription>
              There was a problem signing you in
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                The authentication link appears to be invalid or has expired.
              </p>
              <p className="text-sm text-muted-foreground">
                This can happen if:
              </p>
              <ul className="text-sm text-muted-foreground text-left list-disc list-inside space-y-1">
                <li>The link has already been used</li>
                <li>The link has expired</li>
                <li>There was a technical issue</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/auth/signin">
                  Try Signing In Again
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/signup">
                  Create New Account
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