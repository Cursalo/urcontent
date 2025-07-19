// Bonsai SAT Assistant - Background Service Worker
// Handles extension lifecycle, settings, and cross-tab communication

console.log('🌿 Bonsai Background Service Worker Starting...')

class BonsaiBackgroundService {
  constructor() {
    this.activeTabId = null
    this.sessionData = new Map()
    this.settings = {
      enabled: true,
      tutorMode: 'subtle',
      showHints: true,
      generateQuestions: true,
      realTimeHelp: true,
      apiKey: '',
      studentId: '',
      notificationsEnabled: true,
      autoStartOnBluebook: true
    }
    
    this.initializeExtension()
  }

  async initializeExtension() {
    // Load saved settings
    await this.loadSettings()
    
    // Setup event listeners
    this.setupEventListeners()
    
    // Initialize badge
    this.updateBadge('OFF', '#94a3b8')
    
    console.log('🌿 Bonsai Background Service initialized')
  }

  async loadSettings() {
    try {
      const stored = await chrome.storage.sync.get(this.settings)
      this.settings = { ...this.settings, ...stored }
      console.log('🌿 Settings loaded:', this.settings)
    } catch (error) {
      console.error('🌿 Error loading settings:', error)
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set(this.settings)
      console.log('🌿 Settings saved')
    } catch (error) {
      console.error('🌿 Error saving settings:', error)
    }
  }

  setupEventListeners() {
    // Tab events
    chrome.tabs.onActivated.addListener(this.handleTabActivated.bind(this))
    chrome.tabs.onUpdated.addListener(this.handleTabUpdated.bind(this))
    chrome.tabs.onRemoved.addListener(this.handleTabRemoved.bind(this))

    // Message handling
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this))

    // Extension icon click
    chrome.action.onClicked.addListener(this.handleActionClick.bind(this))

    // Installation and startup
    chrome.runtime.onInstalled.addListener(this.handleInstalled.bind(this))
    chrome.runtime.onStartup.addListener(this.handleStartup.bind(this))

    // Context menu (for advanced features)
    this.setupContextMenu()
  }

  async handleTabActivated(activeInfo) {
    this.activeTabId = activeInfo.tabId
    await this.checkTabForBluebook(activeInfo.tabId)
  }

  async handleTabUpdated(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url) {
      await this.checkTabForBluebook(tabId, tab.url)
    }
  }

  handleTabRemoved(tabId) {
    // Clean up session data for removed tab
    if (this.sessionData.has(tabId)) {
      const session = this.sessionData.get(tabId)
      console.log('🌿 Cleaning up session for closed tab:', session.sessionId)
      this.sessionData.delete(tabId)
    }

    // Update badge if this was the active Bluebook tab
    if (tabId === this.activeTabId) {
      this.updateBadge('OFF', '#94a3b8')
    }
  }

  async checkTabForBluebook(tabId, url = null) {
    try {
      if (!url) {
        const tab = await chrome.tabs.get(tabId)
        url = tab.url
      }

      const isBluebook = this.isBluebookUrl(url)
      
      if (isBluebook) {
        console.log('🌿 Bluebook detected on tab:', tabId)
        await this.activateBonsaiOnTab(tabId)
      } else {
        // Deactivate if switching away from Bluebook
        if (this.sessionData.has(tabId)) {
          await this.deactivateBonsaiOnTab(tabId)
        }
      }
    } catch (error) {
      console.error('🌿 Error checking tab for Bluebook:', error)
    }
  }

  isBluebookUrl(url) {
    if (!url) return false
    
    const bluebookDomains = [
      'bluebook.collegeboard.org',
      'satsuite.collegeboard.org',
      'sat-suite.collegeboard.org'
    ]

    return bluebookDomains.some(domain => url.includes(domain))
  }

  async activateBonsaiOnTab(tabId) {
    try {
      // Create session data
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const sessionData = {
        sessionId,
        tabId,
        startTime: Date.now(),
        isActive: true,
        questionsAnalyzed: 0,
        hintsProvided: 0,
        lastActivity: Date.now()
      }

      this.sessionData.set(tabId, sessionData)
      this.activeTabId = tabId

      // Update badge
      this.updateBadge('ON', '#22c55e')

      // Inject content script if not already injected
      await this.ensureContentScriptInjected(tabId)

      // Send settings to content script
      await chrome.tabs.sendMessage(tabId, {
        action: 'activate',
        settings: this.settings,
        sessionData
      })

      // Show notification if enabled
      if (this.settings.notificationsEnabled) {
        this.showNotification(
          'Bonsai Activated!',
          'AI assistant is now monitoring your SAT test session.',
          'success'
        )
      }

      console.log('🌿 Bonsai activated on tab:', tabId)
    } catch (error) {
      console.error('🌿 Error activating Bonsai:', error)
    }
  }

  async deactivateBonsaiOnTab(tabId) {
    try {
      if (this.sessionData.has(tabId)) {
        const session = this.sessionData.get(tabId)
        session.isActive = false
        session.endTime = Date.now()

        // Send deactivation message
        try {
          await chrome.tabs.sendMessage(tabId, {
            action: 'deactivate',
            sessionData: session
          })
        } catch (error) {
          // Tab might be closed, ignore error
          console.log('🌿 Tab unavailable for deactivation message')
        }

        console.log('🌿 Bonsai deactivated on tab:', tabId)
      }

      // Update badge
      this.updateBadge('OFF', '#94a3b8')
    } catch (error) {
      console.error('🌿 Error deactivating Bonsai:', error)
    }
  }

  async ensureContentScriptInjected(tabId) {
    try {
      // Check if content script is already injected
      const response = await chrome.tabs.sendMessage(tabId, { action: 'ping' })
      console.log('🌿 Content script already active')
    } catch (error) {
      // Content script not injected, inject it
      try {
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['content.js']
        })
        console.log('🌿 Content script injected')
      } catch (injectError) {
        console.error('🌿 Error injecting content script:', injectError)
      }
    }
  }

  async handleMessage(request, sender, sendResponse) {
    const { action, ...data } = request
    
    console.log('🌿 Background received message:', action, data)

    try {
      switch (action) {
        case 'updateSettings':
          await this.updateSettings(data.settings)
          sendResponse({ success: true })
          break

        case 'getSettings':
          sendResponse({ settings: this.settings })
          break

        case 'getSessionData':
          const tabId = sender.tab?.id
          const session = this.sessionData.get(tabId)
          sendResponse({ sessionData: session })
          break

        case 'updateSessionStats':
          await this.updateSessionStats(sender.tab?.id, data.stats)
          sendResponse({ success: true })
          break

        case 'showNotification':
          this.showNotification(data.title, data.message, data.type)
          sendResponse({ success: true })
          break

        case 'statsUpdate':
          await this.handleStatsUpdate(sender.tab?.id, data.stats)
          sendResponse({ success: true })
          break

        case 'assistanceRequest':
          await this.handleAssistanceRequest(sender.tab?.id, data.data)
          sendResponse({ success: true })
          break

        case 'toggleAssistant':
          await this.toggleAssistant(data.enabled)
          sendResponse({ success: true })
          break

        case 'changeTutorMode':
          await this.changeTutorMode(data.mode)
          sendResponse({ success: true })
          break

        case 'getActiveSession':
          const activeSession = this.getActiveSession()
          sendResponse({ session: activeSession })
          break

        case 'ping':
          sendResponse({ pong: true })
          break

        default:
          console.log('🌿 Unknown action:', action)
          sendResponse({ error: 'Unknown action' })
      }
    } catch (error) {
      console.error('🌿 Error handling message:', error)
      sendResponse({ error: error.message })
    }

    // Return true to indicate async response
    return true
  }

  async updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings }
    await this.saveSettings()

    // Broadcast settings update to all active tabs
    const tabs = await chrome.tabs.query({ url: ['*://bluebook.collegeboard.org/*', '*://satsuite.collegeboard.org/*'] })
    
    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'settingsUpdated',
          settings: this.settings
        })
      } catch (error) {
        // Tab might not have content script, ignore
      }
    }

    console.log('🌿 Settings updated and broadcasted')
  }

  async updateSessionStats(tabId, stats) {
    if (!tabId || !this.sessionData.has(tabId)) return

    const session = this.sessionData.get(tabId)
    session.questionsAnalyzed = stats.questionsAnalyzed || 0
    session.hintsProvided = stats.hintsProvided || 0
    session.lastActivity = Date.now()

    // Update badge with stats
    this.updateBadge(`${session.questionsAnalyzed}`, '#3b82f6')
  }

  async handleStatsUpdate(tabId, stats) {
    await this.updateSessionStats(tabId, stats)
    
    // Forward to popup if open
    try {
      chrome.runtime.sendMessage({
        type: 'statsUpdate',
        tabId,
        stats
      })
    } catch (error) {
      // Popup not open, ignore
    }
  }

  async handleAssistanceRequest(tabId, requestData) {
    console.log('🌿 Assistance requested:', requestData)
    
    // Could log to analytics service here
    // Could also trigger advanced AI processing
    
    // Update session data
    if (this.sessionData.has(tabId)) {
      const session = this.sessionData.get(tabId)
      session.lastActivity = Date.now()
    }
  }

  async toggleAssistant(enabled) {
    this.settings.enabled = enabled
    await this.saveSettings()

    // Update all active tabs
    const tabs = await chrome.tabs.query({ url: ['*://bluebook.collegeboard.org/*', '*://satsuite.collegeboard.org/*'] })
    
    for (const tab of tabs) {
      try {
        if (enabled) {
          await this.activateBonsaiOnTab(tab.id)
        } else {
          await this.deactivateBonsaiOnTab(tab.id)
        }
      } catch (error) {
        console.error('🌿 Error toggling assistant on tab:', tab.id, error)
      }
    }

    // Update badge
    this.updateBadge(enabled ? 'ON' : 'OFF', enabled ? '#22c55e' : '#94a3b8')
  }

  async changeTutorMode(mode) {
    this.settings.tutorMode = mode
    await this.saveSettings()

    // Broadcast to active tabs
    const tabs = await chrome.tabs.query({ url: ['*://bluebook.collegeboard.org/*', '*://satsuite.collegeboard.org/*'] })
    
    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'changeTutorMode',
          mode
        })
      } catch (error) {
        // Tab might not have content script, ignore
      }
    }
  }

  getActiveSession() {
    for (const [tabId, session] of this.sessionData.entries()) {
      if (session.isActive) {
        return { ...session, tabId }
      }
    }
    return null
  }

  updateBadge(text, color) {
    chrome.action.setBadgeText({ text })
    chrome.action.setBadgeBackgroundColor({ color })
  }

  showNotification(title, message, type = 'info') {
    if (!this.settings.notificationsEnabled) return

    const iconMap = {
      success: 'icons/icon48.png',
      error: 'icons/icon48.png',
      info: 'icons/icon48.png'
    }

    chrome.notifications.create({
      type: 'basic',
      iconUrl: iconMap[type] || iconMap.info,
      title,
      message,
      silent: false
    })
  }

  async handleActionClick(tab) {
    // Open popup or toggle assistant
    if (this.isBluebookUrl(tab.url)) {
      const enabled = !this.settings.enabled
      await this.toggleAssistant(enabled)
      
      this.showNotification(
        `Bonsai ${enabled ? 'Activated' : 'Deactivated'}`,
        `AI assistant is now ${enabled ? 'active' : 'inactive'} on this page.`,
        enabled ? 'success' : 'info'
      )
    } else {
      // Open options page or show info
      this.showNotification(
        'Bonsai SAT Assistant',
        'Navigate to Bluebook to activate the AI assistant.',
        'info'
      )
    }
  }

  handleInstalled(details) {
    console.log('🌿 Extension installed:', details)
    
    if (details.reason === 'install') {
      // First install - show welcome
      this.showNotification(
        'Welcome to Bonsai!',
        'AI-powered SAT tutoring is ready. Visit Bluebook to get started.',
        'success'
      )
      
      // Open options page
      chrome.runtime.openOptionsPage()
    }
  }

  handleStartup() {
    console.log('🌿 Extension startup')
    this.updateBadge('OFF', '#94a3b8')
  }

  setupContextMenu() {
    // Remove existing context menus
    chrome.contextMenus.removeAll(() => {
      // Add context menu for Bluebook pages
      chrome.contextMenus.create({
        id: 'bonsai-help',
        title: 'Get Bonsai AI Help',
        contexts: ['selection'],
        documentUrlPatterns: [
          '*://bluebook.collegeboard.org/*',
          '*://satsuite.collegeboard.org/*'
        ]
      })

      chrome.contextMenus.create({
        id: 'bonsai-practice',
        title: 'Generate Practice Question',
        contexts: ['page'],
        documentUrlPatterns: [
          '*://bluebook.collegeboard.org/*',
          '*://satsuite.collegeboard.org/*'
        ]
      })

      chrome.contextMenus.create({
        id: 'bonsai-settings',
        title: 'Bonsai Settings',
        contexts: ['page', 'action']
      })
    })

    // Handle context menu clicks
    chrome.contextMenus.onClicked.addListener(async (info, tab) => {
      switch (info.menuItemId) {
        case 'bonsai-help':
          try {
            await chrome.tabs.sendMessage(tab.id, {
              action: 'requestHelp',
              selectedText: info.selectionText
            })
          } catch (error) {
            console.error('🌿 Error sending help request:', error)
          }
          break

        case 'bonsai-practice':
          try {
            await chrome.tabs.sendMessage(tab.id, {
              action: 'generatePracticeQuestions'
            })
          } catch (error) {
            console.error('🌿 Error generating practice questions:', error)
          }
          break

        case 'bonsai-settings':
          chrome.runtime.openOptionsPage()
          break
      }
    })
  }

  // Cleanup method for extension unload
  cleanup() {
    // Save any pending data
    this.saveSettings()
    
    // Clear session data
    this.sessionData.clear()
    
    console.log('🌿 Background service cleaned up')
  }
}

// Initialize the background service
const bonsaiBackgroundService = new BonsaiBackgroundService()

// Handle extension unload
chrome.runtime.onSuspend.addListener(() => {
  bonsaiBackgroundService.cleanup()
})

// Export for potential use by other scripts
globalThis.bonsaiBackgroundService = bonsaiBackgroundService

console.log('🌿 Bonsai Background Service Worker Ready!')