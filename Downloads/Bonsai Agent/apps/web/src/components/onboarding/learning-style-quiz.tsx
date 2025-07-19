'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Eye, Headphones, Hand, BookOpen, Clock, Timer } from 'lucide-react'

interface LearningStyleQuizProps {
  onUpdate: (data: any) => void
  onValidityChange: (isValid: boolean) => void
  initialData?: any
}

const quizQuestions = [
  {
    id: 'visual_preference',
    question: 'When studying, I prefer to:',
    type: 'visual',
    options: [
      { value: 'high', label: 'Use charts, diagrams, and visual aids' },
      { value: 'medium', label: 'Sometimes use visual materials' },
      { value: 'low', label: 'Focus on text and written explanations' }
    ]
  },
  {
    id: 'auditory_preference',
    question: 'I learn best when:',
    type: 'auditory',
    options: [
      { value: 'high', label: 'I can hear explanations and discuss concepts' },
      { value: 'medium', label: 'I sometimes benefit from audio content' },
      { value: 'low', label: 'I prefer to read and study silently' }
    ]
  },
  {
    id: 'kinesthetic_preference',
    question: 'When solving problems, I like to:',
    type: 'kinesthetic',
    options: [
      { value: 'high', label: 'Write things out and work through examples' },
      { value: 'medium', label: 'Sometimes take notes while thinking' },
      { value: 'low', label: 'Think through problems mentally' }
    ]
  },
  {
    id: 'reading_preference',
    question: 'My preferred way to learn new concepts is:',
    type: 'reading',
    options: [
      { value: 'high', label: 'Reading detailed explanations and examples' },
      { value: 'medium', label: 'Combining reading with other methods' },
      { value: 'low', label: 'Learning through practice and interaction' }
    ]
  },
  {
    id: 'study_time',
    question: 'I study most effectively:',
    type: 'timing',
    options: [
      { value: 'morning', label: 'In the morning (6 AM - 12 PM)' },
      { value: 'afternoon', label: 'In the afternoon (12 PM - 6 PM)' },
      { value: 'evening', label: 'In the evening (6 PM - 10 PM)' },
      { value: 'night', label: 'Late at night (10 PM - 2 AM)' }
    ]
  },
  {
    id: 'session_length',
    question: 'My ideal study session length is:',
    type: 'duration',
    options: [
      { value: 'short', label: '15-30 minutes (short, frequent sessions)' },
      { value: 'medium', label: '45-60 minutes (moderate sessions)' },
      { value: 'long', label: '90+ minutes (longer, deep-focus sessions)' }
    ]
  }
]

const learningStyleInfo = {
  visual: {
    icon: Eye,
    title: 'Visual Learner',
    description: 'You learn best through charts, diagrams, and visual representations',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  auditory: {
    icon: Headphones,
    title: 'Auditory Learner',
    description: 'You learn best through listening and verbal explanations',
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  kinesthetic: {
    icon: Hand,
    title: 'Kinesthetic Learner',
    description: 'You learn best through hands-on practice and writing',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  reading: {
    icon: BookOpen,
    title: 'Reading/Writing Learner',
    description: 'You learn best through reading and written materials',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  }
}

export function LearningStyleQuiz({ onUpdate, onValidityChange, initialData }: LearningStyleQuizProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)

  useEffect(() => {
    const allAnswered = quizQuestions.every(q => answers[q.id])
    onValidityChange(allAnswered)

    if (allAnswered) {
      const learningStyle = calculateLearningStyle()
      onUpdate(learningStyle)
    }
  }, [answers, onUpdate, onValidityChange])

  const calculateLearningStyle = () => {
    const styles = {
      visualLearner: answers.visual_preference === 'high',
      auditoryLearner: answers.auditory_preference === 'high',
      kinestheticLearner: answers.kinesthetic_preference === 'high',
      readingLearner: answers.reading_preference === 'high',
      preferredStudyTime: answers.study_time,
      sessionLength: answers.session_length
    }

    return styles
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    
    // Auto-advance to next question
    if (currentQuestion < quizQuestions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300)
    }
  }

  const getDominantLearningStyles = () => {
    if (!answers.visual_preference) return []
    
    const styles = []
    if (answers.visual_preference === 'high') styles.push('visual')
    if (answers.auditory_preference === 'high') styles.push('auditory')
    if (answers.kinesthetic_preference === 'high') styles.push('kinesthetic')
    if (answers.reading_preference === 'high') styles.push('reading')
    
    return styles
  }

  const progress = ((Object.keys(answers).length) / quizQuestions.length) * 100
  const dominantStyles = getDominantLearningStyles()

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Question {Math.min(Object.keys(answers).length + 1, quizQuestions.length)} of {quizQuestions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {quizQuestions.map((question, index) => {
          const isAnswered = !!answers[question.id]
          const isVisible = index <= currentQuestion || isAnswered
          
          if (!isVisible) return null

          return (
            <Card key={question.id} className={isAnswered ? 'border-green-200 bg-green-50/50' : ''}>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  {question.question}
                  {isAnswered && (
                    <Badge variant="secondary" className="ml-2">
                      ✓ Answered
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={answers[question.id] || ''}
                  onValueChange={(value) => handleAnswerChange(question.id, value)}
                >
                  {question.options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`${question.id}_${option.value}`} />
                      <Label htmlFor={`${question.id}_${option.value}`} className="flex-1 cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Learning Style Results */}
      {dominantStyles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Learning Style Profile</CardTitle>
            <CardDescription>
              Based on your responses, here are your dominant learning preferences:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {dominantStyles.map((styleKey) => {
                const style = learningStyleInfo[styleKey as keyof typeof learningStyleInfo]
                const StyleIcon = style.icon
                return (
                  <div key={styleKey} className={`p-4 rounded-lg ${style.bgColor}`}>
                    <div className="flex items-center space-x-3">
                      <StyleIcon className={`h-6 w-6 ${style.color}`} />
                      <div>
                        <h4 className="font-medium">{style.title}</h4>
                        <p className="text-sm text-muted-foreground">{style.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Study Preferences Summary */}
      {answers.study_time && answers.session_length && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Study Schedule Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center space-x-3">
                <Timer className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Preferred Study Time</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {answers.study_time?.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Session Length</p>
                  <p className="text-sm text-muted-foreground">
                    {
                      answers.session_length === 'short' ? '15-30 minutes' :
                      answers.session_length === 'medium' ? '45-60 minutes' :
                      '90+ minutes'
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}