/**
 * Wake Word Detection Audio Worklet
 * Processes audio for wake word detection
 */

class WakeWordProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    
    // Configuration
    this.frameSize = options.processorOptions?.frameSize || 1024;
    this.hopLength = options.processorOptions?.hopLength || 512;
    this.sampleRate = 16000;
    
    // Audio buffer
    this.audioBuffer = new Float32Array(this.frameSize);
    this.bufferIndex = 0;
    
    // Voice Activity Detection parameters
    this.energyThreshold = 0.01;
    this.zeroCrossingThreshold = 0.1;
    this.frameCount = 0;
    
    // Feature extraction
    this.windowFunction = this.createHammingWindow(this.frameSize);
    
    // Preprocessing filters
    this.preEmphasisCoeff = 0.97;
    this.lastSample = 0;
    
    this.port.onmessage = (event) => {
      if (event.data.command === 'updateConfig') {
        this.updateConfiguration(event.data.config);
      }
    };
  }
  
  createHammingWindow(size) {
    const window = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      window[i] = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (size - 1));
    }
    return window;
  }
  
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    
    if (input.length > 0) {
      const inputChannel = input[0];
      
      // Copy input to output (passthrough)
      if (output.length > 0) {
        output[0].set(inputChannel);
      }
      
      // Process audio for wake word detection
      for (let i = 0; i < inputChannel.length; i++) {
        // Pre-emphasis filter
        const currentSample = inputChannel[i];
        const filteredSample = currentSample - this.preEmphasisCoeff * this.lastSample;
        this.lastSample = currentSample;
        
        // Add to buffer
        this.audioBuffer[this.bufferIndex] = filteredSample;
        this.bufferIndex++;
        
        // Process frame when buffer is full
        if (this.bufferIndex >= this.frameSize) {
          this.processAudioFrame();
          
          // Overlap by hop length
          const overlap = this.frameSize - this.hopLength;
          for (let j = 0; j < overlap; j++) {
            this.audioBuffer[j] = this.audioBuffer[j + this.hopLength];
          }
          this.bufferIndex = overlap;
        }
      }
    }
    
    return true;
  }
  
  processAudioFrame() {
    this.frameCount++;
    
    // Apply window function
    const windowedFrame = new Float32Array(this.frameSize);
    for (let i = 0; i < this.frameSize; i++) {
      windowedFrame[i] = this.audioBuffer[i] * this.windowFunction[i];
    }
    
    // Voice Activity Detection
    const energy = this.computeEnergy(windowedFrame);
    const zeroCrossingRate = this.computeZeroCrossingRate(windowedFrame);
    const spectralCentroid = this.computeSpectralCentroid(windowedFrame);
    
    const isVoiceActive = this.detectVoiceActivity(energy, zeroCrossingRate, spectralCentroid);
    
    if (isVoiceActive) {
      // Extract features for wake word detection
      const features = this.extractFeatures(windowedFrame);
      
      // Send audio data to main thread for processing
      this.port.postMessage({
        type: 'audioFrame',
        audioData: Array.from(windowedFrame),
        features: features,
        timestamp: currentTime,
        frameNumber: this.frameCount
      });
    }
  }
  
  computeEnergy(frame) {
    let energy = 0;
    for (let i = 0; i < frame.length; i++) {
      energy += frame[i] * frame[i];
    }
    return energy / frame.length;
  }
  
  computeZeroCrossingRate(frame) {
    let crossings = 0;
    for (let i = 1; i < frame.length; i++) {
      if ((frame[i] >= 0) !== (frame[i - 1] >= 0)) {
        crossings++;
      }
    }
    return crossings / frame.length;
  }
  
  computeSpectralCentroid(frame) {
    // Simple FFT for spectral analysis
    const fft = this.computeFFT(frame);
    const magnitude = this.computeMagnitude(fft);
    
    let weightedSum = 0;
    let totalMagnitude = 0;
    
    for (let i = 0; i < magnitude.length / 2; i++) {
      const frequency = (i * this.sampleRate) / magnitude.length;
      weightedSum += frequency * magnitude[i];
      totalMagnitude += magnitude[i];
    }
    
    return totalMagnitude > 0 ? weightedSum / totalMagnitude : 0;
  }
  
  detectVoiceActivity(energy, zeroCrossingRate, spectralCentroid) {
    // Simple voice activity detection
    const energyActive = energy > this.energyThreshold;
    const zcrActive = zeroCrossingRate > 0.02 && zeroCrossingRate < 0.4;
    const spectralActive = spectralCentroid > 300 && spectralCentroid < 4000;
    
    return energyActive && zcrActive && spectralActive;
  }
  
  extractFeatures(frame) {
    const fft = this.computeFFT(frame);
    const magnitude = this.computeMagnitude(fft);
    
    // Extract mel-frequency cepstral coefficients (simplified)
    const mfcc = this.computeMFCC(magnitude);
    
    return {
      energy: this.computeEnergy(frame),
      zeroCrossingRate: this.computeZeroCrossingRate(frame),
      spectralCentroid: this.computeSpectralCentroid(frame),
      mfcc: Array.from(mfcc)
    };
  }
  
  computeFFT(signal) {
    const N = signal.length;
    const real = new Float32Array(N);
    const imag = new Float32Array(N);
    
    // Simple DFT implementation
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
  
  computeMagnitude(fft) {
    const magnitude = new Float32Array(fft.real.length);
    
    for (let i = 0; i < magnitude.length; i++) {
      magnitude[i] = Math.sqrt(fft.real[i] * fft.real[i] + fft.imag[i] * fft.imag[i]);
    }
    
    return magnitude;
  }
  
  computeMFCC(magnitude) {
    // Simplified MFCC computation
    const numCoeffs = 13;
    const numFilters = 26;
    
    // Apply mel filter bank (simplified)
    const melEnergies = new Float32Array(numFilters);
    for (let i = 0; i < numFilters; i++) {
      // Simple triangular filters
      const start = Math.floor(i * magnitude.length / (numFilters + 1));
      const end = Math.floor((i + 2) * magnitude.length / (numFilters + 1));
      
      let energy = 0;
      for (let j = start; j < end && j < magnitude.length; j++) {
        energy += magnitude[j];
      }
      melEnergies[i] = Math.log(Math.max(energy, 1e-10));
    }
    
    // Apply DCT to get MFCC coefficients
    const mfcc = new Float32Array(numCoeffs);
    for (let i = 0; i < numCoeffs; i++) {
      let sum = 0;
      for (let j = 0; j < numFilters; j++) {
        sum += melEnergies[j] * Math.cos(Math.PI * i * (j + 0.5) / numFilters);
      }
      mfcc[i] = sum;
    }
    
    return mfcc;
  }
  
  updateConfiguration(config) {
    if (config.energyThreshold !== undefined) {
      this.energyThreshold = config.energyThreshold;
    }
    if (config.zeroCrossingThreshold !== undefined) {
      this.zeroCrossingThreshold = config.zeroCrossingThreshold;
    }
  }
}

registerProcessor('wake-word-processor', WakeWordProcessor);