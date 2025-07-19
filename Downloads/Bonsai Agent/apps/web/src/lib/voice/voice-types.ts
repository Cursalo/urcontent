/**
 * Voice Assistant Types and Interfaces
 * Core type definitions for the Bonsai voice assistant system
 */

export interface VoiceSettings {
  language: string;
  accent: string;
  speed: number;
  pitch: number;
  volume: number;
  wakeWordEnabled: boolean;
  wakeWord: string;
  noiseReduction: boolean;
  voiceActivated: boolean;
  visualFeedback: boolean;
  hapticsEnabled: boolean;
  speechToTextProvider: 'browser' | 'azure' | 'google' | 'openai';
  textToSpeechProvider: 'browser' | 'azure' | 'google' | 'elevenlabs';
}

export interface VoiceCommand {
  id: string;
  command: string;
  intent: VoiceIntent;
  confidence: number;
  parameters: Record<string, any>;
  timestamp: number;
  processed: boolean;
}

export interface VoiceResponse {
  id: string;
  text: string;
  audioUrl?: string;
  type: 'hint' | 'explanation' | 'encouragement' | 'instruction' | 'feedback';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata: {
    questionId?: string;
    skillArea?: string;
    difficulty?: string;
    strategy?: string;
  };
}

export interface VoiceSession {
  id: string;
  userId: string;
  startTime: number;
  endTime?: number;
  commands: VoiceCommand[];
  responses: VoiceResponse[];
  analytics: VoiceAnalytics;
  context: SessionContext;
}

export interface VoiceAnalytics {
  totalCommands: number;
  successfulCommands: number;
  averageResponseTime: number;
  stressLevel: number;
  confidenceLevel: number;
  engagementScore: number;
  voicePatterns: {
    speakingRate: number;
    pauseFrequency: number;
    tonalVariation: number;
    emotionalState: 'calm' | 'stressed' | 'confident' | 'frustrated';
  };
}

export interface SessionContext {
  testType: 'practice' | 'mock' | 'real';
  currentSection: string;
  questionNumber: number;
  timeRemaining: number;
  skillAreas: string[];
  difficulty: string;
  personalizedProfile: StudentProfile;
}

export interface StudentProfile {
  id: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  weakAreas: string[];
  strongAreas: string[];
  preferredHintStyle: 'direct' | 'guiding' | 'strategic';
  voicePreferences: VoiceSettings;
}

export type VoiceIntent = 
  | 'request_hint'
  | 'request_explanation'
  | 'request_strategy'
  | 'check_time'
  | 'skip_question'
  | 'pause_session'
  | 'resume_session'
  | 'end_session'
  | 'report_confusion'
  | 'request_encouragement'
  | 'check_progress'
  | 'change_settings'
  | 'repeat_last'
  | 'slow_down'
  | 'speed_up'
  | 'volume_control'
  | 'mute'
  | 'unmute'
  | 'help'
  | 'unknown';

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives: Array<{
    transcript: string;
    confidence: number;
  }>;
}

export interface TextToSpeechOptions {
  text: string;
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  language: string;
  ssml?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

export interface AudioProcessingOptions {
  sampleRate: number;
  channels: number;
  bitDepth: number;
  noiseReduction: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;
  noiseSuppression: boolean;
}

export interface WakeWordDetectionOptions {
  sensitivity: number;
  keywords: string[];
  continuousListening: boolean;
  timeoutMs: number;
}

export interface VoiceAssistantState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  isWakeWordActive: boolean;
  currentCommand: VoiceCommand | null;
  currentResponse: VoiceResponse | null;
  session: VoiceSession | null;
  error: string | null;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
}

export interface VoiceCapabilities {
  speechRecognition: boolean;
  textToSpeech: boolean;
  wakeWordDetection: boolean;
  audioProcessing: boolean;
  offline: boolean;
  realtimeProcessing: boolean;
  multiLanguage: boolean;
  backgroundProcessing: boolean;
}

export interface VoiceError {
  code: string;
  message: string;
  timestamp: number;
  context: Record<string, any>;
}

export interface VoiceCommandConfig {
  patterns: string[];
  intent: VoiceIntent;
  parameters: {
    name: string;
    type: 'string' | 'number' | 'boolean';
    required: boolean;
    default?: any;
  }[];
  examples: string[];
  confidence: number;
}

export interface VoiceResponseTemplate {
  intent: VoiceIntent;
  context: string;
  templates: {
    text: string;
    ssml?: string;
    variables?: string[];
  }[];
  personality: 'encouraging' | 'professional' | 'friendly' | 'motivational';
}

export interface VoicePermissions {
  microphone: boolean;
  speaker: boolean;
  backgroundProcessing: boolean;
  notifications: boolean;
}

export interface VoiceIntegration {
  computerVision: boolean;
  mathRecognition: boolean;
  questionAnalysis: boolean;
  liveCoaching: boolean;
  realTimeAnalytics: boolean;
  adaptiveRecommendations: boolean;
}

export interface VoiceAccessibility {
  hearingImpaired: boolean;
  speechImpaired: boolean;
  motorImpaired: boolean;
  cognitiveAccessibility: boolean;
  visualFeedback: boolean;
  tactileFeedback: boolean;
  signLanguage: boolean;
}