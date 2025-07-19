/**
 * Advanced Speech Recognition Engine
 * Handles speech-to-text conversion with multi-provider support
 */

import { SpeechRecognitionResult, AudioProcessingOptions, VoiceSettings } from './voice-types';

interface SpeechRecognitionConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  grammars?: string[];
  hotWords?: string[];
  profanityFilter: boolean;
  punctuation: boolean;
  diarization: boolean;
  enableWordTimeOffsets: boolean;
  enableWordConfidence: boolean;
  enableAutomaticPunctuation: boolean;
  enableSpokenPunctuation: boolean;
  enableSpokenEmojis: boolean;
  audioConfig: AudioProcessingOptions;
}

export class SpeechRecognitionEngine {
  private recognition: SpeechRecognition | null = null;
  private isSupported: boolean = false;
  private isListening: boolean = false;
  private config: SpeechRecognitionConfig;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private audioProcessor: AudioWorkletNode | null = null;
  private callbacks: {
    onResult: (result: SpeechRecognitionResult) => void;
    onError: (error: Error) => void;
    onStart: () => void;
    onEnd: () => void;
  } = {
    onResult: () => {},
    onError: () => {},
    onStart: () => {},
    onEnd: () => {}
  };

  constructor(config: Partial<SpeechRecognitionConfig> = {}) {
    this.config = {
      language: 'en-US',
      continuous: true,
      interimResults: true,
      maxAlternatives: 3,
      profanityFilter: false,
      punctuation: true,
      diarization: false,
      enableWordTimeOffsets: true,
      enableWordConfidence: true,
      enableAutomaticPunctuation: true,
      enableSpokenPunctuation: true,
      enableSpokenEmojis: false,
      audioConfig: {
        sampleRate: 16000,
        channels: 1,
        bitDepth: 16,
        noiseReduction: true,
        echoCancellation: true,
        autoGainControl: true,
        noiseSuppression: true
      },
      ...config
    };

    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition(): void {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      this.isSupported = false;
      return;
    }

    this.recognition = new SpeechRecognition();
    this.isSupported = true;

    // Configure speech recognition
    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.maxAlternatives = this.config.maxAlternatives;
    this.recognition.lang = this.config.language;

    // Set up event handlers
    this.recognition.onstart = () => {
      this.isListening = true;
      this.callbacks.onStart();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.callbacks.onEnd();
    };

    this.recognition.onerror = (event) => {
      const error = new Error(`Speech recognition error: ${event.error}`);
      this.callbacks.onError(error);
    };

    this.recognition.onresult = (event) => {
      const results = this.processSpeechResults(event.results);
      results.forEach(result => this.callbacks.onResult(result));
    };
  }

  private processSpeechResults(results: SpeechRecognitionResultList): SpeechRecognitionResult[] {
    const processedResults: SpeechRecognitionResult[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const alternatives = [];

      for (let j = 0; j < result.length; j++) {
        alternatives.push({
          transcript: result[j].transcript,
          confidence: result[j].confidence
        });
      }

      processedResults.push({
        transcript: result[0].transcript,
        confidence: result[0].confidence,
        isFinal: result.isFinal,
        alternatives
      });
    }

    return processedResults;
  }

  private async initializeAudioContext(): Promise<void> {
    if (this.audioContext) return;

    this.audioContext = new AudioContext({
      sampleRate: this.config.audioConfig.sampleRate,
      latencyHint: 'interactive'
    });

    try {
      await this.audioContext.audioWorklet.addModule('/audio-processor.js');
    } catch (error) {
      console.warn('Audio worklet not available, falling back to basic processing');
    }
  }

  private async setupAudioProcessing(): Promise<void> {
    if (!this.audioContext) return;

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.audioConfig.sampleRate,
          channelCount: this.config.audioConfig.channels,
          echoCancellation: this.config.audioConfig.echoCancellation,
          autoGainControl: this.config.audioConfig.autoGainControl,
          noiseSuppression: this.config.audioConfig.noiseSuppression
        }
      });

      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      if (this.config.audioConfig.noiseReduction) {
        this.audioProcessor = new AudioWorkletNode(this.audioContext, 'noise-reduction-processor');
        source.connect(this.audioProcessor);
      }

    } catch (error) {
      console.error('Failed to setup audio processing:', error);
      throw error;
    }
  }

  public async startListening(): Promise<void> {
    if (!this.isSupported) {
      throw new Error('Speech recognition not supported');
    }

    if (this.isListening) {
      return;
    }

    try {
      await this.initializeAudioContext();
      await this.setupAudioProcessing();
      
      this.recognition?.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      throw error;
    }
  }

  public stopListening(): void {
    if (!this.isListening) return;

    this.recognition?.stop();
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioProcessor) {
      this.audioProcessor.disconnect();
      this.audioProcessor = null;
    }
  }

  public abort(): void {
    if (!this.isListening) return;

    this.recognition?.abort();
    this.stopListening();
  }

  public updateSettings(settings: Partial<VoiceSettings>): void {
    if (settings.language) {
      this.config.language = settings.language;
      if (this.recognition) {
        this.recognition.lang = settings.language;
      }
    }

    if (settings.noiseReduction !== undefined) {
      this.config.audioConfig.noiseReduction = settings.noiseReduction;
    }

    // Apply other settings...
  }

  public setCallbacks(callbacks: Partial<typeof this.callbacks>): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public isListeningActive(): boolean {
    return this.isListening;
  }

  public isRecognitionSupported(): boolean {
    return this.isSupported;
  }

  public getConfiguration(): SpeechRecognitionConfig {
    return { ...this.config };
  }

  // Advanced processing methods
  public async processAudioBuffer(buffer: ArrayBuffer): Promise<SpeechRecognitionResult[]> {
    // For when we need to process pre-recorded audio
    // This would integrate with cloud services like Azure Speech, Google Cloud Speech, etc.
    return [];
  }

  public async processAudioStream(stream: MediaStream): Promise<void> {
    // For processing live audio streams
    this.mediaStream = stream;
    await this.setupAudioProcessing();
  }

  // Hot word detection for mathematical terms
  public addMathematicalGrammar(): void {
    const mathTerms = [
      'sine', 'cosine', 'tangent', 'logarithm', 'exponential',
      'derivative', 'integral', 'polynomial', 'quadratic', 'linear',
      'algebra', 'geometry', 'trigonometry', 'calculus', 'statistics',
      'probability', 'matrix', 'vector', 'function', 'equation',
      'inequality', 'ratio', 'proportion', 'percentage', 'fraction'
    ];

    this.config.hotWords = [...(this.config.hotWords || []), ...mathTerms];
  }

  // SAT-specific command recognition
  public addSATCommands(): void {
    const satCommands = [
      'give me a hint', 'explain this', 'what strategy should I use',
      'how much time left', 'skip this question', 'pause test',
      'resume test', 'end session', 'I need help', 'I dont understand',
      'what should I focus on', 'show my progress', 'take a break',
      'repeat that', 'slow down', 'speed up', 'volume up', 'volume down',
      'mute', 'unmute', 'help me', 'I am confused', 'good job', 'thank you'
    ];

    this.config.grammars = [...(this.config.grammars || []), ...satCommands];
  }

  // Stress detection from voice patterns
  public analyzeStressLevel(results: SpeechRecognitionResult[]): number {
    // Analyze speech patterns for stress indicators
    let stressIndicators = 0;
    
    results.forEach(result => {
      // Fast speech rate
      if (result.transcript.split(' ').length > 180) { // words per minute
        stressIndicators++;
      }
      
      // Confidence drops
      if (result.confidence < 0.7) {
        stressIndicators++;
      }
      
      // Stress-related words
      const stressWords = ['stressed', 'confused', 'difficult', 'hard', 'dont know', 'help'];
      if (stressWords.some(word => result.transcript.toLowerCase().includes(word))) {
        stressIndicators++;
      }
    });

    return Math.min(stressIndicators / results.length, 1.0);
  }

  // Clean up resources
  public dispose(): void {
    this.stopListening();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.recognition = null;
  }
}

// Export utility functions
export const createSpeechRecognitionEngine = (config?: Partial<SpeechRecognitionConfig>) => {
  return new SpeechRecognitionEngine(config);
};

export const isSpeechRecognitionSupported = (): boolean => {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
};

export const getSupportedLanguages = (): string[] => {
  return [
    'en-US', 'en-GB', 'es-ES', 'es-MX', 'fr-FR', 'de-DE', 'it-IT',
    'pt-BR', 'pt-PT', 'ru-RU', 'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR',
    'ar-SA', 'hi-IN', 'th-TH', 'vi-VN', 'tr-TR', 'pl-PL', 'nl-NL',
    'sv-SE', 'da-DK', 'no-NO', 'fi-FI', 'cs-CZ', 'hu-HU', 'ro-RO'
  ];
};