export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'study' | 'social' | 'progress' | 'special'
  type: 'bronze' | 'silver' | 'gold' | 'platinum'
  xpReward: number
  requirements: {
    type: 'study_streak' | 'practice_tests' | 'study_hours' | 'score_improvement' | 'social_activity' | 'milestone'
    target: number
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'total'
  }
  unlockedAt?: Date
  progress?: number
}

export interface UserAchievements {
  userId: string
  achievements: Achievement[]
  totalXP: number
  level: number
  unlockedCount: number
}

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  // Study Achievements
  {
    id: 'first_study_session',
    title: 'Getting Started',
    description: 'Complete your first study session',
    icon: '🌱',
    category: 'study',
    type: 'bronze',
    xpReward: 50,
    requirements: {
      type: 'study_hours',
      target: 1,
      timeframe: 'total'
    }
  },
  {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: 'Study for 7 consecutive days',
    icon: '🔥',
    category: 'study',
    type: 'silver',
    xpReward: 200,
    requirements: {
      type: 'study_streak',
      target: 7,
      timeframe: 'daily'
    }
  },
  {
    id: 'month_master',
    title: 'Month Master',
    description: 'Study for 30 consecutive days',
    icon: '👑',
    category: 'study',
    type: 'gold',
    xpReward: 1000,
    requirements: {
      type: 'study_streak',
      target: 30,
      timeframe: 'daily'
    }
  },
  {
    id: 'century_scholar',
    title: 'Century Scholar',
    description: 'Study for 100 total hours',
    icon: '📚',
    category: 'study',
    type: 'platinum',
    xpReward: 2000,
    requirements: {
      type: 'study_hours',
      target: 100,
      timeframe: 'total'
    }
  },

  // Practice Test Achievements
  {
    id: 'test_taker',
    title: 'Test Taker',
    description: 'Complete your first practice test',
    icon: '📝',
    category: 'progress',
    type: 'bronze',
    xpReward: 100,
    requirements: {
      type: 'practice_tests',
      target: 1,
      timeframe: 'total'
    }
  },
  {
    id: 'practice_pro',
    title: 'Practice Pro',
    description: 'Complete 10 practice tests',
    icon: '🎯',
    category: 'progress',
    type: 'silver',
    xpReward: 500,
    requirements: {
      type: 'practice_tests',
      target: 10,
      timeframe: 'total'
    }
  },
  {
    id: 'test_master',
    title: 'Test Master',
    description: 'Complete 25 practice tests',
    icon: '🏆',
    category: 'progress',
    type: 'gold',
    xpReward: 1500,
    requirements: {
      type: 'practice_tests',
      target: 25,
      timeframe: 'total'
    }
  },

  // Score Improvement Achievements
  {
    id: 'first_improvement',
    title: 'Upward Trajectory',
    description: 'Improve your score by 50 points',
    icon: '📈',
    category: 'progress',
    type: 'bronze',
    xpReward: 300,
    requirements: {
      type: 'score_improvement',
      target: 50,
      timeframe: 'total'
    }
  },
  {
    id: 'significant_improvement',
    title: 'Breakthrough',
    description: 'Improve your score by 100 points',
    icon: '🚀',
    category: 'progress',
    type: 'silver',
    xpReward: 600,
    requirements: {
      type: 'score_improvement',
      target: 100,
      timeframe: 'total'
    }
  },
  {
    id: 'major_improvement',
    title: 'Transformation',
    description: 'Improve your score by 200 points',
    icon: '🌟',
    category: 'progress',
    type: 'gold',
    xpReward: 1200,
    requirements: {
      type: 'score_improvement',
      target: 200,
      timeframe: 'total'
    }
  },

  // Social Achievements
  {
    id: 'team_player',
    title: 'Team Player',
    description: 'Join your first study group',
    icon: '👥',
    category: 'social',
    type: 'bronze',
    xpReward: 150,
    requirements: {
      type: 'social_activity',
      target: 1,
      timeframe: 'total'
    }
  },
  {
    id: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Participate in 10 group study sessions',
    icon: '🦋',
    category: 'social',
    type: 'silver',
    xpReward: 400,
    requirements: {
      type: 'social_activity',
      target: 10,
      timeframe: 'total'
    }
  },

  // Special Achievements
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete a study session before 8 AM',
    icon: '🌅',
    category: 'special',
    type: 'bronze',
    xpReward: 100,
    requirements: {
      type: 'milestone',
      target: 1,
      timeframe: 'total'
    }
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete a study session after 10 PM',
    icon: '🦉',
    category: 'special',
    type: 'bronze',
    xpReward: 100,
    requirements: {
      type: 'milestone',
      target: 1,
      timeframe: 'total'
    }
  },
  {
    id: 'weekend_warrior',
    title: 'Weekend Warrior',
    description: 'Study on 4 consecutive weekends',
    icon: '⚔️',
    category: 'special',
    type: 'silver',
    xpReward: 300,
    requirements: {
      type: 'milestone',
      target: 4,
      timeframe: 'weekly'
    }
  }
]

export class AchievementSystem {
  private achievements: Achievement[]
  
  constructor() {
    this.achievements = ACHIEVEMENTS
  }

  // Check if user has unlocked any new achievements
  checkAchievements(userStats: {
    studyHours: number
    studyStreak: number
    practiceTests: number
    scoreImprovement: number
    socialActivities: number
    specialMilestones: Record<string, number>
  }, currentAchievements: Achievement[]): Achievement[] {
    const unlockedIds = new Set(currentAchievements.map(a => a.id))
    const newAchievements: Achievement[] = []

    for (const achievement of this.achievements) {
      if (unlockedIds.has(achievement.id)) continue

      let isUnlocked = false
      const { type, target } = achievement.requirements

      switch (type) {
        case 'study_hours':
          isUnlocked = userStats.studyHours >= target
          break
        case 'study_streak':
          isUnlocked = userStats.studyStreak >= target
          break
        case 'practice_tests':
          isUnlocked = userStats.practiceTests >= target
          break
        case 'score_improvement':
          isUnlocked = userStats.scoreImprovement >= target
          break
        case 'social_activity':
          isUnlocked = userStats.socialActivities >= target
          break
        case 'milestone':
          // Handle special milestone achievements
          const milestoneKey = this.getMilestoneKey(achievement.id)
          isUnlocked = (userStats.specialMilestones[milestoneKey] || 0) >= target
          break
      }

      if (isUnlocked) {
        newAchievements.push({
          ...achievement,
          unlockedAt: new Date(),
          progress: 100
        })
      }
    }

    return newAchievements
  }

  // Calculate progress towards achievements
  calculateProgress(userStats: {
    studyHours: number
    studyStreak: number
    practiceTests: number
    scoreImprovement: number
    socialActivities: number
    specialMilestones: Record<string, number>
  }, currentAchievements: Achievement[]): Achievement[] {
    const unlockedIds = new Set(currentAchievements.map(a => a.id))
    const progressAchievements: Achievement[] = []

    for (const achievement of this.achievements) {
      if (unlockedIds.has(achievement.id)) continue

      const { type, target } = achievement.requirements
      let current = 0

      switch (type) {
        case 'study_hours':
          current = userStats.studyHours
          break
        case 'study_streak':
          current = userStats.studyStreak
          break
        case 'practice_tests':
          current = userStats.practiceTests
          break
        case 'score_improvement':
          current = userStats.scoreImprovement
          break
        case 'social_activity':
          current = userStats.socialActivities
          break
        case 'milestone':
          const milestoneKey = this.getMilestoneKey(achievement.id)
          current = userStats.specialMilestones[milestoneKey] || 0
          break
      }

      const progress = Math.min(100, (current / target) * 100)
      
      if (progress > 0) {
        progressAchievements.push({
          ...achievement,
          progress
        })
      }
    }

    return progressAchievements.sort((a, b) => (b.progress || 0) - (a.progress || 0))
  }

  private getMilestoneKey(achievementId: string): string {
    const milestoneMap: Record<string, string> = {
      'early_bird': 'early_sessions',
      'night_owl': 'night_sessions',
      'weekend_warrior': 'weekend_streaks'
    }
    return milestoneMap[achievementId] || achievementId
  }

  // Get achievement by ID
  getAchievement(id: string): Achievement | undefined {
    return this.achievements.find(a => a.id === id)
  }

  // Get achievements by category
  getAchievementsByCategory(category: Achievement['category']): Achievement[] {
    return this.achievements.filter(a => a.category === category)
  }

  // Calculate user level based on total XP
  calculateLevel(totalXP: number): { level: number; currentLevelXP: number; nextLevelXP: number } {
    // XP required for each level: 100, 250, 450, 700, 1000, 1350, 1750, ...
    // Formula: level_n = 100 + (n-1) * 150 + ((n-1) * (n-2) / 2) * 50
    let level = 1
    let requiredXP = 0
    
    while (true) {
      const nextLevelXP = this.getXPRequiredForLevel(level + 1)
      if (totalXP < nextLevelXP) break
      level++
      requiredXP = nextLevelXP
    }
    
    const currentLevelXP = totalXP - requiredXP
    const nextLevelXP = this.getXPRequiredForLevel(level + 1) - requiredXP
    
    return { level, currentLevelXP, nextLevelXP }
  }

  private getXPRequiredForLevel(level: number): number {
    if (level === 1) return 0
    return 100 + (level - 1) * 150 + ((level - 1) * (level - 2) / 2) * 50
  }

  // Get total possible XP
  getTotalPossibleXP(): number {
    return this.achievements.reduce((total, achievement) => total + achievement.xpReward, 0)
  }
}