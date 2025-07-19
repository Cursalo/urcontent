/**
 * Advanced Audio Processing Engine
 * Handles noise reduction, echo cancellation, and audio enhancement
 */

import { AudioProcessingOptions } from './voice-types';

interface AudioProcessor {
  id: string;
  name: string;
  enabled: boolean;
  process: (inputBuffer: Float32Array) => Float32Array;
  dispose: () => void;
}

interface AudioMetrics {
  signalLevel: number;
  noiseLevel: number;
  snr: number; // Signal-to-noise ratio
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  clipping: boolean;
  voiceActivity: boolean;
}

export class AudioProcessingEngine {
  private audioContext: AudioContext | null = null;
  private processors: Map<string, AudioProcessor> = new Map();
  private options: AudioProcessingOptions;
  private analyserNode: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  
  // Audio worklet processors
  private noiseReductionProcessor: AudioWorkletNode | null = null;
  private echoCancellationProcessor: AudioWorkletNode | null = null;
  private voiceEnhancementProcessor: AudioWorkletNode | null = null;

  // Real-time metrics
  private metrics: AudioMetrics = {
    signalLevel: 0,
    noiseLevel: 0,
    snr: 0,
    quality: 'fair',
    clipping: false,
    voiceActivity: false
  };

  // Processing buffers
  private readonly BUFFER_SIZE = 4096;
  private readonly FFT_SIZE = 2048;
  private readonly SMOOTHING_TIME_CONSTANT = 0.8;

  // Noise profile for adaptive noise reduction
  private noiseProfile: Float32Array | null = null;
  private noiseEstimationFrames: Float32Array[] = [];
  private readonly NOISE_ESTIMATION_DURATION = 2000; // ms

  constructor(options: Partial<AudioProcessingOptions> = {}) {
    this.options = {
      sampleRate: 16000,
      channels: 1,
      bitDepth: 16,
      noiseReduction: true,
      echoCancellation: true,
      autoGainControl: true,
      noiseSuppression: true,
      ...options
    };

    this.initializeAudioContext();
  }

  private async initializeAudioContext(): Promise<void> {
    try {
      this.audioContext = new AudioContext({
        sampleRate: this.options.sampleRate,
        latencyHint: 'interactive'
      });

      await this.setupAudioNodes();
      await this.loadAudioWorklets();
      this.initializeProcessors();

    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      throw error;
    }
  }

  private async setupAudioNodes(): Promise<void> {
    if (!this.audioContext) return;

    // Create analyzer for real-time metrics
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = this.FFT_SIZE;
    this.analyserNode.smoothingTimeConstant = this.SMOOTHING_TIME_CONSTANT;

    // Create gain control
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 1.0;

    // Create compressor for dynamic range control
    this.compressorNode = this.audioContext.createDynamicsCompressor();
    this.compressorNode.threshold.value = -24;
    this.compressorNode.knee.value = 30;
    this.compressorNode.ratio.value = 12;
    this.compressorNode.attack.value = 0.003;
    this.compressorNode.release.value = 0.25;

    // Create high-pass filter to remove low-frequency noise
    this.filterNode = this.audioContext.createBiquadFilter();
    this.filterNode.type = 'highpass';
    this.filterNode.frequency.value = 80; // Remove frequencies below 80Hz
    this.filterNode.Q.value = 1;
  }

  private async loadAudioWorklets(): Promise<void> {
    if (!this.audioContext) return;

    try {
      await Promise.all([
        this.audioContext.audioWorklet.addModule('/audio-worklets/noise-reduction.js'),
        this.audioContext.audioWorklet.addModule('/audio-worklets/echo-cancellation.js'),
        this.audioContext.audioWorklet.addModule('/audio-worklets/voice-enhancement.js')
      ]);
    } catch (error) {
      console.warn('Some audio worklets could not be loaded:', error);
    }
  }

  private initializeProcessors(): void {
    // Noise Gate Processor
    this.addProcessor({
      id: 'noise_gate',
      name: 'Noise Gate',
      enabled: this.options.noiseSuppression,
      process: this.noiseGateProcessor.bind(this),
      dispose: () => {}
    });

    // Spectral Subtraction Processor
    this.addProcessor({
      id: 'spectral_subtraction',
      name: 'Spectral Subtraction',
      enabled: this.options.noiseReduction,
      process: this.spectralSubtractionProcessor.bind(this),
      dispose: () => {}
    });

    // Voice Activity Detection Processor
    this.addProcessor({
      id: 'vad',
      name: 'Voice Activity Detection',
      enabled: true,
      process: this.voiceActivityProcessor.bind(this),
      dispose: () => {}
    });

    // Automatic Gain Control Processor
    this.addProcessor({
      id: 'agc',
      name: 'Automatic Gain Control',
      enabled: this.options.autoGainControl,
      process: this.automaticGainProcessor.bind(this),
      dispose: () => {}
    });
  }

  public async processAudioStream(inputStream: MediaStream): Promise<MediaStream> {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }

    // Create source from input stream
    const source = this.audioContext.createMediaStreamSource(inputStream);
    
    // Build processing chain
    let currentNode: AudioNode = source;

    // Connect high-pass filter
    if (this.filterNode) {
      currentNode.connect(this.filterNode);
      currentNode = this.filterNode;
    }

    // Connect audio worklet processors
    if (this.options.noiseReduction && this.noiseReductionProcessor) {
      currentNode.connect(this.noiseReductionProcessor);
      currentNode = this.noiseReductionProcessor;
    }

    if (this.options.echoCancellation && this.echoCancellationProcessor) {
      currentNode.connect(this.echoCancellationProcessor);
      currentNode = this.echoCancellationProcessor;
    }

    if (this.voiceEnhancementProcessor) {
      currentNode.connect(this.voiceEnhancementProcessor);
      currentNode = this.voiceEnhancementProcessor;
    }

    // Connect compressor
    if (this.compressorNode) {
      currentNode.connect(this.compressorNode);
      currentNode = this.compressorNode;
    }

    // Connect gain control
    if (this.gainNode) {
      currentNode.connect(this.gainNode);
      currentNode = this.gainNode;
    }

    // Connect analyzer for metrics
    if (this.analyserNode) {
      currentNode.connect(this.analyserNode);
    }

    // Create output stream
    const destination = this.audioContext.createMediaStreamDestination();
    currentNode.connect(destination);

    // Start real-time monitoring
    this.startMetricsMonitoring();

    return destination.stream;
  }

  public processAudioBuffer(inputBuffer: Float32Array): Float32Array {
    let processedBuffer = new Float32Array(inputBuffer);

    // Apply each enabled processor
    for (const processor of this.processors.values()) {
      if (processor.enabled) {
        processedBuffer = processor.process(processedBuffer);
      }
    }

    // Update metrics
    this.updateMetrics(inputBuffer, processedBuffer);

    return processedBuffer;
  }

  private noiseGateProcessor(buffer: Float32Array): Float32Array {
    const threshold = 0.01; // Adjust based on environment
    const ratio = 0.1;
    const attackTime = 0.001;
    const releaseTime = 0.1;

    const output = new Float32Array(buffer.length);
    
    for (let i = 0; i < buffer.length; i++) {
      const amplitude = Math.abs(buffer[i]);
      
      if (amplitude < threshold) {
        output[i] = buffer[i] * ratio;
      } else {
        output[i] = buffer[i];
      }
    }

    return output;
  }

  private spectralSubtractionProcessor(buffer: Float32Array): Float32Array {
    if (!this.noiseProfile) {
      // Still learning noise profile
      this.collectNoiseProfile(buffer);
      return buffer;
    }

    // Apply spectral subtraction
    const fft = this.computeFFT(buffer);
    const magnitude = this.computeMagnitude(fft);
    const phase = this.computePhase(fft);

    // Subtract noise profile
    const cleanedMagnitude = new Float32Array(magnitude.length);
    for (let i = 0; i < magnitude.length; i++) {
      const noiseLevel = this.noiseProfile[i] || 0;
      cleanedMagnitude[i] = Math.max(magnitude[i] - 2 * noiseLevel, 0.1 * magnitude[i]);
    }

    // Reconstruct signal
    return this.reconstructSignal(cleanedMagnitude, phase);
  }

  private voiceActivityProcessor(buffer: Float32Array): Float32Array {
    // Detect voice activity for better processing
    const energy = this.computeEnergy(buffer);
    const zcr = this.computeZeroCrossingRate(buffer);
    const spectralCentroid = this.computeSpectralCentroid(buffer);

    // Voice activity detection heuristics
    const isVoice = energy > 0.01 && 
                   zcr > 0.02 && zcr < 0.3 && 
                   spectralCentroid > 500 && spectralCentroid < 3000;

    this.metrics.voiceActivity = isVoice;

    // Apply different processing based on voice activity
    if (isVoice) {
      // Enhance voice frequencies
      return this.enhanceVoiceFrequencies(buffer);
    } else {
      // Reduce noise more aggressively
      return this.reduceNoise(buffer, 0.5);
    }
  }

  private automaticGainProcessor(buffer: Float32Array): Float32Array {
    const currentLevel = this.computeRMS(buffer);
    const targetLevel = 0.1; // Target RMS level
    const maxGain = 4.0;
    const minGain = 0.1;

    if (currentLevel > 0) {
      const gain = Math.max(minGain, Math.min(maxGain, targetLevel / currentLevel));
      
      const output = new Float32Array(buffer.length);
      for (let i = 0; i < buffer.length; i++) {
        output[i] = buffer[i] * gain;
        
        // Prevent clipping
        if (Math.abs(output[i]) > 0.95) {
          output[i] = output[i] > 0 ? 0.95 : -0.95;
          this.metrics.clipping = true;
        }
      }
      
      return output;
    }

    return buffer;
  }

  private collectNoiseProfile(buffer: Float32Array): void {
    // Collect samples for noise profile estimation
    this.noiseEstimationFrames.push(new Float32Array(buffer));

    // Calculate noise profile after collecting enough samples
    const estimationDuration = this.NOISE_ESTIMATION_DURATION * this.options.sampleRate / 1000;
    const totalSamples = this.noiseEstimationFrames.reduce((sum, frame) => sum + frame.length, 0);

    if (totalSamples >= estimationDuration) {
      this.computeNoiseProfile();
    }
  }

  private computeNoiseProfile(): void {
    if (this.noiseEstimationFrames.length === 0) return;

    // Combine all noise frames
    const totalLength = this.noiseEstimationFrames.reduce((sum, frame) => sum + frame.length, 0);
    const combinedBuffer = new Float32Array(totalLength);
    
    let offset = 0;
    for (const frame of this.noiseEstimationFrames) {
      combinedBuffer.set(frame, offset);
      offset += frame.length;
    }

    // Compute FFT and average magnitude
    const fft = this.computeFFT(combinedBuffer);
    this.noiseProfile = this.computeMagnitude(fft);

    // Clear estimation frames
    this.noiseEstimationFrames = [];
  }

  private enhanceVoiceFrequencies(buffer: Float32Array): Float32Array {
    // Enhance frequencies typical for human speech (300Hz - 3400Hz)
    const fft = this.computeFFT(buffer);
    const magnitude = this.computeMagnitude(fft);
    const phase = this.computePhase(fft);

    // Apply enhancement to voice frequencies
    const enhanced = new Float32Array(magnitude.length);
    for (let i = 0; i < magnitude.length; i++) {
      const freq = (i * this.options.sampleRate) / (2 * magnitude.length);
      
      if (freq >= 300 && freq <= 3400) {
        enhanced[i] = magnitude[i] * 1.2; // Boost voice frequencies
      } else {
        enhanced[i] = magnitude[i];
      }
    }

    return this.reconstructSignal(enhanced, phase);
  }

  private reduceNoise(buffer: Float32Array, reduction: number): Float32Array {
    const output = new Float32Array(buffer.length);
    
    for (let i = 0; i < buffer.length; i++) {
      output[i] = buffer[i] * (1 - reduction);
    }

    return output;
  }

  private computeFFT(buffer: Float32Array): { real: Float32Array; imag: Float32Array } {
    // Simplified FFT implementation
    const N = buffer.length;
    const real = new Float32Array(N);
    const imag = new Float32Array(N);

    for (let k = 0; k < N; k++) {
      let realSum = 0;
      let imagSum = 0;
      
      for (let n = 0; n < N; n++) {
        const angle = -2 * Math.PI * k * n / N;
        realSum += buffer[n] * Math.cos(angle);
        imagSum += buffer[n] * Math.sin(angle);
      }
      
      real[k] = realSum;
      imag[k] = imagSum;
    }

    return { real, imag };
  }

  private computeMagnitude(fft: { real: Float32Array; imag: Float32Array }): Float32Array {
    const magnitude = new Float32Array(fft.real.length);
    
    for (let i = 0; i < magnitude.length; i++) {
      magnitude[i] = Math.sqrt(fft.real[i] * fft.real[i] + fft.imag[i] * fft.imag[i]);
    }

    return magnitude;
  }

  private computePhase(fft: { real: Float32Array; imag: Float32Array }): Float32Array {
    const phase = new Float32Array(fft.real.length);
    
    for (let i = 0; i < phase.length; i++) {
      phase[i] = Math.atan2(fft.imag[i], fft.real[i]);
    }

    return phase;
  }

  private reconstructSignal(magnitude: Float32Array, phase: Float32Array): Float32Array {
    const N = magnitude.length;
    const real = new Float32Array(N);
    const imag = new Float32Array(N);

    // Convert back to complex form
    for (let i = 0; i < N; i++) {
      real[i] = magnitude[i] * Math.cos(phase[i]);
      imag[i] = magnitude[i] * Math.sin(phase[i]);
    }

    // Inverse FFT
    const signal = new Float32Array(N);
    
    for (let n = 0; n < N; n++) {
      let sum = 0;
      
      for (let k = 0; k < N; k++) {
        const angle = 2 * Math.PI * k * n / N;
        sum += real[k] * Math.cos(angle) - imag[k] * Math.sin(angle);
      }
      
      signal[n] = sum / N;
    }

    return signal;
  }

  private computeEnergy(buffer: Float32Array): number {
    return buffer.reduce((sum, sample) => sum + sample * sample, 0) / buffer.length;
  }

  private computeRMS(buffer: Float32Array): number {
    return Math.sqrt(this.computeEnergy(buffer));
  }

  private computeZeroCrossingRate(buffer: Float32Array): number {
    let crossings = 0;
    
    for (let i = 1; i < buffer.length; i++) {
      if ((buffer[i] >= 0) !== (buffer[i - 1] >= 0)) {
        crossings++;
      }
    }
    
    return crossings / buffer.length;
  }

  private computeSpectralCentroid(buffer: Float32Array): number {
    const fft = this.computeFFT(buffer);
    const magnitude = this.computeMagnitude(fft);
    
    let weightedSum = 0;
    let totalMagnitude = 0;

    for (let i = 0; i < magnitude.length / 2; i++) {
      const freq = (i * this.options.sampleRate) / magnitude.length;
      weightedSum += freq * magnitude[i];
      totalMagnitude += magnitude[i];
    }

    return totalMagnitude > 0 ? weightedSum / totalMagnitude : 0;
  }

  private startMetricsMonitoring(): void {
    if (!this.analyserNode) return;

    const updateMetrics = () => {
      if (!this.analyserNode) return;

      const bufferLength = this.analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      this.analyserNode.getByteFrequencyData(dataArray);
      
      // Calculate signal level
      const signalLevel = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength / 255;
      
      // Update metrics
      this.metrics.signalLevel = signalLevel;
      this.updateQualityMetrics();

      // Continue monitoring
      requestAnimationFrame(updateMetrics);
    };

    updateMetrics();
  }

  private updateMetrics(inputBuffer: Float32Array, outputBuffer: Float32Array): void {
    const inputRMS = this.computeRMS(inputBuffer);
    const outputRMS = this.computeRMS(outputBuffer);
    
    this.metrics.signalLevel = outputRMS;
    this.metrics.snr = inputRMS > 0 ? 20 * Math.log10(outputRMS / this.metrics.noiseLevel) : 0;
    
    this.updateQualityMetrics();
  }

  private updateQualityMetrics(): void {
    const { signalLevel, snr, clipping } = this.metrics;

    if (clipping || signalLevel > 0.9) {
      this.metrics.quality = 'poor';
    } else if (snr > 20 && signalLevel > 0.1) {
      this.metrics.quality = 'excellent';
    } else if (snr > 10 && signalLevel > 0.05) {
      this.metrics.quality = 'good';
    } else {
      this.metrics.quality = 'fair';
    }

    // Reset clipping flag
    this.metrics.clipping = false;
  }

  public addProcessor(processor: AudioProcessor): void {
    this.processors.set(processor.id, processor);
  }

  public removeProcessor(id: string): void {
    const processor = this.processors.get(id);
    if (processor) {
      processor.dispose();
      this.processors.delete(id);
    }
  }

  public enableProcessor(id: string): void {
    const processor = this.processors.get(id);
    if (processor) {
      processor.enabled = true;
    }
  }

  public disableProcessor(id: string): void {
    const processor = this.processors.get(id);
    if (processor) {
      processor.enabled = false;
    }
  }

  public getMetrics(): AudioMetrics {
    return { ...this.metrics };
  }

  public updateOptions(options: Partial<AudioProcessingOptions>): void {
    this.options = { ...this.options, ...options };
    
    // Update processor states
    this.enableProcessor('noise_gate');
    this.enableProcessor('spectral_subtraction');
    this.enableProcessor('agc');
    
    if (!this.options.noiseSuppression) {
      this.disableProcessor('noise_gate');
    }
    
    if (!this.options.noiseReduction) {
      this.disableProcessor('spectral_subtraction');
    }
    
    if (!this.options.autoGainControl) {
      this.disableProcessor('agc');
    }
  }

  public resetNoiseProfile(): void {
    this.noiseProfile = null;
    this.noiseEstimationFrames = [];
  }

  public dispose(): void {
    // Dispose all processors
    for (const processor of this.processors.values()) {
      processor.dispose();
    }
    this.processors.clear();

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Clean up worklet processors
    this.noiseReductionProcessor = null;
    this.echoCancellationProcessor = null;
    this.voiceEnhancementProcessor = null;
  }
}

// Export utility functions
export const createAudioProcessingEngine = (options?: Partial<AudioProcessingOptions>) => {
  return new AudioProcessingEngine(options);
};

export const isAudioProcessingSupported = (): boolean => {
  return !!(window.AudioContext || window.webkitAudioContext);
};

export const getOptimalAudioSettings = (): AudioProcessingOptions => {
  return {
    sampleRate: 16000,
    channels: 1,
    bitDepth: 16,
    noiseReduction: true,
    echoCancellation: true,
    autoGainControl: true,
    noiseSuppression: true
  };
};