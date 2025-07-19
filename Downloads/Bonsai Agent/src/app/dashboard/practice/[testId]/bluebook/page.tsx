'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BluebookInterface } from '@/components/test/bluebook-interface'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Brain, Zap, Clock, Target } from 'lucide-react'
import { toast } from 'sonner'
import { useScreenMonitoring } from '@/lib/monitoring/screen-monitor'
import { useAuth } from '@/contexts/auth-context'

interface Question {
  id: string
  type: 'multiple_choice' | 'student_produced_response' | 'text_analysis'
  content: string
  passage?: string
  choices?: Array<{ id: string; text: string }>
  correctAnswer: string
  explanation: string
  domain: string
  skill: string
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedTime: number
  tags: string[]
  adaptiveMetrics?: {
    discriminationIndex: number
    difficultyIndex: number
    guessingParameter: number
  }
}

export default function BluebookTestPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { 
    session: monitoringSession, 
    isActive: isMonitoringActive, 
    startMonitoring, 
    stopMonitoring,
    generateReport,
    isElectronEnvironment 
  } = useScreenMonitoring()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState(3900) // 65 minutes
  const [isTestStarted, setIsTestStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)
  const [testConfig, setTestConfig] = useState({
    useAI: true,
    adaptive: true,
    questionCount: 27, // Typical SAT math section
    timeLimit: 70 * 60, // 70 minutes
    domain: 'math' as 'math' | 'reading_writing',
  })
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (isTestStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitTest()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isTestStarted, timeRemaining])

  const generateAIQuestions = async () => {
    setIsGeneratingQuestions(true)
    try {
      // Get student performance data for adaptive generation
      const studentPerformance = {
        correctAnswers: 15,
        totalAnswers: 20,
        weakSkills: ['geometry', 'data_analysis'],
        strongSkills: ['algebra'],
        averageTime: 90
      }

      const response = await fetch('/api/ai/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'adaptive',
          studentPerformance,
          count: testConfig.questionCount
        })
      })

      if (!response.ok) throw new Error('Failed to generate questions')

      const data = await response.json()
      setQuestions(data.questions)
      toast.success(`Generated ${data.questions.length} adaptive questions!`)
    } catch (error) {
      console.error('Error generating questions:', error)
      toast.error('Failed to generate AI questions. Using fallback questions.')
      // Load fallback questions
      setQuestions(getFallbackQuestions())
    } finally {
      setIsGeneratingQuestions(false)
    }
  }

  const getFallbackQuestions = (): Question[] => {
    return [
      {
        id: 'fallback_1',
        type: 'multiple_choice',
        content: 'If 3x + 7 = 22, what is the value of x?',
        choices: [
          { id: 'A', text: '5' },
          { id: 'B', text: '6' },
          { id: 'C', text: '7' },
          { id: 'D', text: '8' }
        ],
        correctAnswer: 'A',
        explanation: 'Subtract 7 from both sides: 3x = 15. Divide by 3: x = 5.',
        domain: 'math',
        skill: 'algebra',
        difficulty: 'easy',
        estimatedTime: 60,
        tags: ['linear_equations', 'algebra_basics']
      },
      {
        id: 'fallback_2',
        type: 'student_produced_response',
        content: 'A circle has a radius of 6 units. What is the area of the circle in square units? (Use π ≈ 3.14)',
        correctAnswer: '113.04',
        explanation: 'Area = πr² = 3.14 × 6² = 3.14 × 36 = 113.04 square units',
        domain: 'math',
        skill: 'geometry',
        difficulty: 'medium',
        estimatedTime: 90,
        tags: ['circles', 'area', 'geometry']
      }
    ]
  }

  const handleStartTest = async () => {
    setIsLoading(true)
    
    if (testConfig.useAI && questions.length === 0) {
      await generateAIQuestions()
    } else if (questions.length === 0) {
      setQuestions(getFallbackQuestions())
    }
    
    // Start screen monitoring if user is authenticated
    if (user) {
      const sessionId = startMonitoring(params.testId as string, user.id)
      toast.success('Screen monitoring activated for test integrity')
    }
    
    setTimeRemaining(testConfig.timeLimit)
    setIsTestStarted(true)
    setIsLoading(false)
  }

  const handleAnswerChange = (answer: string) => {
    const questionKey = `${currentQuestion}`
    setAnswers(prev => ({
      ...prev,
      [questionKey]: answer
    }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleFlag = () => {
    const questionKey = `${currentQuestion}`
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

  const handleSubmitTest = () => {
    // Stop screen monitoring and get report
    const monitoringReport = stopMonitoring()
    
    // Calculate score and redirect to results
    const correctAnswers = Object.entries(answers).filter(([questionIndex, answer]) => {
      const question = questions[parseInt(questionIndex)]
      return question && answer === question.correctAnswer
    }).length

    const score = Math.round((correctAnswers / questions.length) * 800)
    
    // Store results with monitoring data
    localStorage.setItem('testResults', JSON.stringify({
      score,
      correctAnswers,
      totalQuestions: questions.length,
      timeSpent: testConfig.timeLimit - timeRemaining,
      answers,
      questions: questions.map(q => ({ id: q.id, correctAnswer: q.correctAnswer })),
      monitoringReport: monitoringReport ? generateReport() : null,
      testIntegrity: monitoringReport ? {
        riskLevel: generateReport()?.summary.riskLevel || 'unknown',
        violations: monitoringReport.violations
      } : null
    }))
    
    router.push('/dashboard/practice/results')
  }

  const getCurrentAnswer = () => {
    return answers[`${currentQuestion}`] || ''
  }

  if (!isTestStarted) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="mr-2 h-6 w-6 text-blue-600" />
              Bonsai SAT Practice Test - Bluebook Style
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Test Configuration */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Zap className="mr-2 h-4 w-4 text-yellow-500" />
                    AI-Powered Questions
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Generate adaptive questions tailored to your skill level
                  </p>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={testConfig.useAI}
                        onChange={(e) => setTestConfig(prev => ({ ...prev, useAI: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Enable AI question generation</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={testConfig.adaptive}
                        onChange={(e) => setTestConfig(prev => ({ ...prev, adaptive: e.target.checked }))}
                        className="rounded"
                        disabled={!testConfig.useAI}
                      />
                      <span className="text-sm">Adaptive difficulty</span>
                    </label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Target className="mr-2 h-4 w-4 text-green-500" />
                    Test Settings
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Section</label>
                      <select
                        value={testConfig.domain}
                        onChange={(e) => setTestConfig(prev => ({ 
                          ...prev, 
                          domain: e.target.value as 'math' | 'reading_writing'
                        }))}
                        className="w-full mt-1 p-2 border rounded"
                      >
                        <option value="math">Math</option>
                        <option value="reading_writing">Reading & Writing</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Questions</label>
                      <select
                        value={testConfig.questionCount}
                        onChange={(e) => setTestConfig(prev => ({ 
                          ...prev, 
                          questionCount: parseInt(e.target.value)
                        }))}
                        className="w-full mt-1 p-2 border rounded"
                      >
                        <option value="10">10 questions (15 min)</option>
                        <option value="27">27 questions (70 min)</option>
                        <option value="44">44 questions (70 min)</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Target className="mr-2 h-4 w-4 text-blue-500" />
                    Screen Monitoring
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {isElectronEnvironment 
                      ? 'Advanced desktop monitoring enabled'
                      : 'Browser-based monitoring active'
                    }
                  </p>
                  <div className="space-y-2">
                    <div className="text-xs text-green-600 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Test integrity monitoring
                    </div>
                    <div className="text-xs text-blue-600 flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      Focus tracking enabled
                    </div>
                    <div className="text-xs text-purple-600 flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                      Activity logging active
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test Instructions</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Features Available:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Interactive whiteboard for scratch work</li>
                    <li>• Built-in calculator (for calculator sections)</li>
                    <li>• Question flagging and navigation</li>
                    <li>• Real-time timer with pause function</li>
                    <li>• Bluebook-style interface</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">AI Enhancements:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Questions adapt to your skill level</li>
                    <li>• Focuses on your weak areas</li>
                    <li>• Provides detailed explanations</li>
                    <li>• Tracks performance metrics</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button 
                onClick={handleStartTest} 
                className="flex-1"
                disabled={isLoading || isGeneratingQuestions}
              >
                {isLoading || isGeneratingQuestions ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isGeneratingQuestions ? 'Generating AI Questions...' : 'Loading...'}
                  </>
                ) : (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Start Test
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>

            {testConfig.useAI && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">AI-Powered Testing</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      This test will generate questions specifically tailored to your performance level. 
                      The AI will analyze your responses and adapt the difficulty in real-time to provide 
                      the most effective learning experience.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <BluebookInterface
      question={questions[currentQuestion]}
      currentQuestion={currentQuestion}
      totalQuestions={questions.length}
      timeRemaining={timeRemaining}
      onAnswerChange={handleAnswerChange}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onFlag={handleFlag}
      isCalcAllowed={testConfig.domain === 'math'}
      currentAnswer={getCurrentAnswer()}
      isExpanded={isExpanded}
      onToggleExpand={() => setIsExpanded(!isExpanded)}
    />
  )
}