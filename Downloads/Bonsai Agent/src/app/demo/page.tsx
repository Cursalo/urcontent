'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Brain, 
  BarChart3, 
  Chrome,
  ArrowRight,
  CheckCircle,
  Eye,
  Zap,
  Target,
  Clock,
  TrendingUp,
  Monitor,
  Lightbulb
} from 'lucide-react'
import Link from 'next/link'
import { LandingHeader } from '@/components/landing/landing-header'
import { LandingFooter } from '@/components/landing/landing-footer'

export default function DemoPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6">
            🎬 Interactive Demo
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            See Bonsai SAT Prep
            <span className="text-blue-600 dark:text-blue-400"> in Action </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience how our AI-powered platform helps students improve their SAT scores. 
            Watch the demo or try the interactive preview below.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="#video-demo">
                <Play className="mr-2 h-5 w-5" />
                Watch Video Demo
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <Link href="#interactive-demo">
                <Monitor className="mr-2 h-5 w-5" />
                Try Interactive Demo
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section id="video-demo" className="py-20 px-4">
        <div className="container max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Full Platform Overview
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A 3-minute walkthrough of the complete Bonsai SAT prep experience
            </p>
          </div>

          <div className="bg-black rounded-lg overflow-hidden shadow-2xl max-w-4xl mx-auto">
            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="h-10 w-10 text-white ml-1" />
                </div>
                <p className="text-white text-lg mb-4">Demo Video Coming Soon</p>
                <p className="text-gray-400 text-sm">
                  We're creating a comprehensive video demo. Check back soon!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Features */}
      <section id="interactive-demo" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Interactive Feature Demos
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore each component of the Bonsai platform
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Browser Extension Demo */}
            <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Chrome className="h-8 w-8 text-blue-600" />
                  <Badge variant="outline">Live Demo</Badge>
                </div>
                <CardTitle className="text-xl">Browser Extension</CardTitle>
                <CardDescription>
                  Real-time AI assistance while taking practice tests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Brain className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">AI Hint Available</p>
                      <p className="text-xs text-blue-700">
                        "Consider using the quadratic formula for this type of equation"
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Smart contextual hints
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Real-time progress tracking
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Cognitive monitoring
                  </div>
                </div>
                
                <Button className="w-full" variant="outline">
                  <Play className="mr-2 h-4 w-4" />
                  Try Extension Demo
                </Button>
              </CardContent>
            </Card>

            {/* Analytics Dashboard Demo */}
            <Card className="border-2 border-green-200 hover:border-green-400 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                  <Badge variant="outline">Interactive</Badge>
                </div>
                <CardTitle className="text-xl">Analytics Dashboard</CardTitle>
                <CardDescription>
                  Advanced performance tracking and insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">1420</div>
                      <div className="text-xs text-green-700">Predicted Score</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">+150</div>
                      <div className="text-xs text-blue-700">Points Improved</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                    Learning velocity tracking
                  </div>
                  <div className="flex items-center text-sm">
                    <Target className="h-4 w-4 text-green-600 mr-2" />
                    Skill mastery heatmaps
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 text-green-600 mr-2" />
                    Study time optimization
                  </div>
                </div>
                
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/dashboard">
                    <Eye className="mr-2 h-4 w-4" />
                    View Dashboard Demo
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* AI Tutoring Demo */}
            <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Brain className="h-8 w-8 text-purple-600" />
                  <Badge variant="outline">AI Powered</Badge>
                </div>
                <CardTitle className="text-xl">AI Tutoring Engine</CardTitle>
                <CardDescription>
                  Personalized tutoring that adapts to your learning style
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Lightbulb className="h-5 w-5 text-purple-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-purple-900">Personalized Coaching</p>
                      <p className="text-xs text-purple-700">
                        "Great momentum! Try tackling a challenging geometry problem next."
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                    Learning style adaptation
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                    Motivational coaching
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                    Smart recommendations
                  </div>
                </div>
                
                <Button className="w-full" variant="outline">
                  <Brain className="mr-2 h-4 w-4" />
                  Try AI Tutor Demo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Stats */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Real Results from Real Students</h2>
            <p className="text-xl text-muted-foreground">
              Data from our demo and beta testing programs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">94%</div>
              <div className="text-lg font-semibold mb-1">Score Improvement</div>
              <div className="text-sm text-muted-foreground">
                of students improved their practice test scores within 2 weeks
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">2.3x</div>
              <div className="text-lg font-semibold mb-1">Faster Learning</div>
              <div className="text-sm text-muted-foreground">
                compared to traditional SAT prep methods
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">87%</div>
              <div className="text-lg font-semibold mb-1">User Satisfaction</div>
              <div className="text-sm text-muted-foreground">
                would recommend Bonsai to other students
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600 dark:bg-blue-700 text-white">
        <div className="container max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience Bonsai?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Start your free trial and see the difference AI-powered SAT prep can make.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
              <Link href="/download">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 text-white border-white hover:bg-white hover:text-blue-600" asChild>
              <Link href="/">
                Learn More
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