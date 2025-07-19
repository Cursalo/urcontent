export interface XPEvent {
  id: string
  type: 'study_session' | 'practice_test' | 'question_correct' | 'achievement' | 'social_activity' | 'milestone'
  baseXP: number
  multiplier?: number
  description: string
  timestamp: Date
}

export interface XPMultiplier {
  type: 'streak' | 'difficulty' | 'performance' | 'time_bonus' | 'group_bonus'
  value: number
  description: string
  duration?: number // in days
}

export interface UserXP {
  userId: string
  totalXP: number
  currentLevel: number
  currentLevelXP: number
  nextLevelXP: number
  weeklyXP: number
  monthlyXP: number
  streakMultiplier: number
  lastActivity: Date
}

// Base XP values for different activities
export const XP_VALUES = {
  // Study Activities
  STUDY_SESSION_START: 10,
  STUDY_SESSION_COMPLETE_15MIN: 25,
  STUDY_SESSION_COMPLETE_30MIN: 50,
  STUDY_SESSION_COMPLETE_60MIN: 100,
  STUDY_SESSION_COMPLETE_90MIN: 150,
  
  // Practice Tests
  PRACTICE_TEST_START: 20,
  PRACTICE_TEST_COMPLETE: 200,
  PRACTICE_TEST_PERFECT_SECTION: 500,
  
  // Question Answering
  QUESTION_CORRECT_EASY: 5,
  QUESTION_CORRECT_MEDIUM: 10,
  QUESTION_CORRECT_HARD: 20,
  QUESTION_STREAK_5: 25,
  QUESTION_STREAK_10: 75,
  QUESTION_STREAK_20: 200,
  
  // Social Activities
  JOIN_STUDY_GROUP: 50,
  HELP_PEER: 30,
  RECEIVE_HELP: 15,
  GROUP_STUDY_SESSION: 75,
  CHALLENGE_PARTICIPANT: 100,
  CHALLENGE_WINNER: 300,
  
  // Milestones
  DAILY_GOAL_COMPLETE: 100,
  WEEKLY_GOAL_COMPLETE: 500,
  MONTHLY_GOAL_COMPLETE: 2000,
  SCORE_IMPROVEMENT_25: 250,
  SCORE_IMPROVEMENT_50: 500,
  SCORE_IMPROVEMENT_100: 1000,
  
  // Special Bonuses
  EARLY_BIRD_BONUS: 25, // Study before 8 AM
  NIGHT_OWL_BONUS: 25,  // Study after 10 PM
  WEEKEND_WARRIOR: 50,  // Study on weekends
  CONSISTENCY_BONUS: 100, // Study same time daily
}

// Streak multipliers
export const STREAK_MULTIPLIERS = {
  3: 1.1,  // 10% bonus
  7: 1.25, // 25% bonus
  14: 1.5, // 50% bonus
  30: 2.0, // 100% bonus
  60: 2.5, // 150% bonus
  100: 3.0 // 200% bonus
}

export class ExperiencePointsSystem {
  private events: XPEvent[] = []
  
  // Calculate XP for an activity
  calculateXP(activity: {
    type: XPEvent['type']
    baseActivity: keyof typeof XP_VALUES
    difficulty?: 'easy' | 'medium' | 'hard'
    duration?: number // in minutes
    performance?: number // 0-100
    streakCount?: number
    isGroupActivity?: boolean
    timeOfDay?: 'early' | 'normal' | 'late'
    isWeekend?: boolean
  }): { xp: number; multipliers: XPMultiplier[]; breakdown: string } {
    let baseXP = XP_VALUES[activity.baseActivity] || 0
    const multipliers: XPMultiplier[] = []
    let totalMultiplier = 1
    
    // Duration-based XP for study sessions
    if (activity.type === 'study_session' && activity.duration) {
      if (activity.duration >= 90) {
        baseXP = XP_VALUES.STUDY_SESSION_COMPLETE_90MIN
      } else if (activity.duration >= 60) {
        baseXP = XP_VALUES.STUDY_SESSION_COMPLETE_60MIN
      } else if (activity.duration >= 30) {
        baseXP = XP_VALUES.STUDY_SESSION_COMPLETE_30MIN
      } else if (activity.duration >= 15) {
        baseXP = XP_VALUES.STUDY_SESSION_COMPLETE_15MIN
      }
    }
    
    // Difficulty multiplier
    if (activity.difficulty) {
      const difficultyMultiplier = {
        easy: 1.0,
        medium: 1.2,
        hard: 1.5
      }[activity.difficulty]
      
      if (difficultyMultiplier > 1) {
        multipliers.push({
          type: 'difficulty',
          value: difficultyMultiplier,
          description: `${activity.difficulty.charAt(0).toUpperCase() + activity.difficulty.slice(1)} difficulty bonus`
        })
        totalMultiplier *= difficultyMultiplier
      }
    }
    
    // Performance multiplier for practice tests
    if (activity.performance && activity.type === 'practice_test') {
      if (activity.performance >= 95) {
        multipliers.push({
          type: 'performance',
          value: 2.0,
          description: 'Near perfect performance!'
        })
        totalMultiplier *= 2.0
      } else if (activity.performance >= 85) {
        multipliers.push({
          type: 'performance',
          value: 1.5,
          description: 'Excellent performance!'
        })
        totalMultiplier *= 1.5
      } else if (activity.performance >= 75) {
        multipliers.push({
          type: 'performance',
          value: 1.25,
          description: 'Great performance!'
        })
        totalMultiplier *= 1.25
      }
    }
    
    // Streak multiplier
    if (activity.streakCount) {
      const streakBonus = this.getStreakMultiplier(activity.streakCount)
      if (streakBonus > 1) {
        multipliers.push({
          type: 'streak',
          value: streakBonus,
          description: `${activity.streakCount} day study streak!`
        })
        totalMultiplier *= streakBonus
      }
    }
    
    // Group activity bonus
    if (activity.isGroupActivity) {
      multipliers.push({
        type: 'group_bonus',
        value: 1.3,
        description: 'Group study bonus'
      })
      totalMultiplier *= 1.3
    }
    
    // Time of day bonuses
    if (activity.timeOfDay === 'early') {
      baseXP += XP_VALUES.EARLY_BIRD_BONUS
      multipliers.push({
        type: 'time_bonus',
        value: 1.0,
        description: 'Early bird bonus'
      })
    } else if (activity.timeOfDay === 'late') {
      baseXP += XP_VALUES.NIGHT_OWL_BONUS
      multipliers.push({
        type: 'time_bonus',
        value: 1.0,
        description: 'Night owl bonus'
      })
    }
    
    // Weekend bonus
    if (activity.isWeekend) {
      baseXP += XP_VALUES.WEEKEND_WARRIOR
      multipliers.push({
        type: 'time_bonus',
        value: 1.0,
        description: 'Weekend warrior bonus'
      })
    }
    
    const finalXP = Math.floor(baseXP * totalMultiplier)
    
    const breakdown = this.createXPBreakdown(baseXP, multipliers, finalXP)
    
    return { xp: finalXP, multipliers, breakdown }
  }
  
  // Award XP to user
  awardXP(userId: string, activity: Parameters<typeof this.calculateXP>[0], description?: string): XPEvent {
    const { xp, multipliers, breakdown } = this.calculateXP(activity)
    
    const event: XPEvent = {
      id: `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: activity.type,
      baseXP: xp,
      multiplier: multipliers.reduce((acc, m) => acc * m.value, 1),
      description: description || breakdown,
      timestamp: new Date()
    }
    
    this.events.push(event)
    return event
  }
  
  // Get streak multiplier
  private getStreakMultiplier(streakCount: number): number {
    const streakLevels = Object.keys(STREAK_MULTIPLIERS)
      .map(Number)
      .sort((a, b) => b - a) // Sort descending
    
    for (const level of streakLevels) {
      if (streakCount >= level) {
        return STREAK_MULTIPLIERS[level as keyof typeof STREAK_MULTIPLIERS]
      }
    }
    
    return 1.0
  }
  
  // Create XP breakdown description
  private createXPBreakdown(baseXP: number, multipliers: XPMultiplier[], finalXP: number): string {
    let breakdown = `Base: ${baseXP} XP`
    
    if (multipliers.length > 0) {
      const bonusDescriptions = multipliers.map(m => {
        if (m.type === 'time_bonus') {
          return m.description
        }
        return `${m.description} (×${m.value})`
      })
      breakdown += ` + ${bonusDescriptions.join(', ')}`
    }
    
    if (finalXP !== baseXP) {
      breakdown += ` = ${finalXP} XP`
    }
    
    return breakdown
  }
  
  // Calculate user's current XP stats
  calculateUserXP(userId: string, userEvents: XPEvent[]): UserXP {
    const now = new Date()
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    let totalXP = 0
    let weeklyXP = 0
    let monthlyXP = 0
    let lastActivity = new Date(0)
    
    for (const event of userEvents) {
      totalXP += event.baseXP
      
      if (event.timestamp >= weekStart) {
        weeklyXP += event.baseXP
      }
      
      if (event.timestamp >= monthStart) {
        monthlyXP += event.baseXP
      }
      
      if (event.timestamp > lastActivity) {
        lastActivity = event.timestamp
      }
    }
    
    // Calculate level
    const { level, currentLevelXP, nextLevelXP } = this.calculateLevel(totalXP)
    
    // Calculate streak multiplier (this would come from streak tracking)
    const streakMultiplier = 1.0 // Placeholder
    
    return {
      userId,
      totalXP,
      currentLevel: level,
      currentLevelXP,
      nextLevelXP,
      weeklyXP,
      monthlyXP,
      streakMultiplier,
      lastActivity
    }
  }
  
  // Calculate level from total XP
  private calculateLevel(totalXP: number): { level: number; currentLevelXP: number; nextLevelXP: number } {
    let level = 1
    let xpForCurrentLevel = 0
    
    while (true) {
      const xpNeededForNext = this.getXPForLevel(level + 1)
      if (totalXP < xpNeededForNext) break
      xpForCurrentLevel = xpNeededForNext
      level++
    }
    
    const currentLevelXP = totalXP - xpForCurrentLevel
    const nextLevelXP = this.getXPForLevel(level + 1) - xpForCurrentLevel
    
    return { level, currentLevelXP, nextLevelXP }
  }
  
  // Calculate XP required for a specific level
  private getXPForLevel(level: number): number {
    if (level === 1) return 0
    // Exponential growth: 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250, ...
    return 100 * level + 50 * level * (level - 1)
  }
  
  // Get leaderboard data
  getLeaderboard(userXPData: UserXP[], timeframe: 'weekly' | 'monthly' | 'all-time' = 'all-time'): UserXP[] {
    const sortField = timeframe === 'weekly' ? 'weeklyXP' : timeframe === 'monthly' ? 'monthlyXP' : 'totalXP'
    return [...userXPData].sort((a, b) => b[sortField] - a[sortField])
  }
  
  // Check if user leveled up
  checkLevelUp(previousXP: number, newXP: number): { leveledUp: boolean; newLevel?: number; previousLevel?: number } {
    const previousLevel = this.calculateLevel(previousXP).level
    const newLevel = this.calculateLevel(newXP).level
    
    return {
      leveledUp: newLevel > previousLevel,
      newLevel: newLevel > previousLevel ? newLevel : undefined,
      previousLevel: newLevel > previousLevel ? previousLevel : undefined
    }
  }
}