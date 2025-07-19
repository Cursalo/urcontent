/**
 * Main Voice Assistant Orchestrator
 * Coordinates all voice processing components for seamless interaction
 */

import { 
  VoiceAssistantState, 
  VoiceSettings, 
  VoiceCommand, 
  VoiceResponse, 
  VoiceSession, 
  SessionContext,
  VoiceCapabilities,
  VoiceError,
  VoiceAnalytics,
  StudentProfile
} from './voice-types';

import { SpeechRecognitionEngine } from './speech-recognition';
import { TextToSpeechEngine } from './text-to-speech';
import { VoiceCommandProcessor } from './voice-commands';
import { WakeWordDetector } from './wake-word-detection';
import { AudioProcessingEngine } from './audio-processing';

interface VoiceAssistantConfig {
  settings: VoiceSettings;
  studentProfile: StudentProfile;
  enableWakeWord: boolean;
  enableAdvancedProcessing: boolean;
  enableRealTimeCoaching: boolean;
  apiEndpoints: {
    processCommand: string;
    generateResponse: string;
    analytics: string;
    coaching: string;
  };
}

interface VoiceAssistantCallbacks {
  onStateChange: (state: VoiceAssistantState) => void;
  onCommandProcessed: (command: VoiceCommand, response: VoiceResponse) => void;
  onError: (error: VoiceError) => void;
  onSessionUpdate: (session: VoiceSession) => void;
  onAnalyticsUpdate: (analytics: VoiceAnalytics) => void;
}

export class VoiceAssistant {
  private speechRecognition: SpeechRecognitionEngine;
  private textToSpeech: TextToSpeechEngine;
  private commandProcessor: VoiceCommandProcessor;
  private wakeWordDetector: WakeWordDetector;
  private audioProcessor: AudioProcessingEngine;

  private state: VoiceAssistantState;
  private config: VoiceAssistantConfig;
  private callbacks: VoiceAssistantCallbacks;
  private currentSession: VoiceSession | null = null;
  private sessionContext: SessionContext | null = null;

  // Response generation
  private responseQueue: VoiceResponse[] = [];
  private isProcessingResponse: boolean = false;
  private lastResponse: VoiceResponse | null = null;

  // Integration components
  private wsConnection: WebSocket | null = null;
  private computerVisionEnabled: boolean = false;
  private liveCoachingEnabled: boolean = false;

  // Performance monitoring
  private performanceMetrics = {
    totalCommands: 0,
    successfulCommands: 0,
    averageResponseTime: 0,
    sessionStartTime: 0,
    lastActivityTime: 0
  };

  constructor(config: VoiceAssistantConfig, callbacks: VoiceAssistantCallbacks) {
    this.config = config;
    this.callbacks = callbacks;

    // Initialize state
    this.state = {
      isListening: false,
      isProcessing: false,
      isSpeaking: false,
      isPaused: false,
      isWakeWordActive: config.enableWakeWord,
      currentCommand: null,
      currentResponse: null,
      session: null,
      error: null,
      connectionStatus: 'disconnected'
    };

    // Initialize components
    this.speechRecognition = new SpeechRecognitionEngine({
      language: config.settings.language,
      continuous: true,
      interimResults: true
    });

    this.textToSpeech = new TextToSpeechEngine(config.settings);
    this.commandProcessor = new VoiceCommandProcessor();
    this.wakeWordDetector = new WakeWordDetector({
      sensitivity: 0.8,
      keywords: ['hey bonsai', 'bonsai help', 'tutor help'],
      continuousListening: config.enableWakeWord
    });

    this.audioProcessor = new AudioProcessingEngine({
      sampleRate: 16000,
      channels: 1,
      noiseReduction: config.enableAdvancedProcessing,
      echoCancellation: config.enableAdvancedProcessing,
      autoGainControl: true,
      noiseSuppression: true
    });

    this.setupCallbacks();
    this.initializeIntegrations();
  }

  private setupCallbacks(): void {
    // Speech recognition callbacks
    this.speechRecognition.setCallbacks({
      onResult: this.handleSpeechResult.bind(this),
      onError: this.handleSpeechError.bind(this),
      onStart: () => this.updateState({ isListening: true }),
      onEnd: () => this.updateState({ isListening: false })
    });

    // Wake word detection callbacks
    this.wakeWordDetector.setCallbacks({
      onWakeWordDetected: this.handleWakeWordDetected.bind(this),
      onError: this.handleWakeWordError.bind(this),
      onStatusChange: this.handleWakeWordStatusChange.bind(this)
    });

    // Text-to-speech callbacks
    // (handled in individual speak calls)
  }

  private async initializeIntegrations(): Promise<void> {
    try {
      // Initialize WebSocket connection for real-time features
      if (this.config.enableRealTimeCoaching) {
        await this.initializeWebSocket();
      }

      // Check for computer vision integration
      this.computerVisionEnabled = await this.checkComputerVisionAvailability();
      
      this.updateState({ connectionStatus: 'connected' });
    } catch (error) {
      console.error('Failed to initialize integrations:', error);
      this.handleError({
        code: 'INTEGRATION_INIT_FAILED',
        message: 'Failed to initialize voice assistant integrations',
        timestamp: Date.now(),
        context: { error }
      });
    }
  }

  private async initializeWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.wsConnection = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');
        
        this.wsConnection.onopen = () => {
          this.liveCoachingEnabled = true;
          resolve();
        };

        this.wsConnection.onmessage = this.handleWebSocketMessage.bind(this);
        this.wsConnection.onerror = reject;
        this.wsConnection.onclose = () => {
          this.liveCoachingEnabled = false;
          this.updateState({ connectionStatus: 'disconnected' });
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  private async checkComputerVisionAvailability(): Promise<boolean> {
    try {
      const response = await fetch('/api/vision/status');
      return response.ok;
    } catch {
      return false;
    }
  }

  public async startSession(context: SessionContext): Promise<void> {
    this.sessionContext = context;
    this.commandProcessor.setSessionContext(context);

    // Create new session
    this.currentSession = {
      id: this.generateSessionId(),
      userId: context.personalizedProfile.id,
      startTime: Date.now(),
      commands: [],
      responses: [],
      analytics: this.initializeAnalytics(),
      context
    };

    this.performanceMetrics.sessionStartTime = Date.now();
    this.performanceMetrics.lastActivityTime = Date.now();

    // Start wake word detection if enabled
    if (this.config.enableWakeWord) {
      await this.startWakeWordDetection();
    }

    this.updateState({ 
      session: this.currentSession,
      isWakeWordActive: this.config.enableWakeWord 
    });

    // Send welcome message
    await this.speakWelcome();
  }

  public async stopSession(): Promise<void> {
    // Stop all voice processing
    await this.stopListening();
    await this.stopSpeaking();
    await this.stopWakeWordDetection();

    // Finalize session analytics
    if (this.currentSession) {
      this.currentSession.endTime = Date.now();
      this.finalizeSessionAnalytics();
      
      // Send session data to analytics
      await this.sendSessionAnalytics(this.currentSession);
    }

    this.currentSession = null;
    this.sessionContext = null;
    this.updateState({ session: null, isWakeWordActive: false });
  }

  public async pauseSession(): Promise<void> {
    await this.stopListening();
    await this.stopSpeaking();
    this.updateState({ isPaused: true });
    
    await this.speak({
      text: "Session paused. Say 'Hey Bonsai' or 'Resume' to continue.",
      voice: this.getBestVoice('instruction'),
      rate: this.config.settings.speed,
      pitch: this.config.settings.pitch,
      volume: this.config.settings.volume,
      language: this.config.settings.language
    });
  }

  public async resumeSession(): Promise<void> {
    this.updateState({ isPaused: false });
    
    if (this.config.enableWakeWord) {
      await this.startWakeWordDetection();
    }

    await this.speak({
      text: "Session resumed. How can I help you?",
      voice: this.getBestVoice('instruction'),
      rate: this.config.settings.speed,
      pitch: this.config.settings.pitch,
      volume: this.config.settings.volume,
      language: this.config.settings.language
    });
  }

  private async startWakeWordDetection(): Promise<void> {
    if (this.state.isPaused) return;

    try {
      await this.wakeWordDetector.startListening();
      this.updateState({ isWakeWordActive: true });
    } catch (error) {
      console.error('Failed to start wake word detection:', error);
      this.handleError({
        code: 'WAKE_WORD_START_FAILED',
        message: 'Failed to start wake word detection',
        timestamp: Date.now(),
        context: { error }
      });
    }
  }

  private async stopWakeWordDetection(): Promise<void> {
    this.wakeWordDetector.stopListening();
    this.updateState({ isWakeWordActive: false });
  }

  public async startListening(): Promise<void> {
    if (this.state.isPaused || this.state.isListening) return;

    try {
      await this.speechRecognition.startListening();
      this.performanceMetrics.lastActivityTime = Date.now();
    } catch (error) {
      console.error('Failed to start listening:', error);
      this.handleError({
        code: 'SPEECH_RECOGNITION_START_FAILED',
        message: 'Failed to start speech recognition',
        timestamp: Date.now(),
        context: { error }
      });
    }
  }

  public async stopListening(): Promise<void> {
    this.speechRecognition.stopListening();
  }

  public async stopSpeaking(): Promise<void> {
    this.textToSpeech.stop();
    this.responseQueue = [];
    this.updateState({ isSpeaking: false, currentResponse: null });
  }

  private handleSpeechResult(result: any): void {
    if (!result.isFinal || this.state.isPaused) return;

    const command = this.commandProcessor.processCommand(result.transcript, result.confidence);
    this.processVoiceCommand(command);
  }

  private handleSpeechError(error: Error): void {
    this.handleError({
      code: 'SPEECH_RECOGNITION_ERROR',
      message: error.message,
      timestamp: Date.now(),
      context: { error }
    });
  }

  private handleWakeWordDetected(keyword: string, confidence: number): void {
    if (this.state.isPaused) return;

    // Stop wake word detection temporarily
    this.wakeWordDetector.stopListening();
    
    // Start speech recognition
    this.startListening();
    
    // Give audio feedback
    this.playAudioFeedback('activation');
    
    // Restart wake word detection after a delay
    setTimeout(() => {
      if (!this.state.isListening) {
        this.startWakeWordDetection();
      }
    }, 5000);
  }

  private handleWakeWordError(error: Error): void {
    console.error('Wake word detection error:', error);
  }

  private handleWakeWordStatusChange(status: string): void {
    // Handle wake word detector status changes
  }

  private async processVoiceCommand(command: VoiceCommand): Promise<void> {
    if (!this.currentSession) return;

    this.updateState({ isProcessing: true, currentCommand: command });
    this.performanceMetrics.totalCommands++;
    this.performanceMetrics.lastActivityTime = Date.now();

    try {
      // Add command to session
      this.currentSession.commands.push(command);
      
      // Process command based on intent
      const response = await this.generateResponse(command);
      
      if (response) {
        // Add response to session
        this.currentSession.responses.push(response);
        this.lastResponse = response;
        
        // Execute response
        await this.executeResponse(response);
        
        // Update analytics
        this.updateAnalytics(command, response);
        this.performanceMetrics.successfulCommands++;
        
        this.callbacks.onCommandProcessed(command, response);
      }

    } catch (error) {
      console.error('Failed to process voice command:', error);
      this.handleError({
        code: 'COMMAND_PROCESSING_FAILED',
        message: 'Failed to process voice command',
        timestamp: Date.now(),
        context: { command, error }
      });

      // Provide fallback response
      await this.speakError();
    } finally {
      command.processed = true;
      this.updateState({ isProcessing: false, currentCommand: null });
    }
  }

  private async generateResponse(command: VoiceCommand): Promise<VoiceResponse | null> {
    const startTime = Date.now();

    try {
      let response: VoiceResponse | null = null;

      // Handle different command intents
      switch (command.intent) {
        case 'request_hint':
          response = await this.generateHintResponse(command);
          break;
        case 'request_explanation':
          response = await this.generateExplanationResponse(command);
          break;
        case 'request_strategy':
          response = await this.generateStrategyResponse(command);
          break;
        case 'check_time':
          response = this.generateTimeResponse();
          break;
        case 'skip_question':
          response = this.generateSkipResponse();
          break;
        case 'pause_session':
          await this.pauseSession();
          response = null;
          break;
        case 'resume_session':
          await this.resumeSession();
          response = null;
          break;
        case 'end_session':
          await this.stopSession();
          response = null;
          break;
        case 'report_confusion':
          response = await this.generateConfusionResponse(command);
          break;
        case 'request_encouragement':
          response = this.generateEncouragementResponse();
          break;
        case 'check_progress':
          response = await this.generateProgressResponse();
          break;
        case 'repeat_last':
          response = this.lastResponse;
          break;
        case 'volume_control':
          this.handleVolumeControl(command.parameters.action);
          response = null;
          break;
        case 'mute':
          this.config.settings.volume = 0;
          response = null;
          break;
        case 'unmute':
          this.config.settings.volume = 0.8;
          response = null;
          break;
        case 'help':
          response = this.generateHelpResponse();
          break;
        default:
          response = await this.generateFallbackResponse(command);
      }

      // Update response time metrics
      const responseTime = Date.now() - startTime;
      this.updateResponseTimeMetrics(responseTime);

      return response;

    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  }

  private async generateHintResponse(command: VoiceCommand): Promise<VoiceResponse> {
    // Integrate with AI systems for contextual hints
    const requestData = {
      intent: 'hint',
      context: this.sessionContext,
      parameters: command.parameters,
      studentProfile: this.config.studentProfile
    };

    try {
      const response = await fetch(this.config.apiEndpoints.processCommand, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      
      return {
        id: this.generateResponseId(),
        text: data.hint || "Here's a hint: Look for key information in the question that relates to the concept being tested.",
        type: 'hint',
        priority: 'medium',
        metadata: {
          questionId: this.sessionContext?.questionNumber.toString(),
          skillArea: command.parameters.skillArea,
          strategy: data.strategy
        }
      };

    } catch (error) {
      // Fallback hint
      return {
        id: this.generateResponseId(),
        text: "Try breaking down the problem into smaller steps. What information do you have, and what do you need to find?",
        type: 'hint',
        priority: 'medium',
        metadata: {}
      };
    }
  }

  private async generateExplanationResponse(command: VoiceCommand): Promise<VoiceResponse> {
    // Use AI to generate contextual explanations
    const requestData = {
      intent: 'explanation',
      context: this.sessionContext,
      parameters: command.parameters,
      studentProfile: this.config.studentProfile
    };

    try {
      const response = await fetch(this.config.apiEndpoints.processCommand, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      
      return {
        id: this.generateResponseId(),
        text: data.explanation || "Let me explain this concept step by step...",
        type: 'explanation',
        priority: 'high',
        metadata: {
          questionId: this.sessionContext?.questionNumber.toString(),
          skillArea: command.parameters.skillArea,
          difficulty: command.parameters.depth || 'medium'
        }
      };

    } catch (error) {
      return {
        id: this.generateResponseId(),
        text: "This type of problem tests your understanding of key concepts. Let's focus on the main idea first.",
        type: 'explanation',
        priority: 'high',
        metadata: {}
      };
    }
  }

  private async generateStrategyResponse(command: VoiceCommand): Promise<VoiceResponse> {
    // Generate strategic advice based on question type and student profile
    const strategies = [
      "For this type of question, try the elimination method first.",
      "Start by identifying what the question is asking, then work backwards.",
      "Look for keywords that indicate what mathematical operation to use.",
      "Try plugging in the answer choices to see which one works.",
      "Break down complex problems into smaller, manageable parts."
    ];

    const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)];

    return {
      id: this.generateResponseId(),
      text: randomStrategy,
      type: 'instruction',
      priority: 'high',
      metadata: {
        questionId: this.sessionContext?.questionNumber.toString(),
        strategy: 'general'
      }
    };
  }

  private generateTimeResponse(): VoiceResponse {
    if (!this.sessionContext) {
      return {
        id: this.generateResponseId(),
        text: "I don't have access to the current time information.",
        type: 'instruction',
        priority: 'medium',
        metadata: {}
      };
    }

    const minutes = Math.floor(this.sessionContext.timeRemaining / 60);
    const seconds = this.sessionContext.timeRemaining % 60;

    return {
      id: this.generateResponseId(),
      text: `You have ${minutes} minutes and ${seconds} seconds remaining.`,
      type: 'instruction',
      priority: 'high',
      metadata: {
        strategy: `timeRemaining:${this.sessionContext.timeRemaining}`
      }
    };
  }

  private generateSkipResponse(): VoiceResponse {
    return {
      id: this.generateResponseId(),
      text: "Question skipped. Moving to the next one. Remember, you can always come back to this later.",
      type: 'instruction',
      priority: 'medium',
      metadata: {}
    };
  }

  private generateEncouragementResponse(): VoiceResponse {
    const encouragements = [
      "You're doing great! Keep pushing forward.",
      "Every question is a learning opportunity. You've got this!",
      "Stay focused and trust your preparation. You're capable of solving this.",
      "Take a deep breath. You know more than you think you do.",
      "Remember, the SAT is just one measure. You're already succeeding by trying your best."
    ];

    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];

    return {
      id: this.generateResponseId(),
      text: randomEncouragement,
      type: 'encouragement',
      priority: 'high',
      metadata: {}
    };
  }

  private generateHelpResponse(): VoiceResponse {
    const helpText = `I can help you with hints, explanations, strategies, time checks, and encouragement. 
                     Just say things like "give me a hint", "explain this", "what strategy should I use", 
                     "how much time left", or "I need encouragement".`;

    return {
      id: this.generateResponseId(),
      text: helpText,
      type: 'instruction',
      priority: 'medium',
      metadata: {}
    };
  }

  private async generateConfusionResponse(command: VoiceCommand): Promise<VoiceResponse> {
    const level = command.parameters.level || 'medium';
    
    let responseText = "";
    
    switch (level) {
      case 'high':
        responseText = "I understand this is challenging. Let's break it down step by step. What specific part is confusing you?";
        break;
      case 'medium':
        responseText = "That's okay, confusion is part of learning. Let me help you approach this differently.";
        break;
      default:
        responseText = "No worries! Let's work through this together.";
    }

    return {
      id: this.generateResponseId(),
      text: responseText,
      type: 'encouragement',
      priority: 'high',
      metadata: {
        strategy: `confusionLevel:${level}`
      }
    };
  }

  private async generateProgressResponse(): Promise<VoiceResponse> {
    if (!this.currentSession) {
      return {
        id: this.generateResponseId(),
        text: "I don't have access to your current progress information.",
        type: 'instruction',
        priority: 'medium',
        metadata: {}
      };
    }

    const { commands, responses } = this.currentSession;
    const successRate = commands.length > 0 ? (responses.length / commands.length) * 100 : 0;

    return {
      id: this.generateResponseId(),
      text: `You've asked ${commands.length} questions and received ${responses.length} responses. You're making good progress!`,
      type: 'feedback',
      priority: 'medium',
      metadata: {
        strategy: `successRate:${successRate},commands:${commands.length},responses:${responses.length}`
      }
    };
  }

  private async generateFallbackResponse(command: VoiceCommand): Promise<VoiceResponse> {
    return {
      id: this.generateResponseId(),
      text: "I'm not sure I understood that. Could you try rephrasing your request? You can ask for hints, explanations, or help.",
      type: 'instruction',
      priority: 'medium',
      metadata: {
        strategy: `command:${command.command},intent:${command.intent}`
      }
    };
  }

  private async executeResponse(response: VoiceResponse): Promise<void> {
    this.updateState({ currentResponse: response });

    // Add to response queue if already speaking
    if (this.state.isSpeaking) {
      this.responseQueue.push(response);
      return;
    }

    await this.speakResponse(response);
  }

  private async speakResponse(response: VoiceResponse): Promise<void> {
    const voice = this.getBestVoice(response.type);
    
    await this.speak({
      text: response.text,
      voice: voice?.id || '',
      rate: this.config.settings.speed,
      pitch: this.config.settings.pitch,
      volume: this.config.settings.volume,
      language: this.config.settings.language,
      onStart: () => this.updateState({ isSpeaking: true }),
      onEnd: () => {
        this.updateState({ isSpeaking: false, currentResponse: null });
        this.processResponseQueue();
      },
      onError: (error) => this.handleError({
        code: 'TTS_ERROR',
        message: error.message,
        timestamp: Date.now(),
        context: { response }
      })
    });
  }

  private async speak(options: any): Promise<void> {
    await this.textToSpeech.speak(options);
  }

  private processResponseQueue(): void {
    if (this.responseQueue.length > 0) {
      const nextResponse = this.responseQueue.shift();
      if (nextResponse) {
        this.speakResponse(nextResponse);
      }
    }
  }

  private getBestVoice(type: string): any {
    // Select best voice based on response type
    switch (type) {
      case 'encouragement':
        return this.textToSpeech.getBestVoice('en-US', 'motivational');
      case 'instruction':
        return this.textToSpeech.getBestVoice('en-US', 'professional');
      case 'explanation':
        return this.textToSpeech.getBestVoice('en-US', 'educational');
      default:
        return this.textToSpeech.getBestVoice('en-US', 'natural');
    }
  }

  private async speakWelcome(): Promise<void> {
    const welcomeText = `Welcome to your SAT prep session! I'm your AI tutor, ready to help. 
                        You can ask for hints, explanations, strategies, or just say "help" to learn more.`;

    await this.speak({
      text: welcomeText,
      voice: this.getBestVoice('instruction'),
      rate: this.config.settings.speed,
      pitch: this.config.settings.pitch,
      volume: this.config.settings.volume,
      language: this.config.settings.language
    });
  }

  private async speakError(): Promise<void> {
    await this.speak({
      text: "Sorry, I encountered an error. Please try again or ask for help.",
      voice: this.getBestVoice('instruction'),
      rate: this.config.settings.speed,
      pitch: this.config.settings.pitch,
      volume: this.config.settings.volume,
      language: this.config.settings.language
    });
  }

  private playAudioFeedback(type: 'activation' | 'error' | 'success'): void {
    // Play short audio feedback sounds
    const audio = new Audio();
    
    switch (type) {
      case 'activation':
        audio.src = '/audio/activation-beep.mp3';
        break;
      case 'error':
        audio.src = '/audio/error-beep.mp3';
        break;
      case 'success':
        audio.src = '/audio/success-beep.mp3';
        break;
    }
    
    audio.volume = this.config.settings.volume * 0.3; // Quieter feedback
    audio.play().catch(() => {}); // Ignore errors
  }

  private handleVolumeControl(action: 'increase' | 'decrease'): void {
    const currentVolume = this.config.settings.volume;
    
    if (action === 'increase') {
      this.config.settings.volume = Math.min(1.0, currentVolume + 0.1);
    } else {
      this.config.settings.volume = Math.max(0.0, currentVolume - 0.1);
    }

    this.textToSpeech.updateSettings(this.config.settings);
  }

  private handleWebSocketMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'coaching_suggestion') {
        // Handle real-time coaching suggestions
        this.handleCoachingSuggestion(data.payload);
      } else if (data.type === 'context_update') {
        // Update session context
        this.updateSessionContext(data.payload);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }

  private handleCoachingSuggestion(suggestion: any): void {
    // Process real-time coaching suggestions
    if (suggestion.urgent && !this.state.isSpeaking) {
      const response: VoiceResponse = {
        id: this.generateResponseId(),
        text: suggestion.message,
        type: 'instruction',
        priority: 'urgent',
        metadata: { strategy: 'live_coaching' }
      };

      this.executeResponse(response);
    }
  }

  private updateSessionContext(contextUpdate: Partial<SessionContext>): void {
    if (this.sessionContext) {
      this.sessionContext = { ...this.sessionContext, ...contextUpdate };
      this.commandProcessor.setSessionContext(this.sessionContext);
    }
  }

  private initializeAnalytics(): VoiceAnalytics {
    return {
      totalCommands: 0,
      successfulCommands: 0,
      averageResponseTime: 0,
      stressLevel: 0,
      confidenceLevel: 0,
      engagementScore: 0,
      voicePatterns: {
        speakingRate: 0,
        pauseFrequency: 0,
        tonalVariation: 0,
        emotionalState: 'calm'
      }
    };
  }

  private updateAnalytics(command: VoiceCommand, response: VoiceResponse): void {
    if (!this.currentSession) return;

    const analytics = this.currentSession.analytics;
    analytics.totalCommands++;
    analytics.successfulCommands++;

    // Update engagement score based on interaction patterns
    analytics.engagementScore = this.calculateEngagementScore();
    
    // Detect stress patterns
    analytics.stressLevel = this.detectStressLevel(command);
    
    // Update confidence based on question patterns
    analytics.confidenceLevel = this.calculateConfidenceLevel();

    this.callbacks.onAnalyticsUpdate(analytics);
  }

  private calculateEngagementScore(): number {
    if (!this.currentSession) return 0;

    const { commands } = this.currentSession;
    const sessionDuration = Date.now() - this.currentSession.startTime;
    const commandsPerMinute = (commands.length / sessionDuration) * 60000;

    // Higher command frequency indicates higher engagement
    return Math.min(commandsPerMinute / 5, 1.0); // Normalize to 0-1
  }

  private detectStressLevel(command: VoiceCommand): number {
    const stressIndicators = [
      'confused', 'difficult', 'hard', 'help', 'stuck', 'don\'t know'
    ];

    const hasStressWords = stressIndicators.some(word => 
      command.command.toLowerCase().includes(word)
    );

    return hasStressWords ? 0.7 : 0.3;
  }

  private calculateConfidenceLevel(): number {
    if (!this.currentSession) return 0;

    const recentCommands = this.currentSession.commands.slice(-5);
    const confusionCommands = recentCommands.filter(cmd => 
      cmd.intent === 'report_confusion' || cmd.intent === 'help'
    );

    return Math.max(0, 1 - (confusionCommands.length / recentCommands.length));
  }

  private finalizeSessionAnalytics(): void {
    if (!this.currentSession) return;

    const analytics = this.currentSession.analytics;
    const sessionDuration = Date.now() - this.currentSession.startTime;
    
    analytics.averageResponseTime = this.performanceMetrics.averageResponseTime;
    
    // Calculate final scores
    analytics.engagementScore = this.calculateFinalEngagementScore(sessionDuration);
  }

  private calculateFinalEngagementScore(duration: number): number {
    const commandsPerMinute = (this.performanceMetrics.totalCommands / duration) * 60000;
    const successRate = this.performanceMetrics.successfulCommands / this.performanceMetrics.totalCommands;
    
    return (commandsPerMinute * 0.6 + successRate * 0.4) / 5; // Normalize
  }

  private async sendSessionAnalytics(session: VoiceSession): Promise<void> {
    try {
      await fetch(this.config.apiEndpoints.analytics, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          userId: session.userId,
          analytics: session.analytics,
          performance: this.performanceMetrics
        })
      });
    } catch (error) {
      console.error('Failed to send session analytics:', error);
    }
  }

  private updateResponseTimeMetrics(responseTime: number): void {
    const currentAverage = this.performanceMetrics.averageResponseTime;
    const totalCommands = this.performanceMetrics.totalCommands;
    
    this.performanceMetrics.averageResponseTime = 
      (currentAverage * (totalCommands - 1) + responseTime) / totalCommands;
  }

  private updateState(updates: Partial<VoiceAssistantState>): void {
    this.state = { ...this.state, ...updates };
    this.callbacks.onStateChange(this.state);
  }

  private handleError(error: VoiceError): void {
    this.updateState({ error: error.message });
    this.callbacks.onError(error);
  }

  // Public API methods
  public getState(): VoiceAssistantState {
    return { ...this.state };
  }

  public getCurrentSession(): VoiceSession | null {
    return this.currentSession;
  }

  public getCapabilities(): VoiceCapabilities {
    return {
      speechRecognition: this.speechRecognition.isRecognitionSupported(),
      textToSpeech: this.textToSpeech.isTextToSpeechSupported(),
      wakeWordDetection: this.wakeWordDetector.isWakeWordSupported(),
      audioProcessing: true,
      offline: false,
      realtimeProcessing: true,
      multiLanguage: true,
      backgroundProcessing: this.liveCoachingEnabled
    };
  }

  public updateSettings(settings: Partial<VoiceSettings>): void {
    this.config.settings = { ...this.config.settings, ...settings };
    this.textToSpeech.updateSettings(this.config.settings);
    this.speechRecognition.updateSettings(this.config.settings);
  }

  public async processManualCommand(commandText: string): Promise<void> {
    const command = this.commandProcessor.processCommand(commandText, 1.0);
    await this.processVoiceCommand(command);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateResponseId(): string {
    return `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public dispose(): void {
    // Clean up all components
    this.speechRecognition.dispose();
    this.textToSpeech.dispose();
    this.commandProcessor.dispose();
    this.wakeWordDetector.dispose();
    this.audioProcessor.dispose();

    // Close WebSocket connection
    if (this.wsConnection) {
      this.wsConnection.close();
    }

    // Clear session data
    this.currentSession = null;
    this.sessionContext = null;
  }
}

// Export utility functions
export const createVoiceAssistant = (
  config: VoiceAssistantConfig, 
  callbacks: VoiceAssistantCallbacks
) => {
  return new VoiceAssistant(config, callbacks);
};

export const getDefaultVoiceSettings = (): VoiceSettings => {
  return {
    language: 'en-US',
    accent: 'neutral',
    speed: 1.0,
    pitch: 1.0,
    volume: 0.8,
    wakeWordEnabled: true,
    wakeWord: 'hey bonsai',
    noiseReduction: true,
    voiceActivated: true,
    visualFeedback: true,
    hapticsEnabled: false,
    speechToTextProvider: 'browser',
    textToSpeechProvider: 'browser'
  };
};