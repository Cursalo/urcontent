'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Trophy,
  Target,
  TrendingUp,
  Clock,
  BookOpen,
  Brain,
  CheckCircle,
  XCircle,
  RotateCcw,
  Share2,
  Download,
  BarChart3,
} from 'lucide-react'

// Mock results data
const mockResults = {
  totalScore: 1420,
  percentile: 95,
  testDate: '2024-01-15',
  timeSpent: '2h 45m',
  sections: [
    {
      name: 'Evidence-Based Reading and Writing',
      score: 680,
      percentile: 92,
      subscores: [
        { name: 'Reading', score: 34, maxScore: 40 },
        { name: 'Writing and Language', score: 36, maxScore: 40 },
      ],
    },
    {
      name: 'Math',
      score: 740,
      percentile: 97,
      subscores: [
        { name: 'Heart of Algebra', score: 15, maxScore: 20 },
        { name: 'Problem Solving and Data Analysis', score: 16, maxScore: 20 },
        { name: 'Passport to Advanced Math', score: 14, maxScore: 20 },
      ],
    },
  ],
  questionBreakdown: [
    { id: 1, section: 'Reading', correct: true, timeSpent: 45, difficulty: 'Medium' },
    { id: 2, section: 'Reading', correct: false, timeSpent: 62, difficulty: 'Hard' },
    { id: 3, section: 'Reading', correct: true, timeSpent: 38, difficulty: 'Easy' },
    // ... more questions
  ],
  strengths: [
    'Linear equations and systems',
    'Reading comprehension for literature',
    'Grammar and usage',
  ],
  weaknesses: [
    'Complex data interpretation',
    'Advanced geometry concepts',
    'Inference questions in science passages',
  ],
  recommendations: [
    'Focus on geometry practice problems',
    'Review data analysis strategies',
    'Practice timed reading of science passages',
  ],
}

export default function ResultsPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const getScoreColor = (score: number, maxScore: number = 1600) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 70) return 'text-blue-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 90) return 'bg-green-100 text-green-800'
    if (percentile >= 70) return 'bg-blue-100 text-blue-800'
    if (percentile >= 50) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Test Results</h1>
          <p className="text-muted-foreground mt-2">
            Your SAT Practice Test performance and analysis
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
          <Button asChild>
            <Link href="/dashboard/practice">
              Take Another Test
            </Link>
          </Button>
        </div>
      </div>

      {/* Score Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(mockResults.totalScore)}`}>
              {mockResults.totalScore}
            </div>
            <p className="text-xs text-muted-foreground">out of 1600</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Percentile</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockResults.percentile}th</div>
            <p className="text-xs text-muted-foreground">nationwide ranking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockResults.timeSpent}</div>
            <p className="text-xs text-muted-foreground">total time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improvement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">+40</div>
            <p className="text-xs text-muted-foreground">since last test</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sections">Section Breakdown</TabsTrigger>
          <TabsTrigger value="questions">Question Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Section Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Section Scores</CardTitle>
              <CardDescription>
                Performance breakdown by test section
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {mockResults.sections.map((section, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{section.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`text-2xl font-bold ${getScoreColor(section.score, 800)}`}>
                        {section.score}
                      </span>
                      <Badge className={getPercentileColor(section.percentile)}>
                        {section.percentile}th percentile
                      </Badge>
                    </div>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {section.subscores.map((subscore, subIndex) => (
                      <div key={subIndex} className="flex items-center justify-between p-3 border rounded">
                        <span className="text-sm">{subscore.name}</span>
                        <div className="text-right">
                          <div className="font-medium">
                            {subscore.score}/{subscore.maxScore}
                          </div>
                          <Progress 
                            value={(subscore.score / subscore.maxScore) * 100} 
                            className="w-20 h-2 mt-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Strengths and Weaknesses */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {mockResults.strengths.map((strength, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <XCircle className="mr-2 h-5 w-5 text-red-600" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {mockResults.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Section Analysis</CardTitle>
              <CardDescription>
                In-depth performance metrics for each test section
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Detailed Section Analysis</h3>
                <p className="text-muted-foreground">
                  Advanced analytics and performance insights coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Question-by-Question Analysis</CardTitle>
              <CardDescription>
                Review each question with explanations and timing data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Question Analysis</h3>
                <p className="text-muted-foreground">
                  Detailed question review and explanations coming soon
                </p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/practice">
                    Take Another Practice Test
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personalized Study Recommendations</CardTitle>
              <CardDescription>
                AI-powered suggestions to improve your SAT performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockResults.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded">
                  <Target className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm">{recommendation}</p>
                    <Button asChild variant="link" className="p-0 h-auto text-xs">
                      <Link href="/dashboard/study-plan">
                        Add to Study Plan →
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>
                Continue your SAT preparation journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Button asChild variant="outline" className="h-20 flex-col">
                  <Link href="/dashboard/practice">
                    <RotateCcw className="h-6 w-6 mb-2" />
                    <span>Take Another Test</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col">
                  <Link href="/dashboard/questions">
                    <Brain className="h-6 w-6 mb-2" />
                    <span>Practice Weak Areas</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}