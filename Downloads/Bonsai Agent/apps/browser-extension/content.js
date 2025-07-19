// Bonsai SAT Assistant - Content Script
// This script runs on Bluebook pages and initializes the AI assistant

console.log('🌿 Bonsai SAT Assistant - Content Script Loaded')

// Wait for page to load before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeBonsai)
} else {
  initializeBonsai()
}

async function initializeBonsai() {
  try {
    console.log('🌿 Initializing Bonsai Agent on Bluebook...')
    
    // Check if we're actually on a Bluebook page
    if (!isBluebookPage()) {
      console.log('🌿 Not a Bluebook page, skipping initialization')
      return
    }

    // Get user settings from extension storage
    const settings = await getExtensionSettings()
    
    if (!settings.enabled) {
      console.log('🌿 Bonsai Assistant is disabled')
      return
    }

    // Inject the main Bonsai Agent
    await injectBonsaiAgent(settings)
    
    // Start monitoring Bluebook activity
    startBluebookMonitoring()
    
    // Setup communication with extension popup
    setupExtensionCommunication()
    
    console.log('🌿 Bonsai Agent successfully initialized!')
    
  } catch (error) {
    console.error('🌿 Error initializing Bonsai Agent:', error)
  }
}

function isBluebookPage() {
  const bluebookIndicators = [
    'bluebook.collegeboard.org',
    'sat-suite',
    'digital-testing',
    'collegeboard'
  ]
  
  const url = window.location.href.toLowerCase()
  const title = document.title.toLowerCase()
  
  return bluebookIndicators.some(indicator => 
    url.includes(indicator) || title.includes(indicator)
  )
}

async function getExtensionSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({
      enabled: true,
      tutorMode: 'subtle',
      showHints: true,
      generateQuestions: true,
      realTimeHelp: true,
      apiKey: '',
      studentId: ''
    }, resolve)
  })
}

async function injectBonsaiAgent(settings) {
  // Create and inject the Bonsai Agent script
  const script = document.createElement('script')
  script.src = chrome.runtime.getURL('inject.js')
  script.onload = function() {
    // Initialize the agent with settings
    window.postMessage({
      type: 'BONSAI_INIT',
      settings: settings
    }, '*')
    
    // Remove the script element
    this.remove()
  }
  
  // Inject into page
  (document.head || document.documentElement).appendChild(script)
  
  // Also inject CSS styles
  const styles = document.createElement('link')
  styles.rel = 'stylesheet'
  styles.href = chrome.runtime.getURL('styles.css')
  document.head.appendChild(styles)
}

function startBluebookMonitoring() {
  console.log('🌿 Starting Bluebook monitoring...')
  
  // Monitor for test start/navigation
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        checkForTestActivity(mutation)
      }
    })
  })
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true
  })
  
  // Monitor URL changes (for SPA navigation)
  let currentUrl = window.location.href
  setInterval(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href
      handleUrlChange(currentUrl)
    }
  }, 1000)
}

function checkForTestActivity(mutation) {
  // Look for test-specific elements
  const testIndicators = [
    '[data-testid*="question"]',
    '.question-container',
    '.test-question',
    '.sat-question',
    '.passage-content',
    '.answer-choices',
    '.timer',
    '.question-navigation'
  ]
  
  testIndicators.forEach(selector => {
    const elements = document.querySelectorAll(selector)
    if (elements.length > 0) {
      notifyTestActivity(selector, elements.length)
    }
  })
}

function handleUrlChange(newUrl) {
  console.log('🌿 URL changed:', newUrl)
  
  // Notify Bonsai Agent of navigation
  window.postMessage({
    type: 'BONSAI_NAVIGATION',
    url: newUrl,
    timestamp: Date.now()
  }, '*')
}

function notifyTestActivity(selector, count) {
  // Notify Bonsai Agent of test activity
  window.postMessage({
    type: 'BONSAI_TEST_ACTIVITY',
    selector: selector,
    elementCount: count,
    timestamp: Date.now()
  }, '*')
}

function setupExtensionCommunication() {
  // Listen for messages from extension popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('🌿 Message from extension:', request)
    
    switch (request.action) {
      case 'toggleAssistant':
        toggleBonsaiAssistant(request.enabled)
        sendResponse({ success: true })
        break
        
      case 'changeTutorMode':
        changeTutorMode(request.mode)
        sendResponse({ success: true })
        break
        
      case 'getSessionStats':
        getSessionStats().then(stats => sendResponse(stats))
        return true // Async response
        
      case 'generatePracticeQuestions':
        generatePracticeQuestions(request.topic)
        sendResponse({ success: true })
        break
        
      default:
        sendResponse({ error: 'Unknown action' })
    }
  })
  
  // Listen for messages from injected script
  window.addEventListener('message', (event) => {
    if (event.source !== window) return
    
    if (event.data.type === 'BONSAI_STATS_UPDATE') {
      // Forward stats to extension popup
      chrome.runtime.sendMessage({
        type: 'statsUpdate',
        stats: event.data.stats
      })
    }
    
    if (event.data.type === 'BONSAI_ASSISTANCE_REQUEST') {
      // Handle assistance requests
      handleAssistanceRequest(event.data)
    }
  })
}

function toggleBonsaiAssistant(enabled) {
  window.postMessage({
    type: 'BONSAI_TOGGLE',
    enabled: enabled
  }, '*')
}

function changeTutorMode(mode) {
  window.postMessage({
    type: 'BONSAI_TUTOR_MODE',
    mode: mode
  }, '*')
}

async function getSessionStats() {
  return new Promise((resolve) => {
    // Request stats from injected agent
    window.postMessage({
      type: 'BONSAI_GET_STATS'
    }, '*')
    
    // Listen for response
    const listener = (event) => {
      if (event.data.type === 'BONSAI_STATS_RESPONSE') {
        window.removeEventListener('message', listener)
        resolve(event.data.stats)
      }
    }
    
    window.addEventListener('message', listener)
    
    // Timeout after 5 seconds
    setTimeout(() => {
      window.removeEventListener('message', listener)
      resolve({ error: 'Timeout' })
    }, 5000)
  })
}

function generatePracticeQuestions(topic) {
  window.postMessage({
    type: 'BONSAI_GENERATE_QUESTIONS',
    topic: topic
  }, '*')
}

function handleAssistanceRequest(data) {
  // Log assistance request for analytics
  console.log('🌿 Assistance requested:', data)
  
  // Could send to analytics service or extension background
  chrome.runtime.sendMessage({
    type: 'assistanceRequest',
    data: data
  })
}

// Advanced monitoring for question detection
function setupAdvancedMonitoring() {
  // Monitor for specific Bluebook elements
  const config = {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    characterData: true,
    characterDataOldValue: true
  }
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      processTestMutation(mutation)
    })
  })
  
  observer.observe(document, config)
}

function processTestMutation(mutation) {
  // Advanced analysis of DOM changes for test questions
  if (mutation.type === 'childList') {
    const addedNodes = Array.from(mutation.addedNodes)
    const removedNodes = Array.from(mutation.removedNodes)
    
    addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        analyzeNewElement(node)
      }
    })
  }
  
  if (mutation.type === 'characterData') {
    analyzeTextChange(mutation)
  }
}

function analyzeNewElement(element) {
  // Check if this is a question element
  const questionPatterns = [
    /question\s*\d+/i,
    /passage\s*\d+/i,
    /which\s+of\s+the\s+following/i,
    /based\s+on\s+the\s+passage/i,
    /in\s+the\s+context\s+of/i,
    /the\s+author\s+suggests/i
  ]
  
  const text = element.textContent || ''
  const isQuestion = questionPatterns.some(pattern => pattern.test(text))
  
  if (isQuestion && text.length > 20) {
    notifyQuestionDetected(element, text)
  }
}

function analyzeTextChange(mutation) {
  // Monitor for dynamic text changes (like timer updates)
  const target = mutation.target
  const newText = target.textContent
  const oldText = mutation.oldValue
  
  // Check if this might be a timer
  if (isTimerText(newText) && newText !== oldText) {
    notifyTimerUpdate(newText)
  }
}

function isTimerText(text) {
  // Check if text looks like a timer (MM:SS or HH:MM:SS)
  return /^\d{1,2}:\d{2}(:\d{2})?$/.test(text.trim())
}

function notifyQuestionDetected(element, text) {
  window.postMessage({
    type: 'BONSAI_QUESTION_DETECTED',
    element: {
      tagName: element.tagName,
      className: element.className,
      id: element.id,
      text: text.substring(0, 500) // Limit text length
    },
    timestamp: Date.now()
  }, '*')
}

function notifyTimerUpdate(timerText) {
  window.postMessage({
    type: 'BONSAI_TIMER_UPDATE',
    time: timerText,
    timestamp: Date.now()
  }, '*')
}

// Initialize advanced monitoring
setTimeout(setupAdvancedMonitoring, 2000)

// Error handling
window.addEventListener('error', (event) => {
  console.error('🌿 Content script error:', event.error)
})

console.log('🌿 Bonsai Content Script fully loaded and ready')