'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Calendar, Clock, Bell, Target } from 'lucide-react'

interface ScheduleSetupProps {
  onUpdate: (data: any) => void
  onValidityChange: (isValid: boolean) => void
  initialData?: any
}

const daysOfWeek = [
  { id: 'monday', label: 'Monday', short: 'Mon' },
  { id: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { id: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { id: 'thursday', label: 'Thursday', short: 'Thu' },
  { id: 'friday', label: 'Friday', short: 'Fri' },
  { id: 'saturday', label: 'Saturday', short: 'Sat' },
  { id: 'sunday', label: 'Sunday', short: 'Sun' }
]

const timeSlots = [
  { id: 'early-morning', label: 'Early Morning (6 AM - 9 AM)', value: 'early-morning' },
  { id: 'morning', label: 'Morning (9 AM - 12 PM)', value: 'morning' },
  { id: 'afternoon', label: 'Afternoon (12 PM - 5 PM)', value: 'afternoon' },
  { id: 'evening', label: 'Evening (5 PM - 8 PM)', value: 'evening' },
  { id: 'night', label: 'Night (8 PM - 11 PM)', value: 'night' }
]

const studyIntensityOptions = [
  { value: '5', label: 'Light (5 hours/week)', description: 'Perfect for busy schedules' },
  { value: '10', label: 'Moderate (10 hours/week)', description: 'Balanced approach' },
  { value: '15', label: 'Intensive (15 hours/week)', description: 'Serious preparation' },
  { value: '20', label: 'Maximum (20+ hours/week)', description: 'Crash course mode' }
]

export function ScheduleSetup({ onUpdate, onValidityChange, initialData }: ScheduleSetupProps) {
  const [weeklyHours, setWeeklyHours] = useState<string>(initialData?.weeklyHours?.toString() || '')
  const [preferredDays, setPreferredDays] = useState<string[]>(initialData?.preferredDays || [])
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>(initialData?.timeSlots || [])
  const [reminders, setReminders] = useState<boolean>(initialData?.reminders ?? true)

  useEffect(() => {
    const isValid = weeklyHours && preferredDays.length > 0 && selectedTimeSlots.length > 0
    onValidityChange(!!isValid)

    if (isValid) {
      onUpdate({
        weeklyHours: parseInt(weeklyHours),
        preferredDays,
        timeSlots: selectedTimeSlots,
        reminders
      })
    }
  }, [weeklyHours, preferredDays, selectedTimeSlots, reminders, onUpdate, onValidityChange])

  const toggleDay = (dayId: string) => {
    setPreferredDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(id => id !== dayId)
        : [...prev, dayId]
    )
  }

  const toggleTimeSlot = (timeSlotId: string) => {
    setSelectedTimeSlots(prev => 
      prev.includes(timeSlotId) 
        ? prev.filter(id => id !== timeSlotId)
        : [...prev, timeSlotId]
    )
  }

  const getStudySessionsPerWeek = () => {
    if (!weeklyHours) return 0
    const hours = parseInt(weeklyHours)
    const avgSessionLength = 1 // Assume 1 hour sessions
    return Math.ceil(hours / avgSessionLength)
  }

  const getRecommendedSchedule = () => {
    const sessions = getStudySessionsPerWeek()
    const daysSelected = preferredDays.length
    
    if (sessions === 0 || daysSelected === 0) return null
    
    const sessionsPerDay = Math.ceil(sessions / daysSelected)
    const hoursPerSession = parseInt(weeklyHours) / sessions
    
    return {
      sessionsPerWeek: sessions,
      sessionsPerDay,
      hoursPerSession: Math.round(hoursPerSession * 10) / 10
    }
  }

  const schedule = getRecommendedSchedule()

  return (
    <div className="space-y-6">
      {/* Study Intensity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-blue-600" />
            Study Intensity
          </CardTitle>
          <CardDescription>
            How many hours per week can you dedicate to SAT preparation?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={weeklyHours} onValueChange={setWeeklyHours}>
            {studyIntensityOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          <div className="mt-4">
            <Label htmlFor="custom-hours">Or enter custom hours per week:</Label>
            <Input
              id="custom-hours"
              type="number"
              placeholder="e.g., 12"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(e.target.value)}
              min="1"
              max="40"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Preferred Days */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-green-600" />
            Preferred Study Days
          </CardTitle>
          <CardDescription>
            Select the days of the week when you can study consistently.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {daysOfWeek.map((day) => (
              <Badge
                key={day.id}
                variant={preferredDays.includes(day.id) ? 'default' : 'outline'}
                className="cursor-pointer text-center py-2 px-1"
                onClick={() => toggleDay(day.id)}
              >
                <div>
                  <div className="font-medium">{day.short}</div>
                  <div className="text-xs">{day.label.slice(0, 3)}</div>
                </div>
              </Badge>
            ))}
          </div>
          {preferredDays.length === 0 && (
            <p className="text-sm text-red-500 mt-2">
              Please select at least one day
            </p>
          )}
        </CardContent>
      </Card>

      {/* Preferred Time Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-purple-600" />
            Preferred Time Slots
          </CardTitle>
          <CardDescription>
            When during the day do you prefer to study? You can select multiple time slots.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {timeSlots.map((slot) => (
              <Badge
                key={slot.id}
                variant={selectedTimeSlots.includes(slot.value) ? 'default' : 'outline'}
                className="cursor-pointer mr-2 mb-2"
                onClick={() => toggleTimeSlot(slot.value)}
              >
                {slot.label}
              </Badge>
            ))}
          </div>
          {selectedTimeSlots.length === 0 && (
            <p className="text-sm text-red-500 mt-2">
              Please select at least one time slot
            </p>
          )}
        </CardContent>
      </Card>

      {/* Study Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2 text-orange-600" />
            Study Reminders
          </CardTitle>
          <CardDescription>
            Would you like to receive reminders for your study sessions?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button
              variant={reminders ? 'default' : 'outline'}
              onClick={() => setReminders(true)}
            >
              Yes, remind me
            </Button>
            <Button
              variant={!reminders ? 'default' : 'outline'}
              onClick={() => setReminders(false)}
            >
              No, I'll manage myself
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Preview */}
      {schedule && (
        <Card>
          <CardHeader>
            <CardTitle>Your Study Schedule Preview</CardTitle>
            <CardDescription>
              Based on your preferences, here's your recommended study schedule:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{schedule.sessionsPerWeek}</div>
                <div className="text-sm text-muted-foreground">Sessions per week</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{schedule.hoursPerSession}h</div>
                <div className="text-sm text-muted-foreground">Hours per session</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{preferredDays.length}</div>
                <div className="text-sm text-muted-foreground">Study days selected</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Tip:</strong> Consistent, shorter sessions are often more effective than cramming. 
                Your schedule looks {schedule.hoursPerSession <= 2 ? 'well-balanced' : 'intensive'} 
                for optimal learning!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}