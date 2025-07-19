'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Achievement } from '@/lib/gamification/achievement-system'
import { cn } from '@/lib/utils'
import { Lock, Star, Trophy, Medal, Crown, Zap } from 'lucide-react'
import { useState } from 'react'

interface AchievementBadgeProps {
  achievement: Achievement
  size?: 'sm' | 'md' | 'lg'
  showProgress?: boolean
  showDescription?: boolean
  isUnlocked?: boolean
  onClick?: () => void
  className?: string
}

const typeIcons = {
  bronze: Medal,
  silver: Star,
  gold: Trophy,
  platinum: Crown
}

const typeColors = {
  bronze: {
    bg: 'bg-amber-100 dark:bg-amber-900/20',
    border: 'border-amber-300',
    text: 'text-amber-700 dark:text-amber-300',
    icon: 'text-amber-600'
  },
  silver: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    border: 'border-gray-300',
    text: 'text-gray-700 dark:text-gray-300',
    icon: 'text-gray-600'
  },
  gold: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    border: 'border-yellow-300',
    text: 'text-yellow-700 dark:text-yellow-300',
    icon: 'text-yellow-600'
  },
  platinum: {
    bg: 'bg-purple-100 dark:bg-purple-900/20',
    border: 'border-purple-300',
    text: 'text-purple-700 dark:text-purple-300',
    icon: 'text-purple-600'
  }
}

const sizeClasses = {
  sm: {
    container: 'w-16 h-16',
    icon: 'w-6 h-6',
    emoji: 'text-lg',
    title: 'text-xs',
    description: 'text-xs'
  },
  md: {
    container: 'w-20 h-20',
    icon: 'w-8 h-8',
    emoji: 'text-xl',
    title: 'text-sm',
    description: 'text-sm'
  },
  lg: {
    container: 'w-24 h-24',
    icon: 'w-10 h-10',
    emoji: 'text-2xl',
    title: 'text-base',
    description: 'text-sm'
  }
}

export function AchievementBadge({
  achievement,
  size = 'md',
  showProgress = true,
  showDescription = true,
  isUnlocked = !!achievement.unlockedAt,
  onClick,
  className
}: AchievementBadgeProps) {
  const [isHovered, setIsHovered] = useState(false)
  const TypeIcon = typeIcons[achievement.type]
  const colors = typeColors[achievement.type]
  const sizes = sizeClasses[size]
  const progress = achievement.progress || 0

  const handleClick = () => {
    if (onClick) onClick()
  }

  if (size === 'sm') {
    return (
      <div
        className={cn(
          'relative group cursor-pointer',
          className
        )}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={cn(
          sizes.container,
          'rounded-full border-2 flex items-center justify-center relative overflow-hidden transition-all duration-200',
          isUnlocked ? colors.bg : 'bg-gray-100 dark:bg-gray-800',
          isUnlocked ? colors.border : 'border-gray-300',
          isUnlocked ? 'opacity-100 scale-100' : 'opacity-60 scale-95',
          'hover:scale-105'
        )}>
          {!isUnlocked && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
              <Lock className="w-4 h-4 text-gray-500" />
            </div>
          )}
          
          <div className={cn(
            'flex items-center justify-center',
            sizes.emoji
          )}>
            {achievement.icon}
          </div>
          
          {isUnlocked && (
            <div className={cn(
              'absolute -top-1 -right-1 rounded-full border-2 border-white dark:border-gray-900',
              colors.bg
            )}>
              <TypeIcon className={cn('w-3 h-3', colors.icon)} />
            </div>
          )}
        </div>
        
        {/* Tooltip */}
        {isHovered && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
            <div className="bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              {achievement.title}
              {!isUnlocked && progress > 0 && (
                <div className="text-xs text-gray-300">
                  {Math.round(progress)}% complete
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card
      className={cn(
        'transition-all duration-200 cursor-pointer group',
        isUnlocked ? 'hover:shadow-lg' : 'opacity-70',
        onClick && 'hover:scale-105',
        className
      )}
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className={cn(
            sizes.container,
            'rounded-full border-2 flex items-center justify-center relative',
            isUnlocked ? colors.bg : 'bg-gray-100 dark:bg-gray-800',
            isUnlocked ? colors.border : 'border-gray-300'
          )}>
            {!isUnlocked && (
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center rounded-full">
                <Lock className={cn(sizes.icon, 'text-gray-500')} />
              </div>
            )}
            
            <div className={cn(
              'flex items-center justify-center',
              sizes.emoji
            )}>
              {achievement.icon}
            </div>
          </div>
          
          <div className="text-right">
            <Badge 
              variant={isUnlocked ? 'default' : 'outline'}
              className={cn(
                isUnlocked ? colors.bg : '',
                isUnlocked ? colors.text : 'text-gray-500'
              )}
            >
              <TypeIcon className={cn(
                'w-3 h-3 mr-1',
                isUnlocked ? colors.icon : 'text-gray-400'
              )} />
              {achievement.type}
            </Badge>
            {isUnlocked && (
              <div className="text-xs text-muted-foreground mt-1">
                +{achievement.xpReward} XP
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <CardTitle className={cn(
          sizes.title,
          isUnlocked ? colors.text : 'text-gray-500'
        )}>
          {achievement.title}
        </CardTitle>
        
        {showDescription && (
          <CardDescription className={sizes.description}>
            {achievement.description}
          </CardDescription>
        )}
        
        {!isUnlocked && showProgress && progress > 0 && (
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        {isUnlocked && achievement.unlockedAt && (
          <div className="mt-2 text-xs text-muted-foreground">
            Unlocked {achievement.unlockedAt.toLocaleDateString()}
          </div>
        )}
        
        {/* Category badge */}
        <div className="mt-2">
          <Badge variant="outline" className="text-xs capitalize">
            {achievement.category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

// Achievement showcase for multiple badges
export function AchievementShowcase({ 
  achievements, 
  title = 'Achievements',
  maxVisible = 6,
  size = 'sm' as const
}: {
  achievements: Achievement[]
  title?: string
  maxVisible?: number
  size?: 'sm' | 'md' | 'lg'
}) {
  const unlockedAchievements = achievements.filter(a => a.unlockedAt)
  const visibleAchievements = achievements.slice(0, maxVisible)
  const remainingCount = Math.max(0, achievements.length - maxVisible)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center">
          <Trophy className="w-4 h-4 mr-2 text-yellow-600" />
          {title}
        </h3>
        <Badge variant="secondary">
          {unlockedAchievements.length}/{achievements.length}
        </Badge>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {visibleAchievements.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            size={size}
            showProgress={false}
            showDescription={false}
          />
        ))}
        
        {remainingCount > 0 && (
          <div className={cn(
            sizeClasses[size].container,
            'rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500'
          )}>
            <span className="text-xs font-medium">+{remainingCount}</span>
          </div>
        )}
      </div>
    </div>
  )
}