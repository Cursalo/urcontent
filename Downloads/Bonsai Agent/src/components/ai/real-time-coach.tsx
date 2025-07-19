'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  Target, 
  Zap, 
  TrendingUp, 
  Eye, 
  Ear, 
  Hand, 
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Clock,
  Lightbulb,
  Heart,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AdvancedTutoringEngine, StudentProfile, LearningContext } from '@/lib/ai/advanced-tutoring-engine'

interface RealTimeCoachProps {
  userId: string
  currentQuestion: any
  studentProfile: StudentProfile
  onCoachingUpdate: (guidance: CoachingGuidance) => void
}

interface CoachingGuidance {
  type: 'hint' | 'encouragement' | 'warning' | 'celebration' | 'strategy'
  message: string
  urgency: 'low' | 'medium' | 'high'
  adaptations: string[]
  visualCues?: string[]
  nextSteps?: string[]
}

interface CognitiveMetrics {
  focusLevel: number
  stressLevel: number
  cognitiveLoad: number
  learningEfficiency: number
  attentionSpan: number
}

const learningStyleIcons = {
  visual: Eye,
  auditory: Ear,
  kinesthetic: Hand,
  reading: BookOpen
}

const learningStyleColors = {
  visual: 'text-blue-600 bg-blue-100',
  auditory: 'text-green-600 bg-green-100',
  kinesthetic: 'text-orange-600 bg-orange-100',
  reading: 'text-purple-600 bg-purple-100'
}

export function RealTimeCoach({ 
  userId, 
  currentQuestion, 
  studentProfile, 
  onCoachingUpdate 
}: RealTimeCoachProps) {
  const [tutoringEngine] = useState(() => new AdvancedTutoringEngine(studentProfile))
  const [cognitiveMetrics, setCognitiveMetrics] = useState<CognitiveMetrics>({
    focusLevel: 85,
    stressLevel: 25,
    cognitiveLoad: 60,
    learningEfficiency: 78,
    attentionSpan: studentProfile.attentionSpan
  })
  const [currentGuidance, setCurrentGuidance] = useState<CoachingGuidance | null>(null)
  const [sessionTime, setSessionTime] = useState(0)
  const [adaptiveInsights, setAdaptiveInsights] = useState<string[]>([])
  const [motivationalState, setMotivationalState] = useState<{
    type: 'encouragement' | 'challenge' | 'support' | 'celebration'
    message: string
  } | null>(null)

  // Real-time cognitive monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime(prev => prev + 1)
      
      // Simulate real-time cognitive analysis
      // In production, this would use actual biometric/behavioral data
      const newMetrics = analyzeRealTimeCognitiveState()
      setCognitiveMetrics(newMetrics)
      
      // Generate adaptive coaching based on metrics
      generateAdaptiveCoaching(newMetrics)
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const analyzeRealTimeCognitiveState = useCallback((): CognitiveMetrics => {
    // Simulate cognitive analysis based on session time and student profile
    const timeBasedFocus = Math.max(20, 100 - (sessionTime / studentProfile.attentionSpan) * 40)
    const stressIncrease = Math.min(80, sessionTime * 0.5)
    
    return {
      focusLevel: Math.round(timeBasedFocus + (Math.random() - 0.5) * 10),
      stressLevel: Math.round(stressIncrease + (Math.random() - 0.5) * 15),
      cognitiveLoad: Math.round(60 + (Math.random() - 0.5) * 20),
      learningEfficiency: Math.round(80 - (sessionTime * 0.3) + (Math.random() - 0.5) * 15),
      attentionSpan: studentProfile.attentionSpan
    }
  }, [sessionTime, studentProfile.attentionSpan])

  const generateAdaptiveCoaching = useCallback(async (metrics: CognitiveMetrics) => {
    try {
      // Analyze cognitive state for coaching interventions
      let guidance: CoachingGuidance | null = null

      if (metrics.focusLevel < 40) {
        guidance = {
          type: 'warning',
          message: 'Your focus is decreasing. Consider taking a 2-minute break to reset your attention.',
          urgency: 'high',
          adaptations: ['Reduce question complexity', 'Add visual cues', 'Shorter content blocks'],
          nextSteps: ['Take micro-break', 'Switch to kinesthetic activity', 'Try breathing exercise']
        }
      } else if (metrics.stressLevel > 70) {
        guidance = {
          type: 'encouragement',
          message: 'You\'re doing great! Remember to breathe and trust your preparation.',
          urgency: 'medium',
          adaptations: ['Slower pace', 'Encouraging feedback', 'Stress reduction techniques'],
          nextSteps: ['Deep breathing', 'Positive self-talk', 'Review confident topics']
        }
      } else if (metrics.learningEfficiency > 85) {
        guidance = {
          type: 'celebration',
          message: 'Excellent learning momentum! You\'re in your optimal zone.',
          urgency: 'low',
          adaptations: ['Increase difficulty slightly', 'Challenge with advanced concepts'],
          nextSteps: ['Continue current strategy', 'Tackle harder problems']
        }
      }

      if (guidance) {
        setCurrentGuidance(guidance)
        onCoachingUpdate(guidance)

        // Generate motivational intervention
        const motivation = await tutoringEngine.generateMotivationalIntervention(
          metrics.learningEfficiency,
          studentProfile.targetScore || 1400,
          30, // days remaining
          [75, 78, 82, 85] // recent progress
        )
        setMotivationalState({
          type: motivation.interventionType,
          message: motivation.message
        })
      }

      // Update adaptive insights
      const insights = generateAdaptiveInsights(metrics)
      setAdaptiveInsights(insights)

    } catch (error) {
      console.error('Error generating adaptive coaching:', error)
    }
  }, [tutoringEngine, onCoachingUpdate, studentProfile.targetScore])

  const generateAdaptiveInsights = (metrics: CognitiveMetrics): string[] => {
    const insights: string[] = []

    if (metrics.focusLevel > 80) {
      insights.push('Optimal focus detected - perfect time for challenging concepts')
    }
    
    if (sessionTime > studentProfile.attentionSpan * 0.8) {
      insights.push('Approaching attention limit - consider a strategic break')
    }
    
    if (metrics.cognitiveLoad > 80) {
      insights.push('High cognitive load - simplifying explanations recommended')
    }
    
    if (metrics.learningEfficiency > 75) {
      insights.push('High learning efficiency - great absorption rate!')
    }

    return insights
  }

  const getLearningStyleIcon = () => {
    const IconComponent = learningStyleIcons[studentProfile.learningStyle]
    return <IconComponent className="w-4 h-4" />
  }

  const getCognitiveStateColor = (value: number, inverse = false) => {
    if (inverse) {
      if (value < 30) return 'text-green-600'
      if (value < 60) return 'text-yellow-600'
      return 'text-red-600'
    } else {
      if (value > 70) return 'text-green-600'
      if (value > 40) return 'text-yellow-600'
      return 'text-red-600'
    }
  }

  const getGuidanceIcon = (type: string) => {
    switch (type) {
      case 'hint': return <Lightbulb className="w-4 h-4" />
      case 'encouragement': return <Heart className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'celebration': return <CheckCircle className="w-4 h-4" />
      case 'strategy': return <Target className="w-4 h-4" />
      default: return <Brain className="w-4 h-4" />
    }
  }

  const getGuidanceColor = (type: string) => {
    switch (type) {
      case 'hint': return 'border-blue-200 bg-blue-50'
      case 'encouragement': return 'border-green-200 bg-green-50'
      case 'warning': return 'border-yellow-200 bg-yellow-50'
      case 'celebration': return 'border-purple-200 bg-purple-50'
      case 'strategy': return 'border-indigo-200 bg-indigo-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="space-y-4">
      {/* Cognitive Metrics Dashboard */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Real-Time Cognitive Analysis
            </CardTitle>
            <Badge 
              className={cn(
                'px-3 py-1',
                learningStyleColors[studentProfile.learningStyle]
              )}
            >
              {getLearningStyleIcon()}
              <span className="ml-1 capitalize">{studentProfile.learningStyle}</span>
            </Badge>
          </div>
          <CardDescription>
            AI-powered monitoring of your learning state and optimization recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Focus</span>
                <span className={cn('text-sm font-bold', getCognitiveStateColor(cognitiveMetrics.focusLevel))}>
                  {cognitiveMetrics.focusLevel}%
                </span>
              </div>
              <Progress value={cognitiveMetrics.focusLevel} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Stress</span>
                <span className={cn('text-sm font-bold', getCognitiveStateColor(cognitiveMetrics.stressLevel, true))}>
                  {cognitiveMetrics.stressLevel}%
                </span>
              </div>
              <Progress value={cognitiveMetrics.stressLevel} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Load</span>
                <span className="text-sm font-bold text-blue-600">
                  {cognitiveMetrics.cognitiveLoad}%
                </span>
              </div>
              <Progress value={cognitiveMetrics.cognitiveLoad} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Efficiency</span>
                <span className={cn('text-sm font-bold', getCognitiveStateColor(cognitiveMetrics.learningEfficiency))}>
                  {cognitiveMetrics.learningEfficiency}%
                </span>
              </div>
              <Progress value={cognitiveMetrics.learningEfficiency} className="h-2" />
            </div>
          </div>

          {/* Session Info */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Session: {Math.floor(sessionTime / 60)}:{(sessionTime % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-muted-foreground">
              Attention span: {studentProfile.attentionSpan}min
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Coaching Guidance */}
      {currentGuidance && (
        <Card className={cn('border-l-4', getGuidanceColor(currentGuidance.type))}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              {getGuidanceIcon(currentGuidance.type)}
              <CardTitle className="text-base capitalize">
                {currentGuidance.type} - {currentGuidance.urgency} Priority
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">{currentGuidance.message}</p>
            
            {currentGuidance.adaptations.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">ACTIVE ADAPTATIONS</h4>
                <div className="flex flex-wrap gap-1">
                  {currentGuidance.adaptations.map((adaptation, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {adaptation}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {currentGuidance.nextSteps && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">RECOMMENDED ACTIONS</h4>
                <ul className="text-xs space-y-1">
                  {currentGuidance.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-blue-500" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Motivational State */}
      {motivationalState && (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-purple-900">
                  {motivationalState.message}
                </p>
                <p className="text-xs text-purple-700 capitalize">
                  {motivationalState.type} intervention
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Adaptive Insights */}
      {adaptiveInsights.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              AI Learning Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {adaptiveInsights.map((insight, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Brain className="w-3 h-3 text-blue-500 flex-shrink-0" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default RealTimeCoach