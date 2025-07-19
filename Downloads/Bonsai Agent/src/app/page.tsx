import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowRight, 
  Brain, 
  Monitor, 
  Users, 
  GraduationCap,
  Chrome,
  Smartphone,
  BarChart3,
  Zap,
  Shield,
  Star,
  CheckCircle,
  Download,
  CreditCard,
  BookOpen,
  Target,
  TrendingUp,
  Play,
  Award,
  Clock,
  Lightbulb
} from 'lucide-react'
import Link from 'next/link'
import { LandingHeader } from '@/components/landing/landing-header'
import { LandingFooter } from '@/components/landing/landing-footer'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container max-w-6xl text-center">
          <div className="flex items-center justify-center mb-6">
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
              ✨ #1 AI-Powered SAT Prep Platform
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Increase Your SAT Score by
            <span className="text-blue-600 dark:text-blue-400"> 150+ Points </span>
            with AI
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            The only SAT prep platform that combines real-time AI tutoring, browser extension assistance, 
            and advanced analytics. Get personalized help exactly when you need it, track your progress in real-time, 
            and achieve your target score faster than ever before.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button size="lg" className="text-lg px-8 bg-blue-600 hover:bg-blue-700" asChild>
              <Link href="/download">
                <Download className="mr-2 h-5 w-5" />
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <Link href="/demo">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Link>
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground mb-12">
            ✓ 7-day free trial • ✓ No credit card required • ✓ Cancel anytime
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">150+</div>
              <div className="text-sm text-muted-foreground">Average Score Increase</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">98%</div>
              <div className="text-sm text-muted-foreground">User Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">50k+</div>
              <div className="text-sm text-muted-foreground">Students Helped</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">24/7</div>
              <div className="text-sm text-muted-foreground">AI Support</div>
            </div>
          </div>
          
          {/* Platform Components */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-left border-2 border-blue-200">
              <CardHeader className="pb-3">
                <Chrome className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle className="text-lg">Browser Extension</CardTitle>
                <Badge variant="outline" className="w-fit">1-Click Install</Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Real-time AI assistance while studying SAT materials online. Works with Khan Academy, College Board, and all major prep sites.
                </CardDescription>
                <Button asChild size="sm" className="w-full">
                  <Link href="/download">Install Extension</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="text-left border-2 border-green-200">
              <CardHeader className="pb-3">
                <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle className="text-lg">Analytics Dashboard</CardTitle>
                <Badge variant="outline" className="w-fit">Web App</Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Advanced performance tracking, learning velocity analysis, and personalized study recommendations powered by AI.
                </CardDescription>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href="/dashboard">View Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="text-left border-2 border-purple-200">
              <CardHeader className="pb-3">
                <Brain className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle className="text-lg">AI Tutoring Engine</CardTitle>
                <Badge variant="outline" className="w-fit">GPT-4 Powered</Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Personalized tutoring that adapts to your learning style, provides real-time coaching, and optimizes study sessions.
                </CardDescription>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href="/auth/signup">Start Learning</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How Bonsai Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A seamless journey from signup to score improvement
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-lg font-semibold mb-2">Subscribe & Install</h3>
              <p className="text-muted-foreground text-sm">
                Choose your plan and install the browser extension with one click. No technical setup required.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-lg font-semibold mb-2">Take Assessment</h3>
              <p className="text-muted-foreground text-sm">
                Complete our diagnostic test to identify strengths, weaknesses, and learning preferences.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-lg font-semibold mb-2">Study with AI</h3>
              <p className="text-muted-foreground text-sm">
                Get real-time help while studying. AI provides hints, explanations, and tracks your progress.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">4</div>
              <h3 className="text-lg font-semibold mb-2">Track & Improve</h3>
              <p className="text-muted-foreground text-sm">
                Monitor your progress with detailed analytics and receive personalized study recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Bonsai?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The most comprehensive SAT prep platform ever built
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold mb-6">Real-Time AI Assistance</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <strong>Smart Hints:</strong> Get contextual help without seeing the answer
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <strong>Learning Style Adaptation:</strong> Content adapts to visual, auditory, or kinesthetic preferences
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <strong>Cognitive Monitoring:</strong> AI tracks focus, stress, and learning efficiency
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <strong>Motivational Coaching:</strong> Personalized encouragement and goal tracking
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">AI Coach Active</span>
                </div>
                <Badge variant="default">Live</Badge>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Focus Level</span>
                    <span className="text-green-600">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Learning Efficiency</span>
                    <span className="text-blue-600">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                  <p className="text-sm font-medium text-blue-700">💡 Great momentum! Consider tackling a challenging geometry problem next.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-lg order-2 lg:order-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Performance Analytics</span>
                </div>
                <Badge variant="secondary">Updated Live</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">1420</div>
                  <div className="text-xs text-muted-foreground">Predicted SAT Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">+150</div>
                  <div className="text-xs text-muted-foreground">Points Improved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">15</div>
                  <div className="text-xs text-muted-foreground">Study Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">87%</div>
                  <div className="text-xs text-muted-foreground">Mastery Level</div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h3 className="text-2xl font-bold mb-6">Advanced Analytics</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <strong>Learning Velocity Tracking:</strong> Optimize study sessions for maximum efficiency
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <strong>Skill Mastery Heatmaps:</strong> Visual breakdown of strengths and weaknesses
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <strong>Score Prediction Models:</strong> ML-powered forecasting of SAT performance
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <strong>Study Time Optimization:</strong> Find your peak learning hours and patterns
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              One plan includes everything. No hidden fees, no upsells.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <Card className="border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white">Most Popular</Badge>
              </div>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">Bonsai Complete</CardTitle>
                <div className="text-4xl font-bold">$19<span className="text-lg text-muted-foreground">/month</span></div>
                <CardDescription>Everything you need to ace the SAT</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm">Browser extension with AI assistant</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm">Advanced analytics dashboard</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm">Personalized study plans</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm">Real-time cognitive monitoring</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm">Unlimited practice questions</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm">24/7 AI support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm">Mobile & desktop apps</span>
                  </li>
                </ul>
                
                <Button asChild size="lg" className="w-full mt-6">
                  <Link href="/download">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Start Free Trial
                  </Link>
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  7-day free trial • Cancel anytime • No setup fees
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Students Worldwide
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Improved my SAT score by 180 points in just 2 months. The AI coaching was like having a personal tutor available 24/7."
                </p>
                <div className="font-semibold">Sarah Chen</div>
                <div className="text-sm text-muted-foreground">Stanford University</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "As a working professional, I needed flexible study options. Bonsai's analytics helped me optimize my limited study time."
                </p>
                <div className="font-semibold">Michael Rodriguez</div>
                <div className="text-sm text-muted-foreground">Career Changer</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "The real-time assistance during practice tests was game-changing. Finally scored above 1500!"
                </p>
                <div className="font-semibold">Emma Johnson</div>
                <div className="text-sm text-muted-foreground">UC Berkeley</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600 dark:bg-blue-700 text-white">
        <div className="container max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your SAT Score?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Join thousands of students who've achieved their target scores with Bonsai's AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
              <Link href="/download">
                <Download className="mr-2 h-5 w-5" />
                Start Free Trial
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 text-white border-white hover:bg-white hover:text-blue-600" asChild>
              <Link href="/demo">
                <BookOpen className="mr-2 h-5 w-5" />
                Watch Demo
              </Link>
            </Button>
          </div>
          <p className="text-sm opacity-75 mt-4">
            No credit card required • 7-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}