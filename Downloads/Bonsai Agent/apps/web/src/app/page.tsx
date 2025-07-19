import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Brain, Monitor, Users, GraduationCap } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container max-w-6xl text-center">
          <Badge variant="secondary" className="mb-6">
            🌱 Built for Adult Learners
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Master the SAT with
            <span className="text-blue-600 dark:text-blue-400"> AI-Powered </span>
            Precision
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            The only SAT prep platform designed specifically for college students, working professionals, 
            and career changers. Get personalized study plans, real-time assistance, and expert tutoring.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/auth/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <Link href="/demo">
                Watch Demo
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16">
            <Card className="text-left">
              <CardHeader className="pb-3">
                <Brain className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle className="text-lg">AI Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  GPT-4 powered real-time help and personalized study recommendations
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-left">
              <CardHeader className="pb-3">
                <Monitor className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle className="text-lg">Screen Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Desktop overlay provides contextual hints and tracks your focus
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-left">
              <CardHeader className="pb-3">
                <Users className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle className="text-lg">Study Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Collaborate with peers through virtual study rooms and whiteboards
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-left">
              <CardHeader className="pb-3">
                <GraduationCap className="h-8 w-8 text-orange-600 mb-2" />
                <CardTitle className="text-lg">Expert Tutors</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Book 1-on-1 sessions with verified SAT specialists
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Designed for busy adults who need efficient, effective SAT preparation that fits their schedule.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">For College Students (18-22)</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  Social study groups with university peers
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  Quick practice sessions between classes
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  Mobile-first design for on-the-go studying
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  Achievement system and leaderboards
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-4">For Working Professionals (23+)</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  Calendar integration for busy schedules
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  Lunch break and weekend intensive modes
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  ROI tracking and progress analytics
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  Professional, distraction-free interface
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600 dark:bg-blue-700 text-white">
        <div className="container max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Achieve Your Target Score?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Join thousands of adult learners who've improved their SAT scores with Bonsai.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
            <Link href="/auth/signup">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}