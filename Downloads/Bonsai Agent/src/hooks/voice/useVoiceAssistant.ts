/**
 * Main Voice Assistant React Hook
 * Provides complete voice assistant functionality for React components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  VoiceAssistant, 
  createVoiceAssistant, 
  getDefaultVoiceSettings 
} from '@/lib/voice/voice-assistant';
import { 
  VoiceAssistantState, 
  VoiceSettings, 
  VoiceCommand, 
  VoiceResponse, 
  VoiceSession, 
  SessionContext, 
  VoiceError, 
  VoiceAnalytics,
  StudentProfile,
  VoiceCapabilities
} from '@/lib/voice/voice-types';

interface UseVoiceAssistantOptions {
  enabled?: boolean;
  autoStart?: boolean;
  enableWakeWord?: boolean;
  enableAdvancedProcessing?: boolean;
  enableRealTimeCoaching?: boolean;
  settings?: Partial<VoiceSettings>;
  studentProfile?: StudentProfile;
  onCommandProcessed?: (command: VoiceCommand, response: VoiceResponse) => void;
  onError?: (error: VoiceError) => void;
  onSessionUpdate?: (session: VoiceSession) => void;
  onAnalyticsUpdate?: (analytics: VoiceAnalytics) => void;
}

interface UseVoiceAssistantReturn {
  // State
  state: VoiceAssistantState;
  session: VoiceSession | null;
  capabilities: VoiceCapabilities;
  settings: VoiceSettings;
  
  // Session control
  startSession: (context: SessionContext) => Promise<void>;
  stopSession: () => Promise<void>;
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  
  // Voice control
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  stopSpeaking: () => Promise<void>;
  
  // Commands
  processCommand: (commandText: string) => Promise<void>;
  
  // Settings
  updateSettings: (newSettings: Partial<VoiceSettings>) => void;
  
  // Utilities
  isSupported: boolean;
  isReady: boolean;
  error: string | null;
}

export const useVoiceAssistant = (options: UseVoiceAssistantOptions = {}): UseVoiceAssistantReturn => {
  const {
    enabled = true,
    autoStart = false,
    enableWakeWord = true,
    enableAdvancedProcessing = true,
    enableRealTimeCoaching = true,
    settings: initialSettings = {},
    studentProfile,
    onCommandProcessed,
    onError,
    onSessionUpdate,
    onAnalyticsUpdate
  } = options;

  // State
  const [state, setState] = useState<VoiceAssistantState>({
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    isPaused: false,
    isWakeWordActive: false,
    currentCommand: null,
    currentResponse: null,
    session: null,
    error: null,
    connectionStatus: 'disconnected'
  });

  const [session, setSession] = useState<VoiceSession | null>(null);
  const [capabilities, setCapabilities] = useState<VoiceCapabilities>({
    speechRecognition: false,
    textToSpeech: false,
    wakeWordDetection: false,
    audioProcessing: false,
    offline: false,
    realtimeProcessing: false,
    multiLanguage: false,
    backgroundProcessing: false
  });

  const [settings, setSettings] = useState<VoiceSettings>({
    ...getDefaultVoiceSettings(),
    ...initialSettings
  });

  const [isSupported, setIsSupported] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const voiceAssistantRef = useRef<VoiceAssistant | null>(null);
  const initializingRef = useRef(false);

  // Initialize voice assistant
  const initializeVoiceAssistant = useCallback(async () => {
    if (!enabled || initializingRef.current || voiceAssistantRef.current) return;

    initializingRef.current = true;

    try {
      const defaultProfile: StudentProfile = studentProfile || {
        id: 'default',
        learningStyle: 'mixed',
        weakAreas: [],
        strongAreas: [],
        preferredHintStyle: 'guiding',
        voicePreferences: settings
      };

      const config = {
        settings,
        studentProfile: defaultProfile,
        enableWakeWord,
        enableAdvancedProcessing,
        enableRealTimeCoaching,
        apiEndpoints: {
          processCommand: '/api/voice/process-command',
          generateResponse: '/api/voice/generate-response',
          analytics: '/api/voice/analytics',
          coaching: '/api/voice/coaching'
        }
      };

      const callbacks = {
        onStateChange: (newState: VoiceAssistantState) => {
          setState(newState);
          setSession(newState.session);
          setError(newState.error);
        },
        onCommandProcessed: (command: VoiceCommand, response: VoiceResponse) => {
          onCommandProcessed?.(command, response);
        },
        onError: (voiceError: VoiceError) => {
          setError(voiceError.message);
          onError?.(voiceError);
        },
        onSessionUpdate: (voiceSession: VoiceSession) => {
          setSession(voiceSession);
          onSessionUpdate?.(voiceSession);
        },
        onAnalyticsUpdate: (analytics: VoiceAnalytics) => {
          onAnalyticsUpdate?.(analytics);
        }
      };

      const assistant = createVoiceAssistant(config, callbacks);
      voiceAssistantRef.current = assistant;

      // Check capabilities
      const assistantCapabilities = assistant.getCapabilities();
      setCapabilities(assistantCapabilities);
      setIsSupported(
        assistantCapabilities.speechRecognition && 
        assistantCapabilities.textToSpeech
      );

      setIsReady(true);

    } catch (err) {
      console.error('Failed to initialize voice assistant:', err);
      setError('Failed to initialize voice assistant');
      setIsSupported(false);
    } finally {
      initializingRef.current = false;
    }
  }, [
    enabled, 
    settings, 
    studentProfile, 
    enableWakeWord, 
    enableAdvancedProcessing, 
    enableRealTimeCoaching,
    onCommandProcessed,
    onError,
    onSessionUpdate,
    onAnalyticsUpdate
  ]);

  // Session control functions
  const startSession = useCallback(async (context: SessionContext) => {
    if (!voiceAssistantRef.current) {
      throw new Error('Voice assistant not initialized');
    }

    try {
      await voiceAssistantRef.current.startSession(context);
    } catch (err) {
      console.error('Failed to start voice session:', err);
      setError('Failed to start voice session');
      throw err;
    }
  }, []);

  const stopSession = useCallback(async () => {
    if (!voiceAssistantRef.current) return;

    try {
      await voiceAssistantRef.current.stopSession();
    } catch (err) {
      console.error('Failed to stop voice session:', err);
      setError('Failed to stop voice session');
    }
  }, []);

  const pauseSession = useCallback(async () => {
    if (!voiceAssistantRef.current) return;

    try {
      await voiceAssistantRef.current.pauseSession();
    } catch (err) {
      console.error('Failed to pause voice session:', err);
      setError('Failed to pause voice session');
    }
  }, []);

  const resumeSession = useCallback(async () => {
    if (!voiceAssistantRef.current) return;

    try {
      await voiceAssistantRef.current.resumeSession();
    } catch (err) {
      console.error('Failed to resume voice session:', err);
      setError('Failed to resume voice session');
    }
  }, []);

  // Voice control functions
  const startListening = useCallback(async () => {
    if (!voiceAssistantRef.current) {
      throw new Error('Voice assistant not initialized');
    }

    try {
      await voiceAssistantRef.current.startListening();
    } catch (err) {
      console.error('Failed to start listening:', err);
      setError('Failed to start listening');
      throw err;
    }
  }, []);

  const stopListening = useCallback(async () => {
    if (!voiceAssistantRef.current) return;

    try {
      await voiceAssistantRef.current.stopListening();
    } catch (err) {
      console.error('Failed to stop listening:', err);
      setError('Failed to stop listening');
    }
  }, []);

  const stopSpeaking = useCallback(async () => {
    if (!voiceAssistantRef.current) return;

    try {
      await voiceAssistantRef.current.stopSpeaking();
    } catch (err) {
      console.error('Failed to stop speaking:', err);
      setError('Failed to stop speaking');
    }
  }, []);

  // Command processing
  const processCommand = useCallback(async (commandText: string) => {
    if (!voiceAssistantRef.current) {
      throw new Error('Voice assistant not initialized');
    }

    try {
      await voiceAssistantRef.current.processManualCommand(commandText);
    } catch (err) {
      console.error('Failed to process command:', err);
      setError('Failed to process command');
      throw err;
    }
  }, []);

  // Settings update
  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    if (voiceAssistantRef.current) {
      voiceAssistantRef.current.updateSettings(newSettings);
    }
  }, [settings]);

  // Auto-start session if enabled
  useEffect(() => {
    if (autoStart && isReady && !session) {
      const defaultContext: SessionContext = {
        testType: 'practice',
        currentSection: 'math',
        questionNumber: 1,
        timeRemaining: 3600, // 1 hour
        skillAreas: [],
        difficulty: 'medium',
        personalizedProfile: studentProfile || {
          id: 'default',
          learningStyle: 'mixed',
          weakAreas: [],
          strongAreas: [],
          preferredHintStyle: 'guiding',
          voicePreferences: settings
        }
      };

      startSession(defaultContext).catch(console.error);
    }
  }, [autoStart, isReady, session, startSession, studentProfile, settings]);

  // Initialize on mount
  useEffect(() => {
    initializeVoiceAssistant();

    // Cleanup on unmount
    return () => {
      if (voiceAssistantRef.current) {
        voiceAssistantRef.current.dispose();
        voiceAssistantRef.current = null;
      }
    };
  }, [initializeVoiceAssistant]);

  // Handle settings changes
  useEffect(() => {
    if (voiceAssistantRef.current) {
      voiceAssistantRef.current.updateSettings(settings);
    }
  }, [settings]);

  return {
    // State
    state,
    session,
    capabilities,
    settings,
    
    // Session control
    startSession,
    stopSession,
    pauseSession,
    resumeSession,
    
    // Voice control
    startListening,
    stopListening,
    stopSpeaking,
    
    // Commands
    processCommand,
    
    // Settings
    updateSettings,
    
    // Utilities
    isSupported,
    isReady,
    error
  };
};

export default useVoiceAssistant;