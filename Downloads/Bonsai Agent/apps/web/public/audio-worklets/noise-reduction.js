/**
 * Noise Reduction Audio Worklet
 * Reduces background noise in real-time audio processing
 */

class NoiseReductionProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    
    // Noise reduction parameters
    this.frameSize = 1024;
    this.hopSize = 512;
    this.sampleRate = 16000;
    
    // Buffers
    this.inputBuffer = new Float32Array(this.frameSize);
    this.outputBuffer = new Float32Array(this.frameSize);
    this.bufferIndex = 0;
    
    // Noise profile
    this.noiseProfile = null;
    this.noiseFrames = [];
    this.isLearningNoise = true;
    this.learningFrameCount = 0;
    this.maxLearningFrames = 50; // ~1 second at 16kHz
    
    // Spectral subtraction parameters
    this.alpha = 2.0; // Over-subtraction factor
    this.beta = 0.01; // Spectral floor
    
    // Window function (Hann window)
    this.window = new Float32Array(this.frameSize);
    for (let i = 0; i < this.frameSize; i++) {
      this.window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (this.frameSize - 1)));
    }
    
    // FFT setup (simple DFT for now - in production use a proper FFT library)
    this.setupFFT();
  }
  
  setupFFT() {
    // Pre-compute twiddle factors for DFT
    this.cos_table = new Float32Array(this.frameSize);
    this.sin_table = new Float32Array(this.frameSize);
    
    for (let i = 0; i < this.frameSize; i++) {
      this.cos_table[i] = Math.cos(2 * Math.PI * i / this.frameSize);
      this.sin_table[i] = Math.sin(2 * Math.PI * i / this.frameSize);
    }
  }
  
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    
    if (input.length > 0 && output.length > 0) {
      const inputChannel = input[0];
      const outputChannel = output[0];
      
      // Process each sample
      for (let i = 0; i < inputChannel.length; i++) {
        this.inputBuffer[this.bufferIndex] = inputChannel[i];
        this.bufferIndex++;
        
        // Process frame when buffer is full
        if (this.bufferIndex >= this.frameSize) {
          this.processFrame();
          this.bufferIndex = 0;
        }
        
        // Output processed sample (with overlap-add)
        outputChannel[i] = this.outputBuffer[i] || inputChannel[i];
      }
    }
    
    return true;
  }
  
  processFrame() {
    // Apply window
    const windowedFrame = new Float32Array(this.frameSize);
    for (let i = 0; i < this.frameSize; i++) {
      windowedFrame[i] = this.inputBuffer[i] * this.window[i];
    }
    
    // Compute FFT
    const fft = this.computeFFT(windowedFrame);
    const magnitude = this.computeMagnitude(fft);
    const phase = this.computePhase(fft);
    
    if (this.isLearningNoise) {
      // Learn noise profile from initial frames
      this.learnNoiseProfile(magnitude);
    } else {
      // Apply noise reduction
      const cleanMagnitude = this.spectralSubtraction(magnitude);
      
      // Reconstruct signal
      const cleanedFrame = this.reconstructSignal(cleanMagnitude, phase);
      
      // Apply window and overlap-add
      for (let i = 0; i < this.frameSize; i++) {
        this.outputBuffer[i] = cleanedFrame[i] * this.window[i];
      }
    }
  }
  
  learnNoiseProfile(magnitude) {
    this.noiseFrames.push(new Float32Array(magnitude));
    this.learningFrameCount++;
    
    if (this.learningFrameCount >= this.maxLearningFrames) {
      // Compute average noise profile
      this.noiseProfile = new Float32Array(magnitude.length);
      
      for (let i = 0; i < magnitude.length; i++) {
        let sum = 0;
        for (let j = 0; j < this.noiseFrames.length; j++) {
          sum += this.noiseFrames[j][i];
        }
        this.noiseProfile[i] = sum / this.noiseFrames.length;
      }
      
      this.isLearningNoise = false;
      this.noiseFrames = []; // Free memory
      
      // Notify main thread that noise learning is complete
      this.port.postMessage({
        type: 'noiseProfileReady',
        profile: Array.from(this.noiseProfile)
      });
    }
  }
  
  spectralSubtraction(magnitude) {
    if (!this.noiseProfile) {
      return magnitude; // No noise reduction if profile not ready
    }
    
    const cleanMagnitude = new Float32Array(magnitude.length);
    
    for (let i = 0; i < magnitude.length; i++) {
      const noiseMag = this.noiseProfile[i];
      const signalMag = magnitude[i];
      
      // Spectral subtraction formula
      const subtracted = signalMag - this.alpha * noiseMag;
      
      // Apply spectral floor to prevent musical noise
      const floor = this.beta * signalMag;
      cleanMagnitude[i] = Math.max(subtracted, floor);
    }
    
    return cleanMagnitude;
  }
  
  computeFFT(signal) {
    const N = signal.length;
    const real = new Float32Array(N);
    const imag = new Float32Array(N);
    
    // Simple DFT (replace with FFT in production)
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
  
  computePhase(fft) {
    const phase = new Float32Array(fft.real.length);
    
    for (let i = 0; i < phase.length; i++) {
      phase[i] = Math.atan2(fft.imag[i], fft.real[i]);
    }
    
    return phase;
  }
  
  reconstructSignal(magnitude, phase) {
    const N = magnitude.length;
    const real = new Float32Array(N);
    const imag = new Float32Array(N);
    
    // Convert back to complex form
    for (let i = 0; i < N; i++) {
      real[i] = magnitude[i] * Math.cos(phase[i]);
      imag[i] = magnitude[i] * Math.sin(phase[i]);
    }
    
    // Inverse FFT (simple IDFT)
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
}

registerProcessor('noise-reduction-processor', NoiseReductionProcessor);