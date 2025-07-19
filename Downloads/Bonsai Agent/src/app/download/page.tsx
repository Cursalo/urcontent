'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Chrome, 
  Download, 
  CheckCircle, 
  Star, 
  Shield, 
  Zap, 
  Brain,
  Trophy,
  Users,
  Clock
} from 'lucide-react'
import { useSession, signIn } from 'next-auth/react'
import { loadStripe } from '@stripe/stripe-js'
import { supabase } from '@/lib/auth'
import { toast } from 'sonner'
import { LandingHeader } from '@/components/landing/landing-header'
import { LandingFooter } from '@/components/landing/landing-footer'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PricingPlan {
  id: string
  name: string
  price: number
  features: string[]
  popular?: boolean
  stripePriceId: string
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 19,
    stripePriceId: 'price_basic_monthly',
    features: [
      'AI-powered question analysis',
      'Real-time hints and guidance',
      'Basic performance tracking',
      'Email support',
      '50 practice questions/month'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 39,
    stripePriceId: 'price_pro_monthly',
    popular: true,
    features: [
      'Everything in Basic',
      'Advanced cognitive monitoring',
      'Personalized study plans',
      'Voice assistant integration',
      'Unlimited practice questions',
      'Progress analytics dashboard',
      'Priority support'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 59,
    stripePriceId: 'price_premium_monthly',
    features: [
      'Everything in Pro',
      '1-on-1 AI tutoring sessions',
      'Advanced error pattern analysis',
      'Custom question generation',
      'Parent/teacher portal access',
      'Phone support',
      'Exam day coaching'
    ]
  }
]

export default function DownloadPage() {
  const { data: session, status } = useSession()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasSubscription, setHasSubscription] = useState(false)

  useEffect(() => {
    if (session?.user) {
      checkSubscriptionStatus()
    }
  }, [session])

  const checkSubscriptionStatus = async () => {
    try {
      const { data } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', session?.user?.id)
        .eq('status', 'active')
        .single()

      setHasSubscription(!!data)
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  const handleSubscribe = async (priceId: string) => {
    if (!session) {
      signIn()
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: session.user.id,
        }),
      })

      const { sessionId } = await response.json()

      const stripe = await stripePromise
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId })
        if (error) {
          console.error('Stripe redirect error:', error)
          toast.error('Payment redirect failed')
        }
      }
    } catch (error) {
      console.error('Subscription error:', error)
      toast.error('Subscription failed')
    } finally {
      setLoading(false)
    }
  }

  const downloadExtension = async () => {
    if (!hasSubscription) {
      toast.error('Please subscribe to download the extension')
      return
    }

    try {
      // Trigger extension download
      const response = await fetch('/api/download-extension', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session?.user?.id,
        }),
      })

      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'bonsai-sat-assistant.zip'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Extension downloaded! Follow the installation guide below.')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Download failed')
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Chrome className="w-12 h-12 text-blue-600" />
            <span className="text-4xl font-bold text-gray-900">Bonsai SAT Assistant</span>
          </div>
          
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
            Your AI-Powered SAT Companion
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Get real-time AI tutoring while taking practice SATs on Bluebook. 
            Boost your score with personalized guidance, smart hints, and adaptive learning.
          </p>

          <div className="flex items-center justify-center gap-8 mb-12">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">10,000+ Students</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-green-500" />
              <span className="font-semibold">+150 Avg Score Boost</span>
            </div>
          </div>

          {hasSubscription ? (
            <div className="space-y-4">
              <Button size="lg" onClick={downloadExtension} className="px-8 py-4 text-lg">
                <Download className="w-6 h-6 mr-2" />
                Download Extension
              </Button>
              <p className="text-sm text-gray-600">
                Ready to install! You have an active subscription.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Button size="lg" className="px-8 py-4 text-lg" disabled>
                <Chrome className="w-6 h-6 mr-2" />
                Subscribe to Download
              </Button>
              <p className="text-sm text-gray-600">
                Choose a plan below to get started
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Students Love Bonsai</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Tutoring</h3>
              <p className="text-gray-600">
                Get personalized hints and explanations in real-time while taking practice tests
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Seamless Integration</h3>
              <p className="text-gray-600">
                Works perfectly with the official Bluebook platform - no interference
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Coaching</h3>
              <p className="text-gray-600">
                Monitor your focus, stress levels, and get coaching recommendations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      {!hasSubscription && (
        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Choose Your Plan</h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingPlans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative ${plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      Most Popular
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>
                      <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-600">/month</span>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className="w-full mt-6" 
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => handleSubscribe(plan.stripePriceId)}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : `Subscribe to ${plan.name}`}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Installation Guide */}
      {hasSubscription && (
        <div className="bg-white py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">Easy Installation Guide</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Download the Extension</h3>
                  <p className="text-gray-600">
                    Click the download button above to get the latest version
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Install in Chrome</h3>
                  <p className="text-gray-600">
                    Open Chrome → Extensions → Developer mode → Load unpacked → Select downloaded folder
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Start Studying</h3>
                  <p className="text-gray-600">
                    Visit Bluebook, log in, and start a practice test. Bonsai will activate automatically!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trust Section */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-6 h-6" />
            <span className="font-semibold">100% Safe & Secure</span>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Our extension is privacy-focused and works alongside Bluebook without violating any terms. 
            Your data is encrypted and never shared with third parties.
          </p>
        </div>
      </div>
      </div>
      <LandingFooter />
    </div>
  )
}