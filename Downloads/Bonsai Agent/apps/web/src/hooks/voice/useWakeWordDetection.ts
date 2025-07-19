/**
 * Wake Word Detection React Hook
 * Provides "Hey Bonsai" detection functionality for React components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  WakeWordDetector, 
  createWakeWordDetector, 
  isWakeWordSupported 
} from '@/lib/voice/wake-word-detection';
import { WakeWordDetectionOptions } from '@/lib/voice/voice-types';

interface UseWakeWordDetectionOptions {
  enabled?: boolean;
  autoStart?: boolean;
  sensitivity?: number;
  keywords?: string[];
  continuousListening?: boolean;
  timeout?: number;
  onWakeWordDetected?: (keyword: string, confidence: number) => void;
  onError?: (error: Error) => void;
}

interface UseWakeWordDetectionReturn {
  // State
  isListening: boolean;
  isSupported: boolean;
  registeredKeywords: string[];
  error: string | null;
  status: 'stopped' | 'listening' | 'processing';
  
  // Controls
  startListening: () => Promise<void>;
  stopListening: () => void;
  
  // Configuration
  addWakeWord: (keyword: string, sensitivity?: number) => void;
  removeWakeWord: (keyword: string) => void;
  updateSensitivity: (sensitivity: number) => void;
  
  // Utilities
  canUseWakeWords: boolean;
}

export const useWakeWordDetection = (
  options: UseWakeWordDetectionOptions = {}
): UseWakeWordDetectionReturn => {
  const {
    enabled = true,
    autoStart = false,
    sensitivity = 0.7,
    keywords = ['hey bonsai', 'bonsai', 'help me bonsai'],
    continuousListening = true,
    timeout = 300000, // 5 minutes
    onWakeWordDetected,
    onError
  } = options;

  // State
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [registeredKeywords, setRegisteredKeywords] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'stopped' | 'listening' | 'processing'>('stopped');
  const [canUseWakeWords, setCanUseWakeWords] = useState(false);

  // Refs
  const wakeWordDetectorRef = useRef<WakeWordDetector | null>(null);
  const initializingRef = useRef(false);

  // Initialize wake word detector
  const initializeWakeWordDetector = useCallback(() => {
    if (!enabled || initializingRef.current || wakeWordDetectorRef.current) return;

    initializingRef.current = true;

    try {
      const supported = isWakeWordSupported();
      setIsSupported(supported);
      setCanUseWakeWords(supported);

      if (!supported) {
        setError('Wake word detection not supported in this browser');
        return;
      }

      const detectorOptions: WakeWordDetectionOptions = {
        sensitivity,
        keywords,
        continuousListening,
        timeoutMs: timeout
      };

      const detector = createWakeWordDetector(detectorOptions);
      wakeWordDetectorRef.current = detector;

      // Set up callbacks
      detector.setCallbacks({
        onWakeWordDetected: handleWakeWordDetected,
        onError: handleWakeWordError,
        onStatusChange: handleStatusChange
      });

      // Update registered keywords
      setRegisteredKeywords(detector.getRegisteredWakeWords());

    } catch (err) {
      console.error('Failed to initialize wake word detector:', err);
      setError('Failed to initialize wake word detector');
      setIsSupported(false);
      setCanUseWakeWords(false);
    } finally {
      initializingRef.current = false;
    }
  }, [enabled, sensitivity, keywords, continuousListening, timeout]);

  // Handle wake word detection
  const handleWakeWordDetected = useCallback((keyword: string, confidence: number) => {
    setStatus('processing');
    onWakeWordDetected?.(keyword, confidence);
    
    // Reset status after a short delay
    setTimeout(() => {
      setStatus(isListening ? 'listening' : 'stopped');
    }, 1000);
  }, [onWakeWordDetected, isListening]);

  // Handle wake word errors
  const handleWakeWordError = useCallback((err: Error) => {
    setError(err.message);
    setIsListening(false);
    setStatus('stopped');
    onError?.(err);
  }, [onError]);

  // Handle status changes
  const handleStatusChange = useCallback((newStatus: 'listening' | 'stopped' | 'processing') => {
    setStatus(newStatus);
    setIsListening(newStatus === 'listening');
  }, []);

  // Start listening for wake words
  const startListening = useCallback(async () => {
    if (!wakeWordDetectorRef.current) {
      throw new Error('Wake word detector not initialized');
    }

    if (isListening) {
      return;
    }

    try {
      await wakeWordDetectorRef.current.startListening();
      setError(null);
    } catch (err) {
      console.error('Failed to start wake word detection:', err);
      setError('Failed to start wake word detection');
      throw err;
    }
  }, [isListening]);

  // Stop listening for wake words
  const stopListening = useCallback(() => {
    if (!wakeWordDetectorRef.current || !isListening) return;

    wakeWordDetectorRef.current.stopListening();
    setStatus('stopped');
  }, [isListening]);

  // Add wake word
  const addWakeWord = useCallback((keyword: string, wordSensitivity?: number) => {
    if (!wakeWordDetectorRef.current) return;

    wakeWordDetectorRef.current.addWakeWord(keyword, wordSensitivity);
    setRegisteredKeywords(wakeWordDetectorRef.current.getRegisteredWakeWords());
  }, []);

  // Remove wake word
  const removeWakeWord = useCallback((keyword: string) => {
    if (!wakeWordDetectorRef.current) return;

    wakeWordDetectorRef.current.removeWakeWord(keyword);
    setRegisteredKeywords(wakeWordDetectorRef.current.getRegisteredWakeWords());
  }, []);

  // Update sensitivity
  const updateSensitivity = useCallback((newSensitivity: number) => {
    if (!wakeWordDetectorRef.current) return;

    wakeWordDetectorRef.current.updateSensitivity(newSensitivity);
  }, []);

  // Auto start if enabled
  useEffect(() => {
    if (autoStart && isSupported && !isListening && wakeWordDetectorRef.current) {
      startListening().catch(console.error);
    }
  }, [autoStart, isSupported, isListening, startListening]);

  // Initialize on mount
  useEffect(() => {
    initializeWakeWordDetector();

    // Cleanup on unmount
    return () => {
      if (wakeWordDetectorRef.current) {
        wakeWordDetectorRef.current.dispose();
        wakeWordDetectorRef.current = null;
      }
    };
  }, [initializeWakeWordDetector]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!wakeWordDetectorRef.current) return;

      if (document.hidden) {
        // Page is hidden, stop listening to save battery
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

  // Handle permissions
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setCanUseWakeWords(result.state === 'granted');
        
        result.addEventListener('change', () => {
          setCanUseWakeWords(result.state === 'granted');
        });
      } catch (err) {
        // Permissions API not supported, assume we can use wake words if supported
        setCanUseWakeWords(isSupported);
      }
    };

    if (isSupported) {
      checkPermissions();
    }
  }, [isSupported]);

  // Request microphone permission when needed
  useEffect(() => {
    if (enabled && isSupported && !canUseWakeWords) {
      const requestPermission = async () => {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          setCanUseWakeWords(true);
          setError(null);
        } catch (err) {
          setError('Microphone permission required for wake word detection');
          setCanUseWakeWords(false);
        }
      };

      requestPermission();
    }
  }, [enabled, isSupported, canUseWakeWords]);

  return {
    // State
    isListening,
    isSupported,
    registeredKeywords,
    error,
    status,
    
    // Controls
    startListening,
    stopListening,
    
    // Configuration
    addWakeWord,
    removeWakeWord,
    updateSensitivity,
    
    // Utilities
    canUseWakeWords
  };
};

export default useWakeWordDetection;