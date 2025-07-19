/**
 * High-Quality Text-to-Speech Engine
 * Supports multiple providers and advanced speech synthesis
 */

import { TextToSpeechOptions, VoiceSettings } from './voice-types';

interface Voice {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  age: 'child' | 'young' | 'adult' | 'elderly';
  style: 'natural' | 'professional' | 'casual' | 'educational' | 'motivational';
  provider: 'browser' | 'azure' | 'google' | 'elevenlabs' | 'openai';
  premium: boolean;
}

interface SSMLOptions {
  rate: string;
  pitch: string;
  volume: string;
  emphasis: string;
  breakTime: string;
  voice: string;
}

export class TextToSpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private isSupported: boolean = false;
  private voices: Voice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking: boolean = false;
  private queue: TextToSpeechOptions[] = [];
  private settings: VoiceSettings;
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;

  constructor(settings: VoiceSettings) {
    this.settings = settings;
    this.initializeTextToSpeech();
  }

  private initializeTextToSpeech(): void {
    if ('speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.isSupported = true;
      this.loadVoices();
      
      // Listen for voice changes
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    } else {
      console.warn('Text-to-speech not supported in this browser');
      this.isSupported = false;
    }

    this.initializeAudioContext();
  }

  private async initializeAudioContext(): Promise<void> {
    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
  }

  private loadVoices(): void {
    if (!this.synth) return;

    const systemVoices = this.synth.getVoices();
    this.voices = systemVoices.map(voice => ({
      id: voice.voiceURI,
      name: voice.name,
      language: voice.lang,
      gender: this.detectGender(voice.name),
      age: this.detectAge(voice.name),
      style: this.detectStyle(voice.name),
      provider: 'browser',
      premium: false
    }));

    // Add premium voices if available
    this.addPremiumVoices();
  }

  private detectGender(voiceName: string): 'male' | 'female' | 'neutral' {
    const name = voiceName.toLowerCase();
    if (name.includes('male') || name.includes('man') || name.includes('david') || name.includes('mark')) {
      return 'male';
    }
    if (name.includes('female') || name.includes('woman') || name.includes('samantha') || name.includes('susan')) {
      return 'female';
    }
    return 'neutral';
  }

  private detectAge(voiceName: string): 'child' | 'young' | 'adult' | 'elderly' {
    const name = voiceName.toLowerCase();
    if (name.includes('child') || name.includes('kid')) return 'child';
    if (name.includes('young')) return 'young';
    if (name.includes('elderly') || name.includes('senior')) return 'elderly';
    return 'adult';
  }

  private detectStyle(voiceName: string): 'natural' | 'professional' | 'casual' | 'educational' | 'motivational' {
    const name = voiceName.toLowerCase();
    if (name.includes('professional') || name.includes('business')) return 'professional';
    if (name.includes('casual') || name.includes('friendly')) return 'casual';
    if (name.includes('educational') || name.includes('teacher')) return 'educational';
    if (name.includes('motivational') || name.includes('coach')) return 'motivational';
    return 'natural';
  }

  private addPremiumVoices(): void {
    // Add Azure Cognitive Services voices
    const azureVoices: Voice[] = [
      {
        id: 'azure-en-us-aria',
        name: 'Aria (Azure)',
        language: 'en-US',
        gender: 'female',
        age: 'young',
        style: 'educational',
        provider: 'azure',
        premium: true
      },
      {
        id: 'azure-en-us-guy',
        name: 'Guy (Azure)',
        language: 'en-US',
        gender: 'male',
        age: 'adult',
        style: 'professional',
        provider: 'azure',
        premium: true
      }
    ];

    // Add ElevenLabs voices
    const elevenLabsVoices: Voice[] = [
      {
        id: 'elevenlabs-rachel',
        name: 'Rachel (ElevenLabs)',
        language: 'en-US',
        gender: 'female',
        age: 'young',
        style: 'natural',
        provider: 'elevenlabs',
        premium: true
      },
      {
        id: 'elevenlabs-adam',
        name: 'Adam (ElevenLabs)',
        language: 'en-US',
        gender: 'male',
        age: 'adult',
        style: 'motivational',
        provider: 'elevenlabs',
        premium: true
      }
    ];

    this.voices.push(...azureVoices, ...elevenLabsVoices);
  }

  public async speak(options: TextToSpeechOptions): Promise<void> {
    if (!this.isSupported) {
      throw new Error('Text-to-speech not supported');
    }

    // Add to queue if currently speaking
    if (this.isSpeaking) {
      this.queue.push(options);
      return;
    }

    await this.processSpeech(options);
  }

  private async processSpeech(options: TextToSpeechOptions): Promise<void> {
    const voice = this.getVoiceById(options.voice) || this.getBestVoice(options.language);
    
    if (voice?.provider === 'browser') {
      await this.speakWithBrowser(options, voice);
    } else if (voice?.provider === 'azure') {
      await this.speakWithAzure(options, voice);
    } else if (voice?.provider === 'elevenlabs') {
      await this.speakWithElevenLabs(options, voice);
    } else {
      await this.speakWithBrowser(options, voice);
    }
  }

  private async speakWithBrowser(options: TextToSpeechOptions, voice?: Voice): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        reject(new Error('Speech synthesis not available'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(options.text);
      this.currentUtterance = utterance;

      // Configure utterance
      utterance.rate = options.rate || this.settings.speed;
      utterance.pitch = options.pitch || this.settings.pitch;
      utterance.volume = options.volume || this.settings.volume;
      utterance.lang = options.language || this.settings.language;

      if (voice) {
        const systemVoice = this.synth.getVoices().find(v => v.voiceURI === voice.id);
        if (systemVoice) {
          utterance.voice = systemVoice;
        }
      }

      // Set up event handlers
      utterance.onstart = () => {
        this.isSpeaking = true;
        options.onStart?.();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        options.onEnd?.();
        this.processQueue();
        resolve();
      };

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        const error = new Error(`Speech synthesis error: ${event.error}`);
        options.onError?.(error);
        reject(error);
      };

      // Speak the utterance
      this.synth.speak(utterance);
    });
  }

  private async speakWithAzure(options: TextToSpeechOptions, voice: Voice): Promise<void> {
    // Implementation for Azure Cognitive Services
    try {
      const ssml = this.generateSSML(options.text, {
        rate: `${Math.round(options.rate * 100)}%`,
        pitch: `${options.pitch > 1 ? '+' : ''}${Math.round((options.pitch - 1) * 50)}%`,
        volume: `${Math.round(options.volume * 100)}%`,
        emphasis: 'moderate',
        breakTime: '0.5s',
        voice: voice.id
      });

      const response = await fetch('/api/voice/azure-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ssml, voice: voice.id })
      });

      if (!response.ok) {
        throw new Error('Azure TTS request failed');
      }

      const audioBlob = await response.blob();
      await this.playAudioBlob(audioBlob, options);

    } catch (error) {
      console.error('Azure TTS error:', error);
      // Fallback to browser TTS
      await this.speakWithBrowser(options, voice);
    }
  }

  private async speakWithElevenLabs(options: TextToSpeechOptions, voice: Voice): Promise<void> {
    // Implementation for ElevenLabs
    try {
      const response = await fetch('/api/voice/elevenlabs-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: options.text,
          voice_id: voice.id,
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        throw new Error('ElevenLabs TTS request failed');
      }

      const audioBlob = await response.blob();
      await this.playAudioBlob(audioBlob, options);

    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      // Fallback to browser TTS
      await this.speakWithBrowser(options, voice);
    }
  }

  private async playAudioBlob(blob: Blob, options: TextToSpeechOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const url = URL.createObjectURL(blob);
      
      audio.src = url;
      audio.volume = options.volume || this.settings.volume;
      audio.playbackRate = options.rate || this.settings.speed;

      audio.onplay = () => {
        this.isSpeaking = true;
        options.onStart?.();
      };

      audio.onended = () => {
        this.isSpeaking = false;
        URL.revokeObjectURL(url);
        options.onEnd?.();
        this.processQueue();
        resolve();
      };

      audio.onerror = () => {
        this.isSpeaking = false;
        URL.revokeObjectURL(url);
        const error = new Error('Audio playback failed');
        options.onError?.(error);
        reject(error);
      };

      audio.play().catch(error => {
        URL.revokeObjectURL(url);
        options.onError?.(error);
        reject(error);
      });
    });
  }

  private generateSSML(text: string, options: SSMLOptions): string {
    return `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${options.voice}">
          <prosody rate="${options.rate}" pitch="${options.pitch}" volume="${options.volume}">
            <emphasis level="${options.emphasis}">
              ${text}
            </emphasis>
          </prosody>
          <break time="${options.breakTime}"/>
        </voice>
      </speak>
    `.trim();
  }

  private processQueue(): void {
    if (this.queue.length > 0 && !this.isSpeaking) {
      const nextOptions = this.queue.shift();
      if (nextOptions) {
        this.processSpeech(nextOptions);
      }
    }
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
    
    if (this.currentUtterance) {
      this.synth?.cancel();
      this.currentUtterance = null;
    }

    this.isSpeaking = false;
    this.queue = [];
  }

  public pause(): void {
    if (this.synth && this.isSpeaking) {
      this.synth.pause();
    }
  }

  public resume(): void {
    if (this.synth) {
      this.synth.resume();
    }
  }

  public getVoices(): Voice[] {
    return [...this.voices];
  }

  public getVoiceById(id: string): Voice | undefined {
    return this.voices.find(voice => voice.id === id);
  }

  public getBestVoice(language: string, style?: string): Voice | undefined {
    const languageVoices = this.voices.filter(voice => 
      voice.language.startsWith(language.split('-')[0])
    );

    if (style) {
      const styleVoices = languageVoices.filter(voice => voice.style === style);
      if (styleVoices.length > 0) {
        return styleVoices.find(voice => voice.premium) || styleVoices[0];
      }
    }

    return languageVoices.find(voice => voice.premium) || languageVoices[0];
  }

  public updateSettings(settings: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  public isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  public isTextToSpeechSupported(): boolean {
    return this.isSupported;
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  public clearQueue(): void {
    this.queue = [];
  }

  // Educational-specific methods
  public async speakMathExpression(expression: string): Promise<void> {
    const mathText = this.convertMathToSpeech(expression);
    await this.speak({
      text: mathText,
      voice: this.getBestVoice('en-US', 'educational')?.id || '',
      rate: this.settings.speed * 0.8, // Slower for math
      pitch: this.settings.pitch,
      volume: this.settings.volume,
      language: 'en-US'
    });
  }

  private convertMathToSpeech(expression: string): string {
    return expression
      .replace(/\+/g, ' plus ')
      .replace(/-/g, ' minus ')
      .replace(/\*/g, ' times ')
      .replace(/\//g, ' divided by ')
      .replace(/=/g, ' equals ')
      .replace(/\^/g, ' to the power of ')
      .replace(/√/g, ' square root of ')
      .replace(/π/g, ' pi ')
      .replace(/∞/g, ' infinity ')
      .replace(/≤/g, ' less than or equal to ')
      .replace(/≥/g, ' greater than or equal to ')
      .replace(/\(/g, ' open parenthesis ')
      .replace(/\)/g, ' close parenthesis ')
      .replace(/\[/g, ' open bracket ')
      .replace(/\]/g, ' close bracket ')
      .replace(/\{/g, ' open brace ')
      .replace(/\}/g, ' close brace ');
  }

  public async speakEncouragement(): Promise<void> {
    const encouragements = [
      "You're doing great! Keep going!",
      "Nice work! You're on the right track.",
      "Excellent progress! Stay focused.",
      "You've got this! Take your time.",
      "Great job! Keep up the good work.",
      "You're making excellent progress!",
      "Perfect! You're really getting it.",
      "Outstanding work! Keep it up!"
    ];

    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    
    await this.speak({
      text: randomEncouragement,
      voice: this.getBestVoice('en-US', 'motivational')?.id || '',
      rate: this.settings.speed,
      pitch: this.settings.pitch + 0.1, // Slightly higher pitch for positivity
      volume: this.settings.volume,
      language: 'en-US'
    });
  }

  public dispose(): void {
    this.stop();
    this.voices = [];
    this.currentUtterance = null;
    this.audioContext?.close();
  }
}

// Export utility functions
export const createTextToSpeechEngine = (settings: VoiceSettings) => {
  return new TextToSpeechEngine(settings);
};

export const isTextToSpeechSupported = (): boolean => {
  return 'speechSynthesis' in window;
};

export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  if ('speechSynthesis' in window) {
    return window.speechSynthesis.getVoices();
  }
  return [];
};