'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { WhiteboardCanvas } from '@/components/whiteboard/whiteboard-canvas'
import {
  Calculator,
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  PenTool,
  Eraser,
  RotateCcw,
  BookOpen,
  Maximize2,
  Minimize2,
} from 'lucide-react'

interface BluebookInterfaceProps {
  question: {
    id: string
    type: 'multiple_choice' | 'student_produced_response' | 'text_analysis'
    content: string
    passage?: string
    choices?: Array<{ id: string; text: string }>
    correctAnswer?: string
    domain: string
    skill: string
    difficulty: 'easy' | 'medium' | 'hard'
  }
  currentQuestion: number
  totalQuestions: number
  timeRemaining: number
  onAnswerChange: (answer: string) => void
  onNext: () => void
  onPrevious: () => void
  onFlag: () => void
  isCalcAllowed: boolean
  currentAnswer?: string
  isExpanded?: boolean
  onToggleExpand?: () => void
}

export function BluebookInterface({
  question,
  currentQuestion,
  totalQuestions,
  timeRemaining,
  onAnswerChange,
  onNext,
  onPrevious,
  onFlag,
  isCalcAllowed,
  currentAnswer = '',
  isExpanded = false,
  onToggleExpand,
}: BluebookInterfaceProps) {
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false)
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
  const [studentResponse, setStudentResponse] = useState('')
  const [isTimerPaused, setIsTimerPaused] = useState(false)
  const whiteboardRef = useRef<any>(null)

  useEffect(() => {
    setStudentResponse(currentAnswer)
  }, [currentAnswer])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'hard': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const handleAnswerSelection = (value: string) => {
    setStudentResponse(value)
    onAnswerChange(value)
  }

  const handleStudentProducedResponse = (value: string) => {
    // Only allow numeric input for student-produced responses
    const numericValue = value.replace(/[^0-9.-]/g, '')
    setStudentResponse(numericValue)
    onAnswerChange(numericValue)
  }

  const clearWhiteboard = () => {
    if (whiteboardRef.current) {
      whiteboardRef.current.clear()
    }
  }

  return (
    <div className={`h-screen bg-gray-50 flex flex-col transition-all duration-300 ${isExpanded ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header - mimics Bluebook styling */}
      <div className="bg-white border-b border-gray-300 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900">SAT Practice Test</span>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-sm">
              Question {currentQuestion + 1} of {totalQuestions}
            </Badge>
            <Badge className={getDifficultyColor(question.difficulty)}>
              {question.difficulty}
            </Badge>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Timer */}
          <div className="flex items-center space-x-2">
            <Clock className={`h-4 w-4 ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-600'}`} />
            <span className={`font-mono text-sm ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'}`}>
              {formatTime(timeRemaining)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsTimerPaused(!isTimerPaused)}
              className="p-1"
            >
              {isTimerPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
          </div>

          {/* Tools */}
          <div className="flex items-center space-x-2">
            {isCalcAllowed && (
              <Button
                variant={isCalculatorOpen ? "default" : "outline"}
                size="sm"
                onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
              >
                <Calculator className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant={isWhiteboardOpen ? "default" : "outline"}
              size="sm"
              onClick={() => setIsWhiteboardOpen(!isWhiteboardOpen)}
            >
              <PenTool className="h-4 w-4" />
            </Button>

            {onToggleExpand && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleExpand}
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-2">
        <Progress value={((currentQuestion + 1) / totalQuestions) * 100} className="h-2" />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{question.domain} • {question.skill}</span>
          <span>{Math.round(((currentQuestion + 1) / totalQuestions) * 100)}% Complete</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question Content */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Passage if present */}
              {question.passage && (
                <Card className="border-gray-300">
                  <CardContent className="p-6">
                    <div className="prose prose-sm max-w-none leading-relaxed">
                      <div className="whitespace-pre-wrap font-serif text-base leading-7">
                        {question.passage}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Question */}
              <Card className="border-gray-300 bg-blue-50/30">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">
                      Question {currentQuestion + 1}
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onFlag}
                      className="flex items-center space-x-1"
                    >
                      <Flag className="h-4 w-4" />
                      <span>Flag</span>
                    </Button>
                  </div>

                  <div className="text-base leading-7 mb-6 text-gray-900">
                    {question.content}
                  </div>

                  {/* Answer Options */}
                  {question.type === 'multiple_choice' && question.choices && (
                    <RadioGroup
                      value={studentResponse}
                      onValueChange={handleAnswerSelection}
                      className="space-y-4"
                    >
                      {question.choices.map((choice) => (
                        <div
                          key={choice.id}
                          className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
                        >
                          <RadioGroupItem value={choice.id} id={choice.id} className="mt-1" />
                          <Label
                            htmlFor={choice.id}
                            className="flex-1 cursor-pointer text-base leading-6"
                          >
                            <span className="font-medium mr-3 text-blue-700">
                              {choice.id}.
                            </span>
                            {choice.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {/* Student Produced Response */}
                  {question.type === 'student_produced_response' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800 mb-2">
                          <strong>Instructions:</strong> Enter your answer as a number (integer or decimal).
                        </p>
                        <ul className="text-xs text-yellow-700 space-y-1">
                          <li>• If your answer is a fraction, enter it as a decimal</li>
                          <li>• Do not enter symbols such as $ or %</li>
                          <li>• If your answer is negative, enter the negative sign</li>
                        </ul>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <Label htmlFor="student-response" className="text-base font-medium">
                          Answer:
                        </Label>
                        <input
                          id="student-response"
                          type="text"
                          value={studentResponse}
                          onChange={(e) => handleStudentProducedResponse(e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-lg font-mono w-32 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                          maxLength={10}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>

          {/* Navigation Footer */}
          <div className="bg-white border-t border-gray-300 px-6 py-4 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={currentQuestion === 0}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {totalQuestions}
              </span>
            </div>

            <Button
              onClick={onNext}
              disabled={currentQuestion === totalQuestions - 1}
              className="flex items-center space-x-2"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Whiteboard Sidebar */}
        {isWhiteboardOpen && (
          <div className="w-96 border-l border-gray-300 bg-white flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Scratch Work</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearWhiteboard}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsWhiteboardOpen(false)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <WhiteboardCanvas ref={whiteboardRef} />
            </div>
          </div>
        )}

        {/* Calculator Modal/Sidebar */}
        {isCalculatorOpen && (
          <div className="fixed bottom-4 right-4 z-50">
            <Card className="w-64 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Calculator</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCalculatorOpen(false)}
                  >
                    ×
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  Basic calculator coming soon...
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}