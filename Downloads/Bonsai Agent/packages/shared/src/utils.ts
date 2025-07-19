import { format, parseISO, differenceInDays, addDays } from 'date-fns'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, formatStr: string = 'PPP'): string {
  if (typeof date === 'string') {
    return format(parseISO(date), formatStr)
  }
  return format(date, formatStr)
}

export function calculateDaysUntilTarget(targetDate: string): number {
  return differenceInDays(parseISO(targetDate), new Date())
}

export function generateStudySchedule(targetDate: string, hoursPerWeek: number = 10): Array<{ date: string; hours: number }> {
  const daysUntil = calculateDaysUntilTarget(targetDate)
  const weeksUntil = Math.ceil(daysUntil / 7)
  const schedule = []
  
  for (let week = 0; week < weeksUntil; week++) {
    const weekStart = addDays(new Date(), week * 7)
    schedule.push({
      date: format(weekStart, 'yyyy-MM-dd'),
      hours: hoursPerWeek
    })
  }
  
  return schedule
}

export function calculateScoreImprovement(baselineScore: number, targetScore: number, daysStudied: number, totalDays: number): number {
  const progressRatio = daysStudied / totalDays
  const scoreDifference = targetScore - baselineScore
  const expectedImprovement = scoreDifference * progressRatio
  
  return Math.min(baselineScore + expectedImprovement, targetScore)
}

export function formatTimeSpent(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  } else {
    return `${remainingSeconds}s`
  }
}

export function generateAvatar(name: string): string {
  const initials = name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
  
  return `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff&size=128`
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}