'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Calculator, PenTool, Target } from 'lucide-react'

interface SkillAssessmentProps {
  onUpdate: (data: any) => void
  onValidityChange: (isValid: boolean) => void
  initialData?: any
}

const assessmentQuestions = {
  math: [
    {
      question: "What's your comfort level with Algebra?",
      options: [
        { value: 'beginner', label: 'Beginner - Need to review basics' },
        { value: 'intermediate', label: 'Intermediate - Comfortable with most concepts' },
        { value: 'advanced', label: 'Advanced - Very confident' }
      ]
    },
    {
      question: "How do you feel about Geometry problems?",
      options: [
        { value: 'struggle', label: 'I struggle with geometric concepts' },
        { value: 'okay', label: 'I can solve basic problems' },
        { value: 'confident', label: 'I\'m confident with complex problems' }
      ]
    }
  ],
  reading: [
    {
      question: "How quickly do you typically read passages?",
      options: [
        { value: 'slow', label: 'Slowly - I need time to understand' },
        { value: 'moderate', label: 'At a moderate pace' },
        { value: 'fast', label: 'Quickly - I\'m a fast reader' }
      ]
    },
    {
      question: "How well do you understand complex vocabulary?",
      options: [
        { value: 'basic', label: 'I know basic vocabulary' },
        { value: 'good', label: 'I have a good vocabulary' },
        { value: 'excellent', label: 'I have an excellent vocabulary' }
      ]
    }
  ],
  writing: [
    {
      question: "How confident are you with grammar rules?",
      options: [
        { value: 'unsure', label: 'Often unsure about grammar' },
        { value: 'decent', label: 'Decent understanding' },
        { value: 'strong', label: 'Strong grammar skills' }
      ]
    },
    {
      question: "How comfortable are you with essay writing?",
      options: [
        { value: 'nervous', label: 'I get nervous about essays' },
        { value: 'okay', label: 'I can write decent essays' },
        { value: 'confident', label: 'I\'m confident in my writing' }
      ]
    }
  ]
}

export function SkillAssessment({ onUpdate, onValidityChange, initialData }: SkillAssessmentProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentScore, setCurrentScore] = useState<string>(initialData?.currentScore?.toString() || '')
  
  const sections = [
    { key: 'math', title: 'Mathematics', icon: Calculator, color: 'text-blue-600' },
    { key: 'reading', title: 'Reading', icon: BookOpen, color: 'text-green-600' },
    { key: 'writing', title: 'Writing', icon: PenTool, color: 'text-purple-600' }
  ]

  const currentSectionKey = sections[currentSection].key
  const questions = assessmentQuestions[currentSectionKey as keyof typeof assessmentQuestions]

  useEffect(() => {
    const mathAnswers = assessmentQuestions.math.every((_, i) => answers[`math_${i}`])
    const readingAnswers = assessmentQuestions.reading.every((_, i) => answers[`reading_${i}`])
    const writingAnswers = assessmentQuestions.writing.every((_, i) => answers[`writing_${i}`])
    
    const isComplete = mathAnswers && readingAnswers && writingAnswers
    onValidityChange(isComplete)

    if (isComplete) {
      // Calculate skill levels based on answers
      const skillLevels = {
        mathLevel: calculateSkillLevel('math'),
        readingLevel: calculateSkillLevel('reading'),
        writingLevel: calculateSkillLevel('writing'),
        currentScore: currentScore ? parseInt(currentScore) : undefined
      }
      onUpdate(skillLevels)
    }
  }, [answers, currentScore, onUpdate, onValidityChange])

  const calculateSkillLevel = (section: string) => {
    const sectionAnswers = Object.entries(answers)
      .filter(([key]) => key.startsWith(section))
      .map(([, value]) => value)
    
    if (sectionAnswers.includes('advanced') || sectionAnswers.includes('confident') || sectionAnswers.includes('strong')) {
      return 'advanced'
    } else if (sectionAnswers.includes('intermediate') || sectionAnswers.includes('okay') || sectionAnswers.includes('decent')) {
      return 'intermediate'
    }
    return 'beginner'
  }

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [`${currentSectionKey}_${questionIndex}`]: value
    }))
  }

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1)
    }
  }

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const progress = ((currentSection + 1) / sections.length) * 100
  const CurrentIcon = sections[currentSection].icon

  return (
    <div className="space-y-6">
      {/* Section Progress */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <CurrentIcon className={`h-5 w-5 ${sections[currentSection].color}`} />
          <h3 className="text-lg font-semibold">{sections[currentSection].title} Assessment</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          {currentSection + 1} of {sections.length}
        </div>
      </div>
      
      <Progress value={progress} className="w-full" />

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((question, index) => {
          const questionKey = `${currentSectionKey}_${index}`
          return (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-base">{question.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={answers[questionKey] || ''}
                  onValueChange={(value) => handleAnswerChange(index, value)}
                >
                  {question.options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`${questionKey}_${option.value}`} />
                      <Label htmlFor={`${questionKey}_${option.value}`} className="flex-1">
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

      {/* Previous SAT Score */}
      {currentSection === sections.length - 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-orange-600" />
              Previous SAT Experience
            </CardTitle>
            <CardDescription>
              Have you taken the SAT before? If so, what was your score?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="current-score">Previous SAT Score (optional)</Label>
              <Input
                id="current-score"
                type="number"
                placeholder="e.g., 1200"
                value={currentScore}
                onChange={(e) => setCurrentScore(e.target.value)}
                min="400"
                max="1600"
              />
              <p className="text-xs text-muted-foreground">
                Leave blank if you haven't taken the SAT before
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={prevSection}
          disabled={currentSection === 0}
        >
          Previous Section
        </Button>
        <Button 
          onClick={nextSection}
          disabled={currentSection === sections.length - 1 || !questions.every((_, i) => answers[`${currentSectionKey}_${i}`])}
        >
          {currentSection === sections.length - 1 ? 'Complete Assessment' : 'Next Section'}
        </Button>
      </div>
    </div>
  )
}