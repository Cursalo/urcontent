'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { OnboardingData } from './onboarding-wizard'
import { 
  CheckCircle, 
  Target, 
  Calendar, 
  Brain, 
  Clock, 
  Star, 
  Trophy,
  Rocket,
  Users,
  BookOpen
} from 'lucide-react'

interface WelcomeCompletionProps {
  data: OnboardingData
  onComplete: () => void
}

export function WelcomeCompletion({ data, onComplete }: WelcomeCompletionProps) {
  const getDaysUntilTest = () => {
    if (!data.goals?.testDate) return null
    const testDate = new Date(data.goals.testDate)
    const today = new Date()
    const diffTime = testDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getSkillLevel = () => {
    const levels = [data.skillAssessment?.mathLevel, data.skillAssessment?.readingLevel, data.skillAssessment?.writingLevel]
    const advancedCount = levels.filter(level => level === 'advanced').length
    const intermediateCount = levels.filter(level => level === 'intermediate').length
    
    if (advancedCount >= 2) return 'advanced'
    if (intermediateCount >= 2) return 'intermediate'
    return 'beginner'
  }

  const getLearningStyles = () => {
    const styles = []
    if (data.learningStyle?.visualLearner) styles.push('Visual')
    if (data.learningStyle?.auditoryLearner) styles.push('Auditory')
    if (data.learningStyle?.kinestheticLearner) styles.push('Kinesthetic')
    if (data.learningStyle?.readingLearner) styles.push('Reading/Writing')
    return styles
  }

  const daysUntilTest = getDaysUntilTest()
  const skillLevel = getSkillLevel()
  const learningStyles = getLearningStyles()
  const currentScore = data.skillAssessment?.currentScore
  const targetScore = data.goals?.targetScore
  const improvementNeeded = targetScore && currentScore ? targetScore - currentScore : null

  const studyPlan = {
    totalHours: data.schedule?.weeklyHours * (daysUntilTest ? Math.ceil(daysUntilTest / 7) : 8),
    weeklyHours: data.schedule?.weeklyHours,
    studyDays: data.schedule?.preferredDays?.length,
    sessionLength: data.learningStyle?.sessionLength
  }

  return (
    <div className="space-y-6">
      {/* Celebration Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <Trophy className="w-10 h-10 text-green-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold mb-2">You're All Set!</h1>
          <p className="text-lg text-muted-foreground">
            Your personalized SAT prep journey is ready to begin
          </p>
        </div>
      </div>

      {/* Your Profile Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-600" />
            Your Personalized Profile
          </CardTitle>
          <CardDescription>
            Here's what we've learned about you and how we'll customize your experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Current & Target Score */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center">
                <Target className="h-4 w-4 mr-2 text-blue-600" />
                Score Goals
              </h4>
              <div className="space-y-1">
                {currentScore && (
                  <p className="text-sm text-muted-foreground">
                    Current Score: <span className="font-medium">{currentScore}</span>
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Target Score: <span className="font-medium text-blue-600">{targetScore}</span>
                </p>
                {improvementNeeded && (
                  <p className="text-sm text-green-600">
                    Improvement Goal: +{improvementNeeded} points
                  </p>
                )}
              </div>
            </div>

            {/* Test Timeline */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-green-600" />
                Timeline
              </h4>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Test Date: <span className="font-medium">{data.goals?.testDate}</span>
                </p>
                {daysUntilTest && (
                  <p className="text-sm text-muted-foreground">
                    Time to Prepare: <span className="font-medium text-orange-600">{daysUntilTest} days</span>
                  </p>
                )}
              </div>
            </div>

            {/* Skill Level */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center">
                <Brain className="h-4 w-4 mr-2 text-purple-600" />
                Skill Level
              </h4>
              <Badge variant={skillLevel === 'advanced' ? 'default' : skillLevel === 'intermediate' ? 'secondary' : 'outline'}>
                {skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)}
              </Badge>
            </div>

            {/* Learning Style */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center">
                <BookOpen className="h-4 w-4 mr-2 text-indigo-600" />
                Learning Style
              </h4>
              <div className="flex flex-wrap gap-1">
                {learningStyles.map((style) => (
                  <Badge key={style} variant="outline" className="text-xs">
                    {style}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Study Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            Your Study Plan
          </CardTitle>
          <CardDescription>
            Your personalized study schedule based on your preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{studyPlan.weeklyHours}h</div>
              <div className="text-xs text-muted-foreground">Per Week</div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-xl font-bold text-green-600">{studyPlan.studyDays}</div>
              <div className="text-xs text-muted-foreground">Study Days</div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-xl font-bold text-purple-600">
                {studyPlan.sessionLength === 'short' ? '30m' : 
                 studyPlan.sessionLength === 'medium' ? '60m' : '90m'}
              </div>
              <div className="text-xs text-muted-foreground">Per Session</div>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-xl font-bold text-orange-600">{studyPlan.totalHours}h</div>
              <div className="text-xs text-muted-foreground">Total Hours</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Focus Areas */}
      <Card>
        <CardHeader>
          <CardTitle>Your Focus Areas</CardTitle>
          <CardDescription>
            We'll prioritize these areas in your study plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {data.goals?.improvementAreas?.map((area) => (
              <Badge key={area} variant="secondary">
                {area.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Motivation Reminder */}
      {data.goals?.motivation && (
        <Card>
          <CardHeader>
            <CardTitle>Your Motivation</CardTitle>
          </CardHeader>
          <CardContent>
            <blockquote className="border-l-4 border-blue-500 pl-4 italic text-muted-foreground">
              "{data.goals.motivation}"
            </blockquote>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Rocket className="h-5 w-5 mr-2 text-green-600" />
            What Happens Next?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-blue-600">1</span>
            </div>
            <div>
              <p className="font-medium">Take a Practice Test</p>
              <p className="text-sm text-muted-foreground">Get your baseline score and identify specific areas for improvement</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-green-600">2</span>
            </div>
            <div>
              <p className="font-medium">Start Your Personalized Study Plan</p>
              <p className="text-sm text-muted-foreground">Begin with AI-generated lessons tailored to your learning style</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-purple-600">3</span>
            </div>
            <div>
              <p className="font-medium">Join Study Groups</p>
              <p className="text-sm text-muted-foreground">Connect with other students and participate in challenges</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center space-y-4">
        <Button onClick={onComplete} size="lg" className="w-full md:w-auto">
          <Rocket className="h-5 w-5 mr-2" />
          Start My SAT Journey
        </Button>
        <p className="text-sm text-muted-foreground">
          Ready to achieve your target score of {targetScore}? Let's begin!
        </p>
      </div>
    </div>
  )
}