'use client'

import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BookOpen,
  Target,
  Users,
  Trophy,
  Clock,
  TrendingUp,
  Calendar,
  BarChart3,
  PlayCircle,
  Star,
  Zap,
  Brain,
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user } = useAuth()

  const stats = [
    {
      title: 'Current Score',
      value: '1420',
      change: '+40',
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Study Streak',
      value: '7 days',
      change: 'Personal best!',
      icon: Zap,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Practice Tests',
      value: '12',
      change: '3 this week',
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Study Hours',
      value: '45.2h',
      change: '+5.5h this week',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

  const recentActivities = [
    {
      type: 'practice_test',
      title: 'Math Practice Test #8',
      score: '750/800',
      time: '2 hours ago',
      icon: BookOpen,
    },
    {
      type: 'study_session',
      title: 'Reading Comprehension',
      duration: '45 minutes',
      time: '1 day ago',
      icon: Brain,
    },
    {
      type: 'achievement',
      title: 'Week Warrior Badge Earned',
      description: '7 days study streak',
      time: '2 days ago',
      icon: Trophy,
    },
  ]

  const upcomingGoals = [
    {
      title: 'Reach 1500 SAT Score',
      progress: 85,
      deadline: 'Dec 15, 2024',
      status: 'on_track',
    },
    {
      title: 'Complete 20 Practice Tests',
      progress: 60,
      deadline: 'Jan 1, 2025',
      status: 'on_track',
    },
    {
      title: 'Master Algebra Concepts',
      progress: 40,
      deadline: 'Dec 1, 2024',
      status: 'behind',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.user_metadata?.full_name || 'Student'}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Ready to continue your SAT prep journey? Let's achieve your target score together.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/practice">
            <PlayCircle className="mr-2 h-4 w-4" />
            Start Practice Test
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Study Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Study Goals
            </CardTitle>
            <CardDescription>
              Track your progress towards your SAT preparation goals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingGoals.map((goal, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{goal.title}</span>
                  <Badge
                    variant={goal.status === 'on_track' ? 'default' : 'destructive'}
                  >
                    {goal.status === 'on_track' ? 'On Track' : 'Behind'}
                  </Badge>
                </div>
                <Progress value={goal.progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{goal.progress}% complete</span>
                  <span>Due {goal.deadline}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest study sessions and achievements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="p-2 rounded-full bg-muted">
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    {'score' in activity && <span>Score: {activity.score}</span>}
                    {'duration' in activity && <span>Duration: {activity.duration}</span>}
                    {'description' in activity && <span>{activity.description}</span>}
                    <span>•</span>
                    <span>{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Jump into your most used features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/dashboard/practice">
                <BookOpen className="h-6 w-6 mb-2" />
                <span>Practice Test</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/dashboard/questions">
                <Brain className="h-6 w-6 mb-2" />
                <span>Question Bank</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/dashboard/groups">
                <Users className="h-6 w-6 mb-2" />
                <span>Study Groups</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/dashboard/progress">
                <BarChart3 className="h-6 w-6 mb-2" />
                <span>View Progress</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}