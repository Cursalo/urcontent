/**
 * Text-to-Speech React Hook
 * Provides speech synthesis functionality for React components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  TextToSpeechEngine, 
  createTextToSpeechEngine, 
  isTextToSpeechSupported 
} from '@/lib/voice/text-to-speech';
import { TextToSpeechOptions, VoiceSettings } from '@/lib/voice/voice-types';

interface UseTextToSpeechOptions {
  enabled?: boolean;
  settings?: VoiceSettings;
  defaultVoice?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

interface Voice {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  style: string;
  premium: boolean;
}

interface UseTextToSpeechReturn {
  // State
  isSpeaking: boolean;
  isSupported: boolean;
  voices: Voice[];
  currentVoice: Voice | null;
  queueLength: number;
  error: string | null;
  
  // Controls
  speak: (text: string, options?: Partial<TextToSpeechOptions>) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  clearQueue: () => void;
  
  // Voice management
  setVoice: (voiceId: string) => void;
  getBestVoice: (language: string, style?: string) => Voice | undefined;
  
  // Convenience methods
  speakHint: (text: string) => Promise<void>;
  speakExplanation: (text: string) => Promise<void>;
  speakEncouragement: (text?: string) => Promise<void>;
  speakMath: (expression: string) => Promise<void>;
  
  // Settings
  updateSettings: (newSettings: Partial<VoiceSettings>) => void;
  settings: VoiceSettings;
}

const defaultSettings: VoiceSettings = {
  language: 'en-US',
  accent: 'neutral',
  speed: 1.0,
  pitch: 1.0,
  volume: 0.8,
  wakeWordEnabled: false,
  wakeWord: '',
  noiseReduction: false,
  voiceActivated: false,
  visualFeedback: false,
  hapticsEnabled: false,
  speechToTextProvider: 'browser',
  textToSpeechProvider: 'browser'
};

export const useTextToSpeech = (
  options: UseTextToSpeechOptions = {}
): UseTextToSpeechReturn => {
  const {
    enabled = true,
    settings: initialSettings = defaultSettings,
    defaultVoice,
    onStart,
    onEnd,
    onError
  } = options;

  // State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<Voice | null>(null);
  const [queueLength, setQueueLength] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<VoiceSettings>(initialSettings);

  // Refs
  const ttsEngineRef = useRef<TextToSpeechEngine | null>(null);
  const initializingRef = useRef(false);

  // Initialize TTS engine
  const initializeTTS = useCallback(() => {
    if (!enabled || initializingRef.current || ttsEngineRef.current) return;

    initializingRef.current = true;

    try {
      const supported = isTextToSpeechSupported();
      setIsSupported(supported);

      if (!supported) {
        setError('Text-to-speech not supported in this browser');
        return;
      }

      const engine = createTextToSpeechEngine(settings);
      ttsEngineRef.current = engine;

      // Load available voices
      const availableVoices = engine.getVoices();
      setVoices(availableVoices);

      // Set default voice
      if (defaultVoice) {
        const voice = engine.getVoiceById(defaultVoice);
        setCurrentVoice(voice || null);
      } else {
        const bestVoice = engine.getBestVoice(settings.language);
        setCurrentVoice(bestVoice || null);
      }

    } catch (err) {
      console.error('Failed to initialize text-to-speech:', err);
      setError('Failed to initialize text-to-speech');
      setIsSupported(false);
    } finally {
      initializingRef.current = false;
    }
  }, [enabled, settings, defaultVoice]);

  // Speak function
  const speak = useCallback(async (text: string, options: Partial<TextToSpeechOptions> = {}) => {
    if (!ttsEngineRef.current) {
      throw new Error('Text-to-speech engine not initialized');
    }

    if (!text.trim()) return;

    const speakOptions: TextToSpeechOptions = {
      text: text.trim(),
      voice: currentVoice?.id || '',
      rate: settings.speed,
      pitch: settings.pitch,
      volume: settings.volume,
      language: settings.language,
      onStart: () => {
        setIsSpeaking(true);
        onStart?.();
      },
      onEnd: () => {
        setIsSpeaking(false);
        setQueueLength(ttsEngineRef.current?.getQueueLength() || 0);
        onEnd?.();
      },
      onError: (err) => {
        setError(err.message);
        setIsSpeaking(false);
        onError?.(err);
      },
      ...options
    };

    try {
      await ttsEngineRef.current.speak(speakOptions);
      setQueueLength(ttsEngineRef.current.getQueueLength());
    } catch (err) {
      console.error('Failed to speak:', err);
      setError('Failed to speak text');
      throw err;
    }
  }, [currentVoice, settings, onStart, onEnd, onError]);

  // Stop speaking
  const stop = useCallback(() => {
    if (!ttsEngineRef.current) return;

    ttsEngineRef.current.stop();
    setIsSpeaking(false);
    setQueueLength(0);
  }, []);

  // Pause speaking
  const pause = useCallback(() => {
    if (!ttsEngineRef.current) return;

    ttsEngineRef.current.pause();
  }, []);

  // Resume speaking
  const resume = useCallback(() => {
    if (!ttsEngineRef.current) return;

    ttsEngineRef.current.resume();
  }, []);

  // Clear queue
  const clearQueue = useCallback(() => {
    if (!ttsEngineRef.current) return;

    ttsEngineRef.current.clearQueue();
    setQueueLength(0);
  }, []);

  // Set voice
  const setVoice = useCallback((voiceId: string) => {
    if (!ttsEngineRef.current) return;

    const voice = ttsEngineRef.current.getVoiceById(voiceId);
    if (voice) {
      setCurrentVoice(voice);
    }
  }, []);

  // Get best voice
  const getBestVoice = useCallback((language: string, style?: string): Voice | undefined => {
    if (!ttsEngineRef.current) return undefined;

    return ttsEngineRef.current.getBestVoice(language, style);
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    if (ttsEngineRef.current) {
      ttsEngineRef.current.updateSettings(updatedSettings);
    }
  }, [settings]);

  // Convenience methods
  const speakHint = useCallback(async (text: string) => {
    const hintVoice = getBestVoice(settings.language, 'educational');
    await speak(text, {
      voice: hintVoice?.id,
      rate: settings.speed * 0.9, // Slightly slower for hints
      pitch: settings.pitch + 0.05 // Slightly higher pitch
    });
  }, [speak, getBestVoice, settings]);

  const speakExplanation = useCallback(async (text: string) => {
    const explanationVoice = getBestVoice(settings.language, 'professional');
    await speak(text, {
      voice: explanationVoice?.id,
      rate: settings.speed * 0.85, // Slower for explanations
      pitch: settings.pitch
    });
  }, [speak, getBestVoice, settings]);

  const speakEncouragement = useCallback(async (text?: string) => {
    if (!ttsEngineRef.current) return;

    if (text) {
      const encouragementVoice = getBestVoice(settings.language, 'motivational');
      await speak(text, {
        voice: encouragementVoice?.id,
        rate: settings.speed,
        pitch: settings.pitch + 0.1 // Higher pitch for positivity
      });
    } else {
      // Use built-in encouragement
      await ttsEngineRef.current.speakEncouragement();
    }
  }, [speak, getBestVoice, settings, ttsEngineRef]);

  const speakMath = useCallback(async (expression: string) => {
    if (!ttsEngineRef.current) return;

    await ttsEngineRef.current.speakMathExpression(expression);
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeTTS();

    // Cleanup on unmount
    return () => {
      if (ttsEngineRef.current) {
        ttsEngineRef.current.dispose();
        ttsEngineRef.current = null;
      }
    };
  }, [initializeTTS]);

  // Update queue length periodically
  useEffect(() => {
    if (!ttsEngineRef.current) return;

    const interval = setInterval(() => {
      const currentQueueLength = ttsEngineRef.current?.getQueueLength() || 0;
      setQueueLength(currentQueueLength);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle settings changes
  useEffect(() => {
    if (ttsEngineRef.current) {
      ttsEngineRef.current.updateSettings(settings);
    }
  }, [settings]);

  // Handle voice changes when voices are loaded
  useEffect(() => {
    if (voices.length > 0 && !currentVoice) {
      const bestVoice = voices.find(voice => 
        voice.language.startsWith(settings.language.split('-')[0])
      ) || voices[0];
      
      setCurrentVoice(bestVoice);
    }
  }, [voices, currentVoice, settings.language]);

  return {
    // State
    isSpeaking,
    isSupported,
    voices,
    currentVoice,
    queueLength,
    error,
    
    // Controls
    speak,
    stop,
    pause,
    resume,
    clearQueue,
    
    // Voice management
    setVoice,
    getBestVoice,
    
    // Convenience methods
    speakHint,
    speakExplanation,
    speakEncouragement,
    speakMath,
    
    // Settings
    updateSettings,
    settings
  };
};

export default useTextToSpeech;