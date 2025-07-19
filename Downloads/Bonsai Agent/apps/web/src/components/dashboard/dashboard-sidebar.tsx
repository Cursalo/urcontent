'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Home,
  BookOpen,
  Target,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Clock,
  Trophy,
  Brain,
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Overview and progress'
  },
  {
    name: 'Practice Tests',
    href: '/dashboard/practice',
    icon: BookOpen,
    description: 'Take full-length practice exams',
    badge: 'New'
  },
  {
    name: 'Study Plan',
    href: '/dashboard/study-plan',
    icon: Target,
    description: 'Personalized study roadmap'
  },
  {
    name: 'Question Bank',
    href: '/dashboard/questions',
    icon: Brain,
    description: 'Practice specific topics'
  },
  {
    name: 'Study Groups',
    href: '/dashboard/groups',
    icon: Users,
    description: 'Collaborate with peers'
  },
  {
    name: 'Tutoring',
    href: '/dashboard/tutoring',
    icon: GraduationCap,
    description: 'Connect with expert tutors'
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    description: 'Advanced learning analytics',
    badge: 'AI'
  },
  {
    name: 'Study Sessions',
    href: '/dashboard/sessions',
    icon: Clock,
    description: 'Review your study history'
  },
  {
    name: 'Achievements',
    href: '/dashboard/achievements',
    icon: Trophy,
    description: 'View your milestones'
  },
  {
    name: 'Messages',
    href: '/dashboard/messages',
    icon: MessageSquare,
    description: 'Chat with tutors and peers'
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Account and preferences'
  },
]

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className={cn(
      'relative flex flex-col border-r bg-background transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
              </svg>
            </div>
            <span className="text-lg font-semibold">Bonsai</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn('h-8 w-8 p-0', collapsed && 'mx-auto')}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className={cn('h-4 w-4', !collapsed && 'mr-3')} />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Study Streak */}
      {!collapsed && (
        <div className="border-t p-4">
          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">Study Streak</span>
            </div>
            <p className="text-2xl font-bold text-primary mt-1">7 days</p>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </div>
        </div>
      )}
    </div>
  )
}