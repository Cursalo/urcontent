'use client'

export interface ScreenActivity {
  timestamp: number
  type: 'focus_lost' | 'focus_gained' | 'tab_switch' | 'window_minimize' | 'suspicious_activity'
  details?: {
    previousUrl?: string
    newUrl?: string
    duration?: number
    applicationName?: string
  }
}

export interface MonitoringSession {
  sessionId: string
  testId: string
  userId: string
  startTime: number
  endTime?: number
  activities: ScreenActivity[]
  violations: {
    focusLossCount: number
    tabSwitchCount: number
    suspiciousActivityCount: number
    totalViolationTime: number
  }
  isActive: boolean
}

class ScreenMonitor {
  private session: MonitoringSession | null = null
  private focusStartTime: number = 0
  private isMonitoring: boolean = false
  private listeners: Array<(activity: ScreenActivity) => void> = []
  private violationThresholds = {
    maxFocusLosses: 3,
    maxTabSwitches: 5,
    maxViolationTime: 30000, // 30 seconds
  }

  constructor() {
    this.setupEventListeners()
  }

  // Start monitoring for a test session
  startMonitoring(testId: string, userId: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    this.session = {
      sessionId,
      testId,
      userId,
      startTime: Date.now(),
      activities: [],
      violations: {
        focusLossCount: 0,
        tabSwitchCount: 0,
        suspiciousActivityCount: 0,
        totalViolationTime: 0,
      },
      isActive: true,
    }

    this.isMonitoring = true
    this.focusStartTime = Date.now()
    
    // Start focus monitoring
    this.logActivity('focus_gained', { applicationName: 'Bonsai SAT Test' })
    
    return sessionId
  }

  // Stop monitoring
  stopMonitoring(): MonitoringSession | null {
    if (!this.session) return null

    this.session.endTime = Date.now()
    this.session.isActive = false
    this.isMonitoring = false

    const finalSession = { ...this.session }
    this.session = null

    return finalSession
  }

  // Get current session data
  getCurrentSession(): MonitoringSession | null {
    return this.session
  }

  // Add activity listener
  addActivityListener(listener: (activity: ScreenActivity) => void) {
    this.listeners.push(listener)
  }

  // Remove activity listener
  removeActivityListener(listener: (activity: ScreenActivity) => void) {
    this.listeners = this.listeners.filter(l => l !== listener)
  }

  // Check if monitoring is enabled (for Electron environment)
  isElectronEnvironment(): boolean {
    return typeof window !== 'undefined' && 
           window.navigator.userAgent.includes('Electron')
  }

  // Setup event listeners for web-based monitoring
  private setupEventListeners() {
    if (typeof window === 'undefined') return

    // Focus/blur events
    window.addEventListener('focus', this.handleFocus.bind(this))
    window.addEventListener('blur', this.handleBlur.bind(this))

    // Visibility change (tab switching)
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this))

    // Keyboard shortcuts that might indicate cheating attempts
    document.addEventListener('keydown', this.handleKeyDown.bind(this))

    // Mouse leave (potential window switching)
    document.addEventListener('mouseleave', this.handleMouseLeave.bind(this))

    // Beforeunload (attempting to navigate away)
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this))

    // Page navigation
    window.addEventListener('popstate', this.handleNavigation.bind(this))
  }

  private handleFocus() {
    if (!this.isMonitoring) return

    this.focusStartTime = Date.now()
    this.logActivity('focus_gained')
  }

  private handleBlur() {
    if (!this.isMonitoring) return

    const focusLossTime = Date.now() - this.focusStartTime
    
    this.logActivity('focus_lost', { duration: focusLossTime })
    
    if (this.session) {
      this.session.violations.focusLossCount++
      this.session.violations.totalViolationTime += focusLossTime
    }
  }

  private handleVisibilityChange() {
    if (!this.isMonitoring) return

    if (document.hidden) {
      this.logActivity('tab_switch', { 
        previousUrl: window.location.href,
        duration: Date.now() - this.focusStartTime 
      })
      
      if (this.session) {
        this.session.violations.tabSwitchCount++
      }
    } else {
      this.focusStartTime = Date.now()
      this.logActivity('focus_gained', { newUrl: window.location.href })
    }
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (!this.isMonitoring) return

    // Detect suspicious key combinations
    const suspiciousKeys = [
      'F12', // Developer tools
      'F11', // Fullscreen toggle
    ]

    const suspiciousCombinations = [
      { ctrl: true, shift: true, key: 'I' }, // Developer tools
      { ctrl: true, shift: true, key: 'J' }, // Console
      { ctrl: true, shift: true, key: 'C' }, // Inspector
      { ctrl: true, key: 'U' }, // View source
      { cmd: true, shift: true, key: 'I' }, // Mac developer tools
      { cmd: true, alt: true, key: 'I' }, // Mac developer tools
      { alt: true, key: 'Tab' }, // Alt-tab (task switching)
      { cmd: true, key: 'Tab' }, // Cmd-tab (Mac task switching)
    ]

    if (suspiciousKeys.includes(event.key)) {
      this.logActivity('suspicious_activity', { 
        details: `Suspicious key pressed: ${event.key}` 
      })
      event.preventDefault()
      return
    }

    for (const combo of suspiciousCombinations) {
      const ctrlMatch = combo.ctrl ? event.ctrlKey : true
      const shiftMatch = combo.shift ? event.shiftKey : true
      const cmdMatch = combo.cmd ? event.metaKey : true
      const altMatch = combo.alt ? event.altKey : true
      const keyMatch = combo.key.toLowerCase() === event.key.toLowerCase()

      if (ctrlMatch && shiftMatch && cmdMatch && altMatch && keyMatch) {
        this.logActivity('suspicious_activity', { 
          details: `Suspicious key combination: ${JSON.stringify(combo)}` 
        })
        event.preventDefault()
        break
      }
    }
  }

  private handleMouseLeave() {
    if (!this.isMonitoring) return
    
    // Only log if cursor leaves the window area
    this.logActivity('suspicious_activity', { 
      details: 'Mouse left test window area' 
    })
  }

  private handleBeforeUnload(event: BeforeUnloadEvent) {
    if (!this.isMonitoring) return

    this.logActivity('suspicious_activity', { 
      details: 'Attempted to navigate away from test' 
    })

    // Show confirmation dialog
    const message = 'Are you sure you want to leave the test? Your progress may be lost.'
    event.returnValue = message
    return message
  }

  private handleNavigation() {
    if (!this.isMonitoring) return

    this.logActivity('suspicious_activity', { 
      details: 'Navigation event detected',
      newUrl: window.location.href 
    })
  }

  // Log an activity
  private logActivity(type: ScreenActivity['type'], details?: ScreenActivity['details']) {
    if (!this.session) return

    const activity: ScreenActivity = {
      timestamp: Date.now(),
      type,
      details,
    }

    this.session.activities.push(activity)

    // Update violation counters
    if (type === 'suspicious_activity') {
      this.session.violations.suspiciousActivityCount++
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(activity))

    // Check if violations exceed thresholds
    this.checkViolationThresholds()
  }

  // Check if violations exceed allowed thresholds
  private checkViolationThresholds() {
    if (!this.session) return

    const { violations } = this.session
    const {
      maxFocusLosses,
      maxTabSwitches,
      maxViolationTime,
    } = this.violationThresholds

    if (
      violations.focusLossCount > maxFocusLosses ||
      violations.tabSwitchCount > maxTabSwitches ||
      violations.totalViolationTime > maxViolationTime
    ) {
      this.logActivity('suspicious_activity', { 
        details: 'Violation thresholds exceeded - potential academic dishonesty' 
      })

      // Notify listeners of threshold violation
      this.listeners.forEach(listener => 
        listener({
          timestamp: Date.now(),
          type: 'suspicious_activity',
          details: { 
            details: 'THRESHOLD_VIOLATION',
            violations: JSON.stringify(violations)
          }
        })
      )
    }
  }

  // Generate monitoring report
  generateReport(): {
    summary: {
      totalActivities: number
      totalViolations: number
      riskLevel: 'low' | 'medium' | 'high'
      recommendation: string
    }
    details: {
      focusLosses: number
      tabSwitches: number
      suspiciousActivities: number
      totalViolationTime: number
    }
    timeline: ScreenActivity[]
  } | null {
    if (!this.session) return null

    const { violations, activities } = this.session
    const totalViolations = violations.focusLossCount + 
                          violations.tabSwitchCount + 
                          violations.suspiciousActivityCount

    let riskLevel: 'low' | 'medium' | 'high' = 'low'
    let recommendation = 'Normal test behavior detected.'

    if (totalViolations > 10 || violations.totalViolationTime > 60000) {
      riskLevel = 'high'
      recommendation = 'High risk of academic dishonesty. Manual review recommended.'
    } else if (totalViolations > 5 || violations.totalViolationTime > 30000) {
      riskLevel = 'medium'
      recommendation = 'Moderate suspicious activity. Consider additional verification.'
    }

    return {
      summary: {
        totalActivities: activities.length,
        totalViolations,
        riskLevel,
        recommendation,
      },
      details: {
        focusLosses: violations.focusLossCount,
        tabSwitches: violations.tabSwitchCount,
        suspiciousActivities: violations.suspiciousActivityCount,
        totalViolationTime: violations.totalViolationTime,
      },
      timeline: activities,
    }
  }
}

// Export singleton instance
export const screenMonitor = new ScreenMonitor()

// Hook for React components
export function useScreenMonitoring() {
  const [session, setSession] = useState<MonitoringSession | null>(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const handleActivity = (activity: ScreenActivity) => {
      setSession(screenMonitor.getCurrentSession())
    }

    screenMonitor.addActivityListener(handleActivity)
    return () => screenMonitor.removeActivityListener(handleActivity)
  }, [])

  const startMonitoring = (testId: string, userId: string) => {
    const sessionId = screenMonitor.startMonitoring(testId, userId)
    setSession(screenMonitor.getCurrentSession())
    setIsActive(true)
    return sessionId
  }

  const stopMonitoring = () => {
    const finalSession = screenMonitor.stopMonitoring()
    setSession(null)
    setIsActive(false)
    return finalSession
  }

  return {
    session,
    isActive,
    startMonitoring,
    stopMonitoring,
    generateReport: () => screenMonitor.generateReport(),
    isElectronEnvironment: screenMonitor.isElectronEnvironment(),
  }
}

function useState<T>(initialValue: T): [T, (value: T) => void] {
  // Simple useState implementation for non-React environments
  let value = initialValue
  const setValue = (newValue: T) => {
    value = newValue
  }
  return [value, setValue]
}

function useEffect(callback: () => void | (() => void), deps: any[]) {
  // Simple useEffect implementation - in real use, this would be React's useEffect
  if (typeof window !== 'undefined') {
    callback()
  }
}