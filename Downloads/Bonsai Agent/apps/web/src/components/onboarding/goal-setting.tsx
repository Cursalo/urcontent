'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Target, Calendar, TrendingUp, Star } from 'lucide-react'

interface GoalSettingProps {
  onUpdate: (data: any) => void
  onValidityChange: (isValid: boolean) => void
  initialData?: any
}

const improvementAreas = [
  { id: 'algebra', label: 'Algebra', category: 'Math' },
  { id: 'geometry', label: 'Geometry', category: 'Math' },
  { id: 'trigonometry', label: 'Trigonometry', category: 'Math' },
  { id: 'statistics', label: 'Statistics & Probability', category: 'Math' },
  { id: 'reading-comprehension', label: 'Reading Comprehension', category: 'Reading' },
  { id: 'vocabulary', label: 'Vocabulary', category: 'Reading' },
  { id: 'data-analysis', label: 'Data Analysis', category: 'Reading' },
  { id: 'grammar', label: 'Grammar & Usage', category: 'Writing' },
  { id: 'essay-writing', label: 'Essay Writing', category: 'Writing' },
  { id: 'sentence-structure', label: 'Sentence Structure', category: 'Writing' },
  { id: 'time-management', label: 'Time Management', category: 'Test Strategy' },
  { id: 'test-anxiety', label: 'Test Anxiety', category: 'Test Strategy' }
]

const scoreRanges = [
  { range: '1400-1600', label: 'Elite (1400-1600)', description: 'Top tier universities' },
  { range: '1300-1399', label: 'Excellent (1300-1399)', description: 'Highly competitive schools' },
  { range: '1200-1299', label: 'Good (1200-1299)', description: 'Strong state universities' },
  { range: '1100-1199', label: 'Above Average (1100-1199)', description: 'Many good colleges' },
  { range: '1000-1099', label: 'Average (1000-1099)', description: 'Most state schools' },
  { range: '900-999', label: 'Below Average (900-999)', description: 'Community colleges, some 4-year' }
]

export function GoalSetting({ onUpdate, onValidityChange, initialData }: GoalSettingProps) {
  const [targetScore, setTargetScore] = useState<string>(initialData?.targetScore?.toString() || '')
  const [testDate, setTestDate] = useState<string>(initialData?.testDate || '')
  const [selectedAreas, setSelectedAreas] = useState<string[]>(initialData?.improvementAreas || [])
  const [motivation, setMotivation] = useState<string>(initialData?.motivation || '')

  useEffect(() => {
    const isValid = targetScore && testDate && selectedAreas.length > 0 && motivation.trim().length > 0
    onValidityChange(!!isValid)

    if (isValid) {
      onUpdate({
        targetScore: parseInt(targetScore),
        testDate,
        improvementAreas: selectedAreas,
        motivation: motivation.trim()
      })
    }
  }, [targetScore, testDate, selectedAreas, motivation, onUpdate, onValidityChange])

  const toggleImprovementArea = (areaId: string) => {
    setSelectedAreas(prev => 
      prev.includes(areaId) 
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    )
  }

  const getScoreRangeInfo = (score: number) => {
    return scoreRanges.find(range => {
      const [min, max] = range.range.split('-').map(s => parseInt(s.replace(/\D/g, '')))
      return score >= min && score <= max
    })
  }

  const scoreInfo = targetScore ? getScoreRangeInfo(parseInt(targetScore)) : null

  // Get minimum test date (2 weeks from now)
  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 14)
  const minDateString = minDate.toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      {/* Target Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-blue-600" />
            Target SAT Score
          </CardTitle>
          <CardDescription>
            What score are you aiming for? This will help us create your personalized study plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="target-score">Target Score</Label>
            <Input
              id="target-score"
              type="number"
              placeholder="e.g., 1450"
              value={targetScore}
              onChange={(e) => setTargetScore(e.target.value)}
              min="400"
              max="1600"
            />
          </div>
          
          {scoreInfo && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-200">
                  {scoreInfo.label}
                </span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {scoreInfo.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Date */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-green-600" />
            Test Date
          </CardTitle>
          <CardDescription>
            When are you planning to take the SAT? We'll create a timeline to help you prepare.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="test-date">Planned Test Date</Label>
            <Input
              id="test-date"
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              min={minDateString}
            />
            <p className="text-xs text-muted-foreground">
              We recommend at least 2 weeks of preparation time
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Improvement Areas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
            Areas for Improvement
          </CardTitle>
          <CardDescription>
            Select the areas where you'd like to focus your study efforts. You can choose multiple areas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['Math', 'Reading', 'Writing', 'Test Strategy'].map(category => (
              <div key={category} className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">{category}</h4>
                <div className="space-y-1">
                  {improvementAreas
                    .filter(area => area.category === category)
                    .map(area => (
                      <Badge
                        key={area.id}
                        variant={selectedAreas.includes(area.id) ? 'default' : 'outline'}
                        className="cursor-pointer mr-1 mb-1"
                        onClick={() => toggleImprovementArea(area.id)}
                      >
                        {area.label}
                      </Badge>
                    ))
                  }
                </div>
              </div>
            ))}
          </div>
          {selectedAreas.length === 0 && (
            <p className="text-sm text-red-500 mt-2">
              Please select at least one area for improvement
            </p>
          )}
        </CardContent>
      </Card>

      {/* Motivation */}
      <Card>
        <CardHeader>
          <CardTitle>Your Motivation</CardTitle>
          <CardDescription>
            Tell us why you're taking the SAT. This helps us keep you motivated during your journey.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="motivation">What's driving you to achieve your target score?</Label>
            <Textarea
              id="motivation"
              placeholder="e.g., I want to get into my dream university, improve my career prospects, challenge myself academically..."
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {motivation.length}/500 characters
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}