'use client'

import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Star, Zap, TrendingUp, Award } from 'lucide-react'
import { useState, useEffect } from 'react'

interface XPProgressBarProps {
  currentXP: number
  nextLevelXP: number
  currentLevel: number
  totalXP: number
  weeklyXP?: number
  monthlyXP?: number
  recentXPGain?: number
  streakMultiplier?: number
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
  animated?: boolean
  className?: string
}

const levelTitles: Record<number, string> = {
  1: 'Novice',
  5: 'Student',
  10: 'Scholar',
  15: 'Expert',
  20: 'Master',
  25: 'Grandmaster',
  30: 'Legend',
  40: 'Mythic',
  50: 'Transcendent'
}

const getLevelTitle = (level: number): string => {
  const titles = Object.keys(levelTitles).map(Number).sort((a, b) => b - a)
  for (const titleLevel of titles) {
    if (level >= titleLevel) {
      return levelTitles[titleLevel]
    }
  }
  return 'Beginner'
}

const getLevelColor = (level: number): string => {
  if (level >= 50) return 'text-purple-600'
  if (level >= 40) return 'text-pink-600'
  if (level >= 30) return 'text-red-600'
  if (level >= 25) return 'text-orange-600'
  if (level >= 20) return 'text-yellow-600'
  if (level >= 15) return 'text-green-600'
  if (level >= 10) return 'text-blue-600'
  if (level >= 5) return 'text-indigo-600'
  return 'text-gray-600'
}

const getProgressColor = (level: number): string => {
  if (level >= 50) return 'bg-purple-500'
  if (level >= 40) return 'bg-pink-500'
  if (level >= 30) return 'bg-red-500'
  if (level >= 25) return 'bg-orange-500'
  if (level >= 20) return 'bg-yellow-500'
  if (level >= 15) return 'bg-green-500'
  if (level >= 10) return 'bg-blue-500'
  if (level >= 5) return 'bg-indigo-500'
  return 'bg-gray-500'
}

export function XPProgressBar({
  currentXP,
  nextLevelXP,
  currentLevel,
  totalXP,
  weeklyXP,
  monthlyXP,
  recentXPGain,
  streakMultiplier = 1,
  size = 'md',
  showDetails = true,
  animated = true,
  className
}: XPProgressBarProps) {
  const [displayedXP, setDisplayedXP] = useState(animated ? 0 : currentXP)
  const [showXPGain, setShowXPGain] = useState(false)
  
  const progress = (currentXP / nextLevelXP) * 100
  const levelTitle = getLevelTitle(currentLevel)
  const levelColor = getLevelColor(currentLevel)
  const progressColor = getProgressColor(currentLevel)
  
  // Animated XP counting
  useEffect(() => {
    if (!animated) return
    
    const duration = 1500
    const startTime = Date.now()
    const startXP = displayedXP
    const targetXP = currentXP
    
    const updateXP = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const newXP = Math.floor(startXP + (targetXP - startXP) * easeOut)
      
      setDisplayedXP(newXP)
      
      if (progress < 1) {
        requestAnimationFrame(updateXP)
      }
    }
    
    requestAnimationFrame(updateXP)
  }, [currentXP, animated, displayedXP])
  
  // Show recent XP gain animation
  useEffect(() => {
    if (recentXPGain && recentXPGain > 0) {
      setShowXPGain(true)
      const timer = setTimeout(() => setShowXPGain(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [recentXPGain])
  
  if (size === 'sm') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <div className="flex items-center space-x-1">
          <Star className={cn('w-4 h-4', levelColor)} />
          <span className="text-sm font-medium">{currentLevel}</span>
        </div>
        
        <div className="flex-1 relative">
          <Progress 
            value={progress} 
            className="h-2"
            style={{
              '--progress-background': progressColor
            } as React.CSSProperties}
          />
          {showXPGain && recentXPGain && (
            <div className="absolute -top-6 right-0 text-xs font-medium text-green-600 animate-bounce">
              +{recentXPGain} XP
            </div>
          )}
        </div>
        
        <span className="text-xs text-muted-foreground">
          {displayedXP}/{nextLevelXP}
        </span>
      </div>
    )
  }
  
  if (size === 'lg') {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2',
                  progressColor.replace('bg-', 'border-'),
                  progressColor.replace('bg-', 'bg-').replace('500', '100')
                )}>
                  <Star className={cn('w-5 h-5', levelColor)} />
                </div>
                <div>
                  <div className="text-xl font-bold">Level {currentLevel}</div>
                  <div className={cn('text-sm', levelColor)}>{levelTitle}</div>
                </div>
              </CardTitle>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold">{totalXP.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total XP</div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {currentLevel + 1}</span>
              <span className="font-medium">
                {displayedXP.toLocaleString()}/{nextLevelXP.toLocaleString()} XP
              </span>
            </div>
            <div className="relative">
              <Progress 
                value={progress} 
                className="h-3"
                style={{
                  '--progress-background': progressColor
                } as React.CSSProperties}
              />
              {showXPGain && recentXPGain && (
                <div className="absolute -top-8 right-0 bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium animate-bounce">
                  +{recentXPGain} XP
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {Math.round(progress)}% complete
            </div>
          </div>
          
          {showDetails && (
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{weeklyXP || 0}</div>
                <div className="text-xs text-muted-foreground">This Week</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{monthlyXP || 0}</div>
                <div className="text-xs text-muted-foreground">This Month</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">
                  ×{streakMultiplier.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Streak Bonus</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
  
  // Default medium size
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center border-2',
            progressColor.replace('bg-', 'border-'),
            progressColor.replace('bg-', 'bg-').replace('500', '100')
          )}>
            <Star className={cn('w-4 h-4', levelColor)} />
          </div>
          <div>
            <div className="font-semibold">Level {currentLevel}</div>
            <div className={cn('text-xs', levelColor)}>{levelTitle}</div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="font-semibold">{totalXP.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Total XP</div>
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Next Level</span>
          <span className="font-medium">
            {displayedXP.toLocaleString()}/{nextLevelXP.toLocaleString()}
          </span>
        </div>
        <div className="relative">
          <Progress 
            value={progress} 
            className="h-2"
            style={{
              '--progress-background': progressColor
            } as React.CSSProperties}
          />
          {showXPGain && recentXPGain && (
            <div className="absolute -top-6 right-0 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium animate-bounce">
              +{recentXPGain} XP
            </div>
          )}
        </div>
      </div>
      
      {showDetails && (
        <div className="flex justify-between pt-2 border-t">
          <div className="text-center">
            <div className="text-sm font-medium text-blue-600">{weeklyXP || 0}</div>
            <div className="text-xs text-muted-foreground">Week</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-green-600">{monthlyXP || 0}</div>
            <div className="text-xs text-muted-foreground">Month</div>
          </div>
          {streakMultiplier > 1 && (
            <div className="text-center">
              <div className="text-sm font-medium text-orange-600 flex items-center">
                <Zap className="w-3 h-3 mr-1" />
                ×{streakMultiplier.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">Streak</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// XP Animation Component for when user gains XP
export function XPGainAnimation({ 
  amount, 
  onComplete 
}: { 
  amount: number
  onComplete: () => void 
}) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000)
    return () => clearTimeout(timer)
  }, [onComplete])
  
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg animate-bounce">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5" />
          <span className="text-lg font-bold">+{amount} XP</span>
        </div>
      </div>
    </div>
  )
}