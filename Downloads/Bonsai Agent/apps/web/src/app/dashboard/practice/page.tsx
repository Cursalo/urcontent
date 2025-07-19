'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Clock,
  Target,
  Brain,
  Calculator,
  FileText,
  PlayCircle,
  Trophy,
  BarChart3,
} from 'lucide-react'
import Link from 'next/link'

const practiceTests = [
  {
    id: 1,
    title: 'Full SAT Practice Test #1',
    description: 'Complete 3-hour practice test covering all sections',
    sections: ['Reading', 'Writing & Language', 'Math (No Calculator)', 'Math (Calculator)'],
    duration: '3 hours',
    questions: 154,
    difficulty: 'Official',
    type: 'full_test',
    icon: BookOpen,
  },
  {
    id: 2,
    title: 'Math Section Practice',
    description: 'Focus on mathematical reasoning and problem-solving',
    sections: ['Math (No Calculator)', 'Math (Calculator)'],
    duration: '1.5 hours',
    questions: 58,
    difficulty: 'Mixed',
    type: 'section_practice',
    icon: Calculator,
  },
  {
    id: 3,
    title: 'Reading & Writing Practice',
    description: 'Improve reading comprehension and language skills',
    sections: ['Reading', 'Writing & Language'],
    duration: '1.5 hours',
    questions: 96,
    difficulty: 'Mixed',
    type: 'section_practice',
    icon: FileText,
  },
  {
    id: 4,
    title: 'Adaptive Practice Session',
    description: 'AI-powered questions based on your performance',
    sections: ['Adaptive'],
    duration: '30-60 min',
    questions: '15-30',
    difficulty: 'Adaptive',
    type: 'adaptive',
    icon: Brain,
  },
]

const recentTests = [
  {
    title: 'Full SAT Practice Test #8',
    score: 1420,
    date: '2 days ago',
    sections: {
      reading: 680,
      math: 740,
    },
    improvement: '+40',
  },
  {
    title: 'Math Section Practice',
    score: 750,
    date: '5 days ago',
    sections: {
      math: 750,
    },
    improvement: '+20',
  },
]

export default function PracticePage() {
  const [selectedType, setSelectedType] = useState<string>('all')

  const filteredTests = selectedType === 'all' 
    ? practiceTests 
    : practiceTests.filter(test => test.type === selectedType)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Official':
        return 'bg-blue-100 text-blue-800'
      case 'Mixed':
        return 'bg-green-100 text-green-800'
      case 'Adaptive':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Practice Tests</h1>
          <p className="text-muted-foreground mt-2">
            Build your SAT skills with our comprehensive practice materials
          </p>
        </div>
      </div>

      {/* Recent Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="mr-2 h-5 w-5" />
            Recent Results
          </CardTitle>
          <CardDescription>
            Your latest practice test scores and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {recentTests.map((test, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{test.title}</h3>
                  <Badge variant="outline" className="text-green-600">
                    {test.improvement}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-primary mb-1">
                  {test.score}
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  {test.sections.reading && (
                    <div>Reading & Writing: {test.sections.reading}</div>
                  )}
                  {test.sections.math && (
                    <div>Math: {test.sections.math}</div>
                  )}
                  <div>{test.date}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filter Buttons */}
      <div className="flex space-x-2">
        <Button
          variant={selectedType === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedType('all')}
        >
          All Tests
        </Button>
        <Button
          variant={selectedType === 'full_test' ? 'default' : 'outline'}
          onClick={() => setSelectedType('full_test')}
        >
          Full Tests
        </Button>
        <Button
          variant={selectedType === 'section_practice' ? 'default' : 'outline'}
          onClick={() => setSelectedType('section_practice')}
        >
          Section Practice
        </Button>
        <Button
          variant={selectedType === 'adaptive' ? 'default' : 'outline'}
          onClick={() => setSelectedType('adaptive')}
        >
          Adaptive
        </Button>
      </div>

      {/* Practice Tests Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredTests.map((test) => (
          <Card key={test.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <test.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{test.title}</CardTitle>
                    <Badge className={getDifficultyColor(test.difficulty)}>
                      {test.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>
              <CardDescription>{test.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Test Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{test.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span>{test.questions} questions</span>
                </div>
              </div>

              {/* Sections */}
              <div>
                <h4 className="text-sm font-medium mb-2">Sections:</h4>
                <div className="flex flex-wrap gap-2">
                  {test.sections.map((section, index) => (
                    <Badge key={index} variant="secondary">
                      {section}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href={`/dashboard/practice/${test.id}/bluebook`}>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Start Bluebook Test (AI-Powered)
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/dashboard/practice/${test.id}`}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Standard Practice Test
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Performance Analytics
          </CardTitle>
          <CardDescription>
            Detailed insights into your practice test performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Detailed Analytics Coming Soon</h3>
            <p className="text-muted-foreground">
              Take more practice tests to unlock comprehensive performance insights
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/progress">
                View Current Progress
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}