/**
 * Wake Word Detection System
 * Detects "Hey Bonsai" and other trigger phrases for hands-free activation
 */

import { WakeWordDetectionOptions, VoiceSettings } from './voice-types';

interface WakeWordModel {
  id: string;
  keyword: string;
  sensitivity: number;
  modelData: ArrayBuffer | null;
  isLoaded: boolean;
}

interface AudioFeatures {
  mfcc: Float32Array;
  spectralCentroid: number;
  spectralRolloff: number;
  zeroCrossingRate: number;
  energy: number;
}

export class WakeWordDetector {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private audioWorklet: AudioWorkletNode | null = null;
  private isListening: boolean = false;
  private isSupported: boolean = false;
  private models: Map<string, WakeWordModel> = new Map();
  private options: WakeWordDetectionOptions;
  private callbacks: {
    onWakeWordDetected: (keyword: string, confidence: number) => void;
    onError: (error: Error) => void;
    onStatusChange: (status: 'listening' | 'stopped' | 'processing') => void;
  } = {
    onWakeWordDetected: () => {},
    onError: () => {},
    onStatusChange: () => {}
  };

  // Audio processing parameters
  private readonly SAMPLE_RATE = 16000;
  private readonly FRAME_SIZE = 1024;
  private readonly HOP_LENGTH = 512;
  private readonly N_MFCC = 13;
  private readonly WINDOW_SIZE = 1.5; // seconds
  private readonly DETECTION_THRESHOLD = 0.7;

  // Audio buffer for continuous processing
  private audioBuffer: Float32Array = new Float32Array(this.SAMPLE_RATE * this.WINDOW_SIZE);
  private bufferIndex: number = 0;

  // Feature extraction
  private hammingWindow: Float32Array;
  private melFilterBank: Float32Array[];

  constructor(options: Partial<WakeWordDetectionOptions> = {}) {
    this.options = {
      sensitivity: 0.7,
      keywords: ['hey bonsai', 'bonsai', 'help me bonsai'],
      continuousListening: true,
      timeoutMs: 300000, // 5 minutes
      ...options
    };

    this.initializeAudioProcessing();
    this.initializeDefaultModels();
  }

  private initializeAudioProcessing(): void {
    // Check for Web Audio API support
    if (!window.AudioContext && !window.webkitAudioContext) {
      console.warn('Web Audio API not supported');
      this.isSupported = false;
      return;
    }

    this.isSupported = true;
    this.initializeFilterBank();
    this.initializeWindow();
  }

  private initializeFilterBank(): void {
    // Initialize Mel filter bank for MFCC computation
    const numFilters = 26;
    const fftSize = this.FRAME_SIZE;
    const sampleRate = this.SAMPLE_RATE;
    
    this.melFilterBank = [];
    
    // Create triangular filters
    for (let i = 0; i < numFilters; i++) {
      const filter = new Float32Array(fftSize / 2);
      const centerFreq = this.melToHz((i + 1) * this.hzToMel(sampleRate / 2) / (numFilters + 1));
      const leftFreq = i > 0 ? this.melToHz(i * this.hzToMel(sampleRate / 2) / (numFilters + 1)) : 0;
      const rightFreq = i < numFilters - 1 ? this.melToHz((i + 2) * this.hzToMel(sampleRate / 2) / (numFilters + 1)) : sampleRate / 2;
      
      for (let j = 0; j < filter.length; j++) {
        const freq = (j * sampleRate) / fftSize;
        
        if (freq >= leftFreq && freq <= centerFreq) {
          filter[j] = (freq - leftFreq) / (centerFreq - leftFreq);
        } else if (freq > centerFreq && freq <= rightFreq) {
          filter[j] = (rightFreq - freq) / (rightFreq - centerFreq);
        } else {
          filter[j] = 0;
        }
      }
      
      this.melFilterBank.push(filter);
    }
  }

  private initializeWindow(): void {
    // Create Hamming window for signal processing
    this.hammingWindow = new Float32Array(this.FRAME_SIZE);
    for (let i = 0; i < this.FRAME_SIZE; i++) {
      this.hammingWindow[i] = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (this.FRAME_SIZE - 1));
    }
  }

  private melToHz(mel: number): number {
    return 700 * (Math.exp(mel / 1125) - 1);
  }

  private hzToMel(hz: number): number {
    return 1125 * Math.log(1 + hz / 700);
  }

  private initializeDefaultModels(): void {
    // Initialize default wake word models
    const defaultKeywords = ['hey bonsai', 'bonsai', 'help me bonsai'];
    
    defaultKeywords.forEach(keyword => {
      const model: WakeWordModel = {
        id: this.generateModelId(keyword),
        keyword,
        sensitivity: this.options.sensitivity,
        modelData: null,
        isLoaded: false
      };
      
      this.models.set(keyword, model);
    });

    // Load pre-trained models if available
    this.loadPretrainedModels();
  }

  private async loadPretrainedModels(): Promise<void> {
    try {
      // Try to load pre-trained models from server
      const response = await fetch('/api/voice/wake-word-models');
      if (response.ok) {
        const models = await response.json();
        // Process and load models...
      }
    } catch (error) {
      console.warn('Could not load pre-trained wake word models:', error);
      // Fall back to pattern-based detection
      this.initializePatternBasedDetection();
    }
  }

  private initializePatternBasedDetection(): void {
    // Simple pattern-based detection as fallback
    this.models.forEach(model => {
      model.isLoaded = true;
    });
  }

  public async startListening(): Promise<void> {
    if (!this.isSupported) {
      throw new Error('Wake word detection not supported');
    }

    if (this.isListening) {
      return;
    }

    try {
      // Initialize audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: this.SAMPLE_RATE,
        latencyHint: 'interactive'
      });

      // Get microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Set up audio processing
      await this.setupAudioProcessing();
      
      this.isListening = true;
      this.callbacks.onStatusChange('listening');

      // Set timeout if specified
      if (this.options.timeoutMs > 0) {
        setTimeout(() => {
          if (this.isListening) {
            this.stopListening();
          }
        }, this.options.timeoutMs);
      }

    } catch (error) {
      console.error('Failed to start wake word detection:', error);
      this.callbacks.onError(error as Error);
      throw error;
    }
  }

  private async setupAudioProcessing(): Promise<void> {
    if (!this.audioContext || !this.mediaStream) return;

    try {
      // Add audio worklet for real-time processing
      await this.audioContext.audioWorklet.addModule('/wake-word-processor.js');
      
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.audioWorklet = new AudioWorkletNode(this.audioContext, 'wake-word-processor', {
        processorOptions: {
          frameSize: this.FRAME_SIZE,
          hopLength: this.HOP_LENGTH
        }
      });

      // Handle processed audio data
      this.audioWorklet.port.onmessage = (event) => {
        const { audioData } = event.data;
        this.processAudioFrame(audioData);
      };

      source.connect(this.audioWorklet);
      
    } catch (error) {
      console.warn('AudioWorklet not available, falling back to ScriptProcessor');
      await this.setupScriptProcessor();
    }
  }

  private async setupScriptProcessor(): Promise<void> {
    if (!this.audioContext || !this.mediaStream) return;

    const source = this.audioContext.createMediaStreamSource(this.mediaStream);
    const processor = this.audioContext.createScriptProcessor(this.FRAME_SIZE, 1, 1);

    processor.onaudioprocess = (event) => {
      const inputData = event.inputBuffer.getChannelData(0);
      this.processAudioFrame(inputData);
    };

    source.connect(processor);
    processor.connect(this.audioContext.destination);
  }

  private processAudioFrame(audioData: Float32Array): void {
    // Add audio data to circular buffer
    for (let i = 0; i < audioData.length; i++) {
      this.audioBuffer[this.bufferIndex] = audioData[i];
      this.bufferIndex = (this.bufferIndex + 1) % this.audioBuffer.length;
    }

    // Extract features and detect wake words
    if (this.bufferIndex % this.HOP_LENGTH === 0) {
      const features = this.extractFeatures(this.audioBuffer);
      this.detectWakeWords(features);
    }
  }

  private extractFeatures(audioBuffer: Float32Array): AudioFeatures {
    // Apply window function
    const windowedSignal = new Float32Array(this.FRAME_SIZE);
    const startIndex = Math.max(0, this.bufferIndex - this.FRAME_SIZE);
    
    for (let i = 0; i < this.FRAME_SIZE; i++) {
      const bufferIdx = (startIndex + i) % this.audioBuffer.length;
      windowedSignal[i] = audioBuffer[bufferIdx] * this.hammingWindow[i];
    }

    // Compute FFT
    const fftResult = this.computeFFT(windowedSignal);
    const powerSpectrum = this.computePowerSpectrum(fftResult);

    // Extract MFCC
    const mfcc = this.computeMFCC(powerSpectrum);

    // Extract other features
    const spectralCentroid = this.computeSpectralCentroid(powerSpectrum);
    const spectralRolloff = this.computeSpectralRolloff(powerSpectrum);
    const zeroCrossingRate = this.computeZeroCrossingRate(windowedSignal);
    const energy = this.computeEnergy(windowedSignal);

    return {
      mfcc,
      spectralCentroid,
      spectralRolloff,
      zeroCrossingRate,
      energy
    };
  }

  private computeFFT(signal: Float32Array): { real: Float32Array; imag: Float32Array } {
    // Simple FFT implementation (in production, use a library like fft.js)
    const N = signal.length;
    const real = new Float32Array(N);
    const imag = new Float32Array(N);

    for (let k = 0; k < N; k++) {
      let realSum = 0;
      let imagSum = 0;
      
      for (let n = 0; n < N; n++) {
        const angle = -2 * Math.PI * k * n / N;
        realSum += signal[n] * Math.cos(angle);
        imagSum += signal[n] * Math.sin(angle);
      }
      
      real[k] = realSum;
      imag[k] = imagSum;
    }

    return { real, imag };
  }

  private computePowerSpectrum(fft: { real: Float32Array; imag: Float32Array }): Float32Array {
    const spectrum = new Float32Array(fft.real.length / 2);
    
    for (let i = 0; i < spectrum.length; i++) {
      spectrum[i] = fft.real[i] * fft.real[i] + fft.imag[i] * fft.imag[i];
    }
    
    return spectrum;
  }

  private computeMFCC(powerSpectrum: Float32Array): Float32Array {
    // Apply mel filter bank
    const melEnergies = new Float32Array(this.melFilterBank.length);
    
    for (let i = 0; i < this.melFilterBank.length; i++) {
      let energy = 0;
      for (let j = 0; j < powerSpectrum.length; j++) {
        energy += powerSpectrum[j] * this.melFilterBank[i][j];
      }
      melEnergies[i] = Math.log(Math.max(energy, 1e-10));
    }

    // Apply DCT to get MFCCs
    const mfcc = new Float32Array(this.N_MFCC);
    
    for (let i = 0; i < this.N_MFCC; i++) {
      let sum = 0;
      for (let j = 0; j < melEnergies.length; j++) {
        sum += melEnergies[j] * Math.cos(Math.PI * i * (j + 0.5) / melEnergies.length);
      }
      mfcc[i] = sum;
    }

    return mfcc;
  }

  private computeSpectralCentroid(powerSpectrum: Float32Array): number {
    let weightedSum = 0;
    let totalEnergy = 0;

    for (let i = 0; i < powerSpectrum.length; i++) {
      const freq = (i * this.SAMPLE_RATE) / (2 * powerSpectrum.length);
      weightedSum += freq * powerSpectrum[i];
      totalEnergy += powerSpectrum[i];
    }

    return totalEnergy > 0 ? weightedSum / totalEnergy : 0;
  }

  private computeSpectralRolloff(powerSpectrum: Float32Array): number {
    const totalEnergy = powerSpectrum.reduce((sum, val) => sum + val, 0);
    const threshold = 0.85 * totalEnergy;
    
    let cumulativeEnergy = 0;
    for (let i = 0; i < powerSpectrum.length; i++) {
      cumulativeEnergy += powerSpectrum[i];
      if (cumulativeEnergy >= threshold) {
        return (i * this.SAMPLE_RATE) / (2 * powerSpectrum.length);
      }
    }
    
    return this.SAMPLE_RATE / 2;
  }

  private computeZeroCrossingRate(signal: Float32Array): number {
    let crossings = 0;
    
    for (let i = 1; i < signal.length; i++) {
      if ((signal[i] >= 0) !== (signal[i - 1] >= 0)) {
        crossings++;
      }
    }
    
    return crossings / signal.length;
  }

  private computeEnergy(signal: Float32Array): number {
    return signal.reduce((sum, val) => sum + val * val, 0) / signal.length;
  }

  private detectWakeWords(features: AudioFeatures): void {
    for (const [keyword, model] of this.models) {
      if (!model.isLoaded) continue;

      const confidence = this.calculateConfidence(features, model);
      
      if (confidence >= this.DETECTION_THRESHOLD) {
        this.callbacks.onWakeWordDetected(keyword, confidence);
        
        if (!this.options.continuousListening) {
          this.stopListening();
        }
        break;
      }
    }
  }

  private calculateConfidence(features: AudioFeatures, model: WakeWordModel): number {
    // Simple pattern-based confidence calculation
    // In production, this would use the trained model
    
    const keyword = model.keyword.toLowerCase();
    let confidence = 0;

    // Energy-based detection for voice activity
    if (features.energy > 0.01) {
      confidence += 0.2;
    }

    // Spectral features indicating speech
    if (features.spectralCentroid > 500 && features.spectralCentroid < 3000) {
      confidence += 0.2;
    }

    // Zero crossing rate for voice detection
    if (features.zeroCrossingRate > 0.02 && features.zeroCrossingRate < 0.3) {
      confidence += 0.2;
    }

    // MFCC-based pattern matching (simplified)
    const mfccSum = features.mfcc.reduce((sum, val) => sum + Math.abs(val), 0);
    if (mfccSum > 5 && mfccSum < 50) {
      confidence += 0.4;
    }

    return Math.min(confidence * model.sensitivity, 1.0);
  }

  public stopListening(): void {
    if (!this.isListening) return;

    this.isListening = false;
    this.callbacks.onStatusChange('stopped');

    if (this.audioWorklet) {
      this.audioWorklet.disconnect();
      this.audioWorklet = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Reset buffer
    this.audioBuffer.fill(0);
    this.bufferIndex = 0;
  }

  public addWakeWord(keyword: string, sensitivity?: number): void {
    const model: WakeWordModel = {
      id: this.generateModelId(keyword),
      keyword: keyword.toLowerCase(),
      sensitivity: sensitivity || this.options.sensitivity,
      modelData: null,
      isLoaded: true
    };

    this.models.set(keyword.toLowerCase(), model);
  }

  public removeWakeWord(keyword: string): void {
    this.models.delete(keyword.toLowerCase());
  }

  public updateSensitivity(sensitivity: number): void {
    this.options.sensitivity = Math.max(0, Math.min(1, sensitivity));
    
    // Update all models
    for (const model of this.models.values()) {
      model.sensitivity = this.options.sensitivity;
    }
  }

  public setCallbacks(callbacks: Partial<typeof this.callbacks>): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public isCurrentlyListening(): boolean {
    return this.isListening;
  }

  public isWakeWordSupported(): boolean {
    return this.isSupported;
  }

  public getRegisteredWakeWords(): string[] {
    return Array.from(this.models.keys());
  }

  private generateModelId(keyword: string): string {
    return `model_${keyword.replace(/\s+/g, '_')}_${Date.now()}`;
  }

  public dispose(): void {
    this.stopListening();
    this.models.clear();
  }
}

// Export utility functions
export const createWakeWordDetector = (options?: Partial<WakeWordDetectionOptions>) => {
  return new WakeWordDetector(options);
};

export const isWakeWordSupported = (): boolean => {
  return !!(window.AudioContext || window.webkitAudioContext) && 
         !!navigator.mediaDevices?.getUserMedia;
};