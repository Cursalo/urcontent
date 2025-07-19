'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { SkillAssessment } from './skill-assessment'
import { GoalSetting } from './goal-setting'
import { LearningStyleQuiz } from './learning-style-quiz'
import { ScheduleSetup } from './schedule-setup'
import { WelcomeCompletion } from './welcome-completion'
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'

export interface OnboardingData {
  skillAssessment: {
    mathLevel: string
    readingLevel: string
    writingLevel: string
    currentScore?: number
  }
  goals: {
    targetScore: number
    testDate: string
    improvementAreas: string[]
    motivation: string
  }
  learningStyle: {
    visualLearner: boolean
    auditoryLearner: boolean
    kinestheticLearner: boolean
    readingLearner: boolean
    preferredStudyTime: string
    sessionLength: string
  }
  schedule: {
    weeklyHours: number
    preferredDays: string[]
    timeSlots: string[]
    reminders: boolean
  }
}

const steps = [
  {
    id: 'assessment',
    title: 'Skill Assessment',
    description: 'Let\'s understand your current SAT level'
  },
  {
    id: 'goals',
    title: 'Set Your Goals',
    description: 'Define your target score and timeline'
  },
  {
    id: 'learning-style',
    title: 'Learning Style',
    description: 'Discover how you learn best'
  },
  {
    id: 'schedule',
    title: 'Study Schedule',
    description: 'Plan your study routine'
  },
  {
    id: 'completion',
    title: 'You\'re Ready!',
    description: 'Your personalized SAT prep journey begins'
  }
]

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void
  onSkip: () => void
}

export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({})
  const [isValid, setIsValid] = useState(false)

  const updateOnboardingData = (stepData: any) => {
    const stepId = steps[currentStep].id
    setOnboardingData(prev => ({
      ...prev,
      [stepId === 'assessment' ? 'skillAssessment' : 
       stepId === 'goals' ? 'goals' :
       stepId === 'learning-style' ? 'learningStyle' :
       stepId === 'schedule' ? 'schedule' : stepId]: stepData
    }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setIsValid(false)
    } else {
      onComplete(onboardingData as OnboardingData)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStep = () => {
    switch (steps[currentStep].id) {
      case 'assessment':
        return (
          <SkillAssessment 
            onUpdate={updateOnboardingData}
            onValidityChange={setIsValid}
            initialData={onboardingData.skillAssessment}
          />
        )
      case 'goals':
        return (
          <GoalSetting 
            onUpdate={updateOnboardingData}
            onValidityChange={setIsValid}
            initialData={onboardingData.goals}
          />
        )
      case 'learning-style':
        return (
          <LearningStyleQuiz 
            onUpdate={updateOnboardingData}
            onValidityChange={setIsValid}
            initialData={onboardingData.learningStyle}
          />
        )
      case 'schedule':
        return (
          <ScheduleSetup 
            onUpdate={updateOnboardingData}
            onValidityChange={setIsValid}
            initialData={onboardingData.schedule}
          />
        )
      case 'completion':
        return (
          <WelcomeCompletion 
            data={onboardingData as OnboardingData}
            onComplete={() => onComplete(onboardingData as OnboardingData)}
          />
        )
      default:
        return null
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to Bonsai</h1>
          <p className="text-muted-foreground">Let's personalize your SAT prep experience</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index < currentStep ? 'bg-green-500 text-white' :
                  index === currentStep ? 'bg-blue-500 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 w-16 mx-2 ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        {steps[currentStep].id !== 'completion' && (
          <div className="flex justify-between mt-6">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button variant="ghost" onClick={onSkip}>
                Skip Setup
              </Button>
            </div>
            <Button 
              onClick={nextStep}
              disabled={!isValid && currentStep < steps.length - 1}
            >
              {currentStep === steps.length - 2 ? 'Finish' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}