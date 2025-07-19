/**
 * Speech Recognition React Hook
 * Provides speech-to-text functionality for React components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  SpeechRecognitionEngine, 
  createSpeechRecognitionEngine, 
  isSpeechRecognitionSupported 
} from '@/lib/voice/speech-recognition';
import { SpeechRecognitionResult, VoiceSettings } from '@/lib/voice/voice-types';

interface UseSpeechRecognitionOptions {
  enabled?: boolean;
  autoStart?: boolean;
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  maxAlternatives?: number;
  noiseReduction?: boolean;
  onResult?: (result: SpeechRecognitionResult) => void;
  onError?: (error: Error) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

interface UseSpeechRecognitionReturn {
  // State
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  confidence: number;
  alternatives: Array<{ transcript: string; confidence: number }>;
  error: string | null;
  
  // Controls
  startListening: () => Promise<void>;
  stopListening: () => void;
  abortListening: () => void;
  resetTranscript: () => void;
  
  // Configuration
  updateSettings: (settings: Partial<VoiceSettings>) => void;
  
  // Results
  results: SpeechRecognitionResult[];
  lastResult: SpeechRecognitionResult | null;
}

export const useSpeechRecognition = (
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn => {
  const {
    enabled = true,
    autoStart = false,
    continuous = true,
    interimResults = true,
    language = 'en-US',
    maxAlternatives = 3,
    noiseReduction = true,
    onResult,
    onError,
    onStart,
    onEnd
  } = options;

  // State
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [alternatives, setAlternatives] = useState<Array<{ transcript: string; confidence: number }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SpeechRecognitionResult[]>([]);
  const [lastResult, setLastResult] = useState<SpeechRecognitionResult | null>(null);

  // Refs
  const speechRecognitionRef = useRef<SpeechRecognitionEngine | null>(null);
  const initializingRef = useRef(false);

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    if (!enabled || initializingRef.current || speechRecognitionRef.current) return;

    initializingRef.current = true;

    try {
      const supported = isSpeechRecognitionSupported();
      setIsSupported(supported);

      if (!supported) {
        setError('Speech recognition not supported in this browser');
        return;
      }

      const recognition = createSpeechRecognitionEngine({
        language,
        continuous,
        interimResults,
        maxAlternatives,
        audioConfig: {
          sampleRate: 16000,
          channels: 1,
          bitDepth: 16,
          noiseReduction,
          echoCancellation: true,
          autoGainControl: true,
          noiseSuppression: true
        }
      });

      recognition.setCallbacks({
        onResult: handleSpeechResult,
        onError: handleSpeechError,
        onStart: handleSpeechStart,
        onEnd: handleSpeechEnd
      });

      speechRecognitionRef.current = recognition;

      // Add mathematical and SAT-specific grammars
      recognition.addMathematicalGrammar();
      recognition.addSATCommands();

    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      setError('Failed to initialize speech recognition');
      setIsSupported(false);
    } finally {
      initializingRef.current = false;
    }
  }, [enabled, language, continuous, interimResults, maxAlternatives, noiseReduction]);

  // Handle speech recognition results
  const handleSpeechResult = useCallback((result: SpeechRecognitionResult) => {
    setLastResult(result);
    setResults(prev => [...prev, result]);

    if (result.isFinal) {
      setTranscript(prev => prev + result.transcript + ' ');
      setInterimTranscript('');
      setConfidence(result.confidence);
      setAlternatives(result.alternatives);
    } else {
      setInterimTranscript(result.transcript);
    }

    onResult?.(result);
  }, [onResult]);

  // Handle speech recognition errors
  const handleSpeechError = useCallback((err: Error) => {
    setError(err.message);
    setIsListening(false);
    onError?.(err);
  }, [onError]);

  // Handle speech recognition start
  const handleSpeechStart = useCallback(() => {
    setIsListening(true);
    setError(null);
    onStart?.();
  }, [onStart]);

  // Handle speech recognition end
  const handleSpeechEnd = useCallback(() => {
    setIsListening(false);
    setInterimTranscript('');
    onEnd?.();
  }, [onEnd]);

  // Start listening
  const startListening = useCallback(async () => {
    if (!speechRecognitionRef.current) {
      throw new Error('Speech recognition not initialized');
    }

    if (isListening) {
      return;
    }

    try {
      await speechRecognitionRef.current.startListening();
    } catch (err) {
      console.error('Failed to start listening:', err);
      setError('Failed to start listening');
      throw err;
    }
  }, [isListening]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!speechRecognitionRef.current || !isListening) return;

    speechRecognitionRef.current.stopListening();
  }, [isListening]);

  // Abort listening
  const abortListening = useCallback(() => {
    if (!speechRecognitionRef.current || !isListening) return;

    speechRecognitionRef.current.abort();
  }, [isListening]);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setConfidence(0);
    setAlternatives([]);
    setResults([]);
    setLastResult(null);
    setError(null);
  }, []);

  // Update settings
  const updateSettings = useCallback((settings: Partial<VoiceSettings>) => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.updateSettings(settings);
    }
  }, []);

  // Auto start if enabled
  useEffect(() => {
    if (autoStart && isSupported && !isListening && speechRecognitionRef.current) {
      startListening().catch(console.error);
    }
  }, [autoStart, isSupported, isListening, startListening]);

  // Initialize on mount
  useEffect(() => {
    initializeSpeechRecognition();

    // Cleanup on unmount
    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.dispose();
        speechRecognitionRef.current = null;
      }
    };
  }, [initializeSpeechRecognition]);

  // Handle visibility changes - pause/resume based on page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!speechRecognitionRef.current) return;

      if (document.hidden) {
        // Page is hidden, pause listening
        if (isListening) {
          stopListening();
        }
      } else {
        // Page is visible, resume if auto-start is enabled
        if (autoStart && !isListening) {
          startListening().catch(console.error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isListening, autoStart, stopListening, startListening]);

  return {
    // State
    isListening,
    isSupported,
    transcript: transcript.trim(),
    interimTranscript,
    confidence,
    alternatives,
    error,
    
    // Controls
    startListening,
    stopListening,
    abortListening,
    resetTranscript,
    
    // Configuration
    updateSettings,
    
    // Results
    results,
    lastResult
  };
};

export default useSpeechRecognition;