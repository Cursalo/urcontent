'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  BookOpen,
  Save,
  X,
  CheckCircle,
} from 'lucide-react'

// Mock test data - in real app this would come from Supabase
const mockTest = {
  id: 1,
  title: 'Full SAT Practice Test #1',
  sections: [
    {
      id: 1,
      name: 'Reading',
      timeLimit: 65, // minutes
      questions: [
        {
          id: 1,
          type: 'multiple_choice',
          content: 'Based on the passage, which choice best describes the relationship between the narrator and the old man?',
          passage: 'In the following passage, the narrator reflects on his relationship with an elderly neighbor...',
          choices: [
            { id: 'A', text: 'They are strangers who rarely interact' },
            { id: 'B', text: 'They are close friends who share similar interests' },
            { id: 'C', text: 'They have a respectful but distant relationship' },
            { id: 'D', text: 'They are family members with a complicated history' },
          ],
          correctAnswer: 'C',
        },
        {
          id: 2,
          type: 'multiple_choice',
          content: 'The word "peculiar" in line 23 most nearly means:',
          passage: 'Same passage continues...',
          choices: [
            { id: 'A', text: 'Strange' },
            { id: 'B', text: 'Specific' },
            { id: 'C', text: 'Unusual' },
            { id: 'D', text: 'Distinctive' },
          ],
          correctAnswer: 'D',
        },
      ],
    },
  ],
}

export default function TestPage() {
  const params = useParams()
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [currentSection, setCurrentSection] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState(65 * 60) // 65 minutes in seconds
  const [isTestStarted, setIsTestStarted] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)

  const section = mockTest.sections[currentSection]
  const question = section.questions[currentQuestion]
  const totalQuestions = section.questions.length
  const progress = ((currentQuestion + 1) / totalQuestions) * 100

  // Timer effect
  useEffect(() => {
    if (!isTestStarted) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          handleSubmitTest()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isTestStarted])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartTest = () => {
    setIsTestStarted(true)
  }

  const handleAnswerChange = (value: string) => {
    const questionKey = `${currentSection}-${currentQuestion}`
    setAnswers(prev => ({
      ...prev,
      [questionKey]: value,
    }))
  }

  const handleFlagQuestion = () => {
    const questionKey = `${currentSection}-${currentQuestion}`
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionKey)) {
        newSet.delete(questionKey)
      } else {
        newSet.add(questionKey)
      }
      return newSet
    })
  }

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleSubmitTest = () => {
    // In real app, submit to Supabase
    console.log('Submitting test with answers:', answers)
    router.push('/dashboard/practice/results')
  }

  const handleExitTest = () => {
    router.push('/dashboard/practice')
  }

  const getCurrentAnswer = () => {
    const questionKey = `${currentSection}-${currentQuestion}`
    return answers[questionKey] || ''
  }

  const isQuestionFlagged = () => {
    const questionKey = `${currentSection}-${currentQuestion}`
    return flaggedQuestions.has(questionKey)
  }

  if (!isTestStarted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-6 w-6" />
              {mockTest.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test Instructions</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• This test contains {totalQuestions} questions</li>
                <li>• You have {section.timeLimit} minutes to complete this section</li>
                <li>• Choose the best answer for each question</li>
                <li>• You can flag questions to review later</li>
                <li>• Make sure to answer every question before submitting</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Calculator Policy</h3>
              <p className="text-sm text-muted-foreground">
                For this reading section, no calculator is permitted. This mimics the actual SAT testing environment.
              </p>
            </div>

            <div className="flex space-x-4">
              <Button onClick={handleStartTest} className="flex-1">
                <Clock className="mr-2 h-4 w-4" />
                Start Test
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-background p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="font-semibold">{section.name} Section</h1>
          <Badge variant="outline">
            Question {currentQuestion + 1} of {totalQuestions}
          </Badge>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span className={`font-mono ${timeRemaining < 300 ? 'text-red-600' : ''}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>

          <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Exit Test?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to exit? Your progress will not be saved.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Continue Test</AlertDialogCancel>
                <AlertDialogAction onClick={handleExitTest}>
                  Exit Test
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2 border-b">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl space-y-6">
            {/* Passage */}
            {question.passage && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Passage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    {question.passage}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Question */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">
                  Question {currentQuestion + 1}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFlagQuestion}
                  className={isQuestionFlagged() ? 'bg-yellow-100' : ''}
                >
                  <Flag className={`h-4 w-4 ${isQuestionFlagged() ? 'fill-current' : ''}`} />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-base">{question.content}</p>

                {question.type === 'multiple_choice' && (
                  <RadioGroup
                    value={getCurrentAnswer()}
                    onValueChange={handleAnswerChange}
                    className="space-y-3"
                  >
                    {question.choices?.map((choice) => (
                      <div key={choice.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={choice.id} id={choice.id} />
                        <Label htmlFor={choice.id} className="flex-1 cursor-pointer">
                          <span className="font-medium mr-2">{choice.id}.</span>
                          {choice.text}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {question.type === 'written_response' && (
                  <Textarea
                    placeholder="Enter your response here..."
                    value={getCurrentAnswer()}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="min-h-[200px]"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation Sidebar */}
        <div className="w-80 border-l bg-muted/30 p-4">
          <div className="space-y-4">
            <h3 className="font-semibold">Navigation</h3>
            
            {/* Question Grid */}
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: totalQuestions }, (_, i) => {
                const questionKey = `${currentSection}-${i}`
                const isAnswered = answers[questionKey]
                const isFlagged = flaggedQuestions.has(questionKey)
                const isCurrent = i === currentQuestion

                return (
                  <Button
                    key={i}
                    variant={isCurrent ? 'default' : 'outline'}
                    size="sm"
                    className={`relative ${
                      isAnswered && !isCurrent ? 'bg-green-100 hover:bg-green-200' : ''
                    }`}
                    onClick={() => setCurrentQuestion(i)}
                  >
                    {i + 1}
                    {isFlagged && (
                      <Flag className="absolute -top-1 -right-1 h-3 w-3 fill-yellow-500" />
                    )}
                    {isAnswered && !isCurrent && (
                      <CheckCircle className="absolute -bottom-1 -right-1 h-3 w-3 fill-green-600 text-white" />
                    )}
                  </Button>
                )
              })}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestion === 0}
                  className="flex-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextQuestion}
                  disabled={currentQuestion === totalQuestions - 1}
                  className="flex-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {currentQuestion === totalQuestions - 1 && (
                <Button onClick={handleSubmitTest} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Submit Test
                </Button>
              )}
            </div>

            {/* Statistics */}
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Answered:</span>
                <span>{Object.keys(answers).length}/{totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span>Flagged:</span>
                <span>{flaggedQuestions.size}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}