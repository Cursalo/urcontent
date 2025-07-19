'use client'

/**
 * 🌿 Bonsai Advanced Screenshot Capture System
 * 
 * High-performance screenshot capture optimized for browser extensions
 * Supports multiple capture methods, real-time optimization, and quality enhancement
 */

export interface CaptureOptions {
  target?: 'element' | 'viewport' | 'fullpage' | 'selection'
  element?: HTMLElement
  quality?: number
  format?: 'png' | 'jpeg' | 'webp'
  scale?: number
  background?: string
  excludeElements?: string[]
  includeElements?: string[]
  enhancement?: EnhancementOptions
  performance?: PerformanceOptions
}

export interface EnhancementOptions {
  denoise?: boolean
  sharpen?: boolean
  contrast?: number
  brightness?: number
  saturation?: number
  textOptimization?: boolean
  mathOptimization?: boolean
}

export interface PerformanceOptions {
  maxWidth?: number
  maxHeight?: number
  compression?: number
  caching?: boolean
  throttle?: number
  async?: boolean
}

export interface CaptureResult {
  dataUrl: string
  metadata: CaptureMetadata
  performance: PerformanceMetrics
  success: boolean
  error?: string
}

export interface CaptureMetadata {
  width: number
  height: number
  format: string
  quality: number
  timestamp: number
  captureMethod: string
  fileSize: number
  devicePixelRatio: number
}

export interface PerformanceMetrics {
  captureTime: number
  processingTime: number
  totalTime: number
  memoryUsage?: number
  optimizationApplied: string[]
}

export interface RegionSelector {
  x: number
  y: number
  width: number
  height: number
}

export class BonsaiScreenshotCapture {
  private canvas: HTMLCanvasElement
  private context: CanvasRenderingContext2D
  private isCapturing = false
  private captureQueue: Array<() => Promise<CaptureResult>> = []
  private cache = new Map<string, CaptureResult>()
  private performance = {
    totalCaptures: 0,
    averageTime: 0,
    lastCaptureTime: 0
  }

  // Modern browser APIs support
  private supportsDisplayMedia: boolean
  private supportsOffscreenCanvas: boolean
  private supportsImageCapture: boolean
  private supportsWebGL: boolean

  constructor() {
    this.initializeCanvas()
    this.detectBrowserCapabilities()
    this.setupPerformanceMonitoring()
  }

  private initializeCanvas(): void {
    this.canvas = document.createElement('canvas')
    const context = this.canvas.getContext('2d', {
      alpha: false,
      willReadFrequently: true,
      desynchronized: true
    })
    
    if (!context) {
      throw new Error('Failed to get 2D context')
    }
    
    this.context = context
    
    // Optimize canvas for performance
    this.canvas.style.imageRendering = 'crisp-edges'
    this.canvas.style.imageRendering = '-webkit-optimize-contrast'
    
    // Set up high-DPI rendering
    const dpr = window.devicePixelRatio || 1
    this.context.imageSmoothingEnabled = true
    this.context.imageSmoothingQuality = 'high'
  }

  private detectBrowserCapabilities(): void {
    this.supportsDisplayMedia = 'getDisplayMedia' in navigator.mediaDevices
    this.supportsOffscreenCanvas = 'OffscreenCanvas' in window
    this.supportsImageCapture = 'ImageCapture' in window
    this.supportsWebGL = !!(this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl'))
    
    console.log('🌿 Browser capabilities:', {
      displayMedia: this.supportsDisplayMedia,
      offscreenCanvas: this.supportsOffscreenCanvas,
      imageCapture: this.supportsImageCapture,
      webGL: this.supportsWebGL
    })
  }

  private setupPerformanceMonitoring(): void {
    // Monitor memory usage if available
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory
        if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
          this.clearCache()
        }
      }, 30000)
    }
  }

  /**
   * Main capture function with intelligent method selection
   */
  async capture(options: CaptureOptions = {}): Promise<CaptureResult> {
    const startTime = performance.now()
    
    try {
      // Prevent concurrent captures for performance
      if (this.isCapturing && !options.performance?.async) {
        return await this.queueCapture(options)
      }
      
      this.isCapturing = true
      
      // Select optimal capture method
      const captureMethod = this.selectCaptureMethod(options)
      console.log(`🌿 Using capture method: ${captureMethod}`)
      
      // Perform capture
      let result: CaptureResult
      
      switch (captureMethod) {
        case 'html2canvas':
          result = await this.captureWithHtml2Canvas(options)
          break
        case 'display-media':
          result = await this.captureWithDisplayMedia(options)
          break
        case 'dom-to-image':
          result = await this.captureWithDomToImage(options)
          break
        case 'svg-foreign-object':
          result = await this.captureWithSVG(options)
          break
        case 'canvas-clone':
          result = await this.captureWithCanvasClone(options)
          break
        default:
          result = await this.captureWithNativeAPI(options)
      }
      
      // Apply enhancements if requested
      if (options.enhancement) {
        result = await this.enhanceCapture(result, options.enhancement)
      }
      
      // Cache result if enabled
      if (options.performance?.caching) {
        const cacheKey = this.generateCacheKey(options)
        this.cache.set(cacheKey, result)
      }
      
      // Update performance metrics
      this.updatePerformanceMetrics(performance.now() - startTime)
      
      return result
      
    } catch (error) {
      console.error('🌿 Screenshot capture error:', error)
      return this.createErrorResult(error as Error, performance.now() - startTime)
    } finally {
      this.isCapturing = false
      this.processQueue()
    }
  }

  /**
   * Select the optimal capture method based on options and browser capabilities
   */
  private selectCaptureMethod(options: CaptureOptions): string {
    // Check if html2canvas is available (best quality for DOM)
    if (typeof window !== 'undefined' && 'html2canvas' in window) {
      return 'html2canvas'
    }
    
    // Use display media for fullpage captures (Chrome extension context)
    if (options.target === 'fullpage' && this.supportsDisplayMedia && this.isExtensionContext()) {
      return 'display-media'
    }
    
    // Use SVG foreign object for modern browsers
    if (this.supportsOffscreenCanvas && options.target !== 'fullpage') {
      return 'svg-foreign-object'
    }
    
    // Use DOM to image library if available
    if (typeof window !== 'undefined' && 'domtoimage' in window) {
      return 'dom-to-image'
    }
    
    // Canvas cloning for canvas elements
    if (options.element?.tagName === 'CANVAS') {
      return 'canvas-clone'
    }
    
    // Fallback to native API
    return 'native-api'
  }

  /**
   * Capture using html2canvas library (highest quality)
   */
  private async captureWithHtml2Canvas(options: CaptureOptions): Promise<CaptureResult> {
    const startTime = performance.now()
    
    try {
      const target = this.getTargetElement(options)
      
      // @ts-ignore - html2canvas loaded dynamically
      const canvas = await window.html2canvas(target, {
        allowTaint: true,
        useCORS: true,
        scale: options.scale || window.devicePixelRatio,
        quality: options.quality || 0.95,
        backgroundColor: options.background || null,
        removeContainer: true,
        logging: false,
        imageTimeout: 15000,
        height: options.performance?.maxHeight,
        width: options.performance?.maxWidth,
        onclone: (clonedDoc: Document) => {
          this.optimizeClonedDocument(clonedDoc, options)
        }
      })
      
      const dataUrl = canvas.toDataURL(`image/${options.format || 'png'}`, options.quality || 0.95)
      
      return {
        dataUrl,
        metadata: {
          width: canvas.width,
          height: canvas.height,
          format: options.format || 'png',
          quality: options.quality || 0.95,
          timestamp: Date.now(),
          captureMethod: 'html2canvas',
          fileSize: this.calculateFileSize(dataUrl),
          devicePixelRatio: window.devicePixelRatio || 1
        },
        performance: {
          captureTime: performance.now() - startTime,
          processingTime: 0,
          totalTime: performance.now() - startTime,
          optimizationApplied: ['html2canvas-render']
        },
        success: true
      }
      
    } catch (error) {
      throw new Error(`html2canvas capture failed: ${error}`)
    }
  }

  /**
   * Capture using Chrome's display media API (for extensions)
   */
  private async captureWithDisplayMedia(options: CaptureOptions): Promise<CaptureResult> {
    const startTime = performance.now()
    
    try {
      // Only available in extension context
      if (!this.isExtensionContext()) {
        throw new Error('Display media capture requires extension context')
      }

      // Request screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: 'screen',
          width: { ideal: options.performance?.maxWidth || 1920 },
          height: { ideal: options.performance?.maxHeight || 1080 }
        }
      })

      // Create video element to capture frame
      const video = document.createElement('video')
      video.srcObject = stream
      video.play()

      return new Promise((resolve, reject) => {
        video.addEventListener('loadedmetadata', () => {
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')!
          
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          
          context.drawImage(video, 0, 0)
          
          // Stop the stream
          stream.getTracks().forEach(track => track.stop())
          
          const dataUrl = canvas.toDataURL(`image/${options.format || 'png'}`, options.quality || 0.95)
          
          resolve({
            dataUrl,
            metadata: {
              width: canvas.width,
              height: canvas.height,
              format: options.format || 'png',
              quality: options.quality || 0.95,
              timestamp: Date.now(),
              captureMethod: 'display-media',
              fileSize: this.calculateFileSize(dataUrl),
              devicePixelRatio: window.devicePixelRatio || 1
            },
            performance: {
              captureTime: performance.now() - startTime,
              processingTime: 0,
              totalTime: performance.now() - startTime,
              optimizationApplied: ['display-media-api']
            },
            success: true
          })
        })
        
        video.addEventListener('error', (error) => {
          stream.getTracks().forEach(track => track.stop())
          reject(error)
        })
      })
      
    } catch (error) {
      throw new Error(`Display media capture failed: ${error}`)
    }
  }

  /**
   * Capture using dom-to-image library
   */
  private async captureWithDomToImage(options: CaptureOptions): Promise<CaptureResult> {
    const startTime = performance.now()
    
    try {
      const target = this.getTargetElement(options)
      
      // @ts-ignore - domtoimage loaded dynamically
      const dataUrl = await window.domtoimage.toPng(target, {
        quality: options.quality || 0.95,
        bgcolor: options.background || '#ffffff',
        width: options.performance?.maxWidth,
        height: options.performance?.maxHeight,
        style: {
          transform: `scale(${options.scale || 1})`,
          transformOrigin: 'top left'
        }
      })
      
      return {
        dataUrl,
        metadata: {
          width: target.offsetWidth,
          height: target.offsetHeight,
          format: 'png',
          quality: options.quality || 0.95,
          timestamp: Date.now(),
          captureMethod: 'dom-to-image',
          fileSize: this.calculateFileSize(dataUrl),
          devicePixelRatio: window.devicePixelRatio || 1
        },
        performance: {
          captureTime: performance.now() - startTime,
          processingTime: 0,
          totalTime: performance.now() - startTime,
          optimizationApplied: ['dom-to-image']
        },
        success: true
      }
      
    } catch (error) {
      throw new Error(`dom-to-image capture failed: ${error}`)
    }
  }

  /**
   * Capture using SVG foreign object (modern browsers)
   */
  private async captureWithSVG(options: CaptureOptions): Promise<CaptureResult> {
    const startTime = performance.now()
    
    try {
      const target = this.getTargetElement(options)
      const rect = target.getBoundingClientRect()
      
      // Clone the element to avoid modifying the original
      const clone = target.cloneNode(true) as HTMLElement
      this.optimizeElementForCapture(clone, options)
      
      // Create SVG with foreign object
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" 
             width="${rect.width}" 
             height="${rect.height}"
             viewBox="0 0 ${rect.width} ${rect.height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" 
                 style="font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: ${options.background || '#ffffff'};">
              ${clone.outerHTML}
            </div>
          </foreignObject>
        </svg>
      `

      return new Promise((resolve, reject) => {
        const img = new Image()
        const blob = new Blob([svgString], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)

        img.onload = () => {
          // Set up canvas
          this.canvas.width = rect.width * (options.scale || 1)
          this.canvas.height = rect.height * (options.scale || 1)
          
          if (options.scale && options.scale !== 1) {
            this.context.scale(options.scale, options.scale)
          }
          
          // Draw background
          this.context.fillStyle = options.background || '#ffffff'
          this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
          
          // Draw image
          this.context.drawImage(img, 0, 0)
          
          URL.revokeObjectURL(url)
          
          const dataUrl = this.canvas.toDataURL(`image/${options.format || 'png'}`, options.quality || 0.95)
          
          resolve({
            dataUrl,
            metadata: {
              width: this.canvas.width,
              height: this.canvas.height,
              format: options.format || 'png',
              quality: options.quality || 0.95,
              timestamp: Date.now(),
              captureMethod: 'svg-foreign-object',
              fileSize: this.calculateFileSize(dataUrl),
              devicePixelRatio: window.devicePixelRatio || 1
            },
            performance: {
              captureTime: performance.now() - startTime,
              processingTime: 0,
              totalTime: performance.now() - startTime,
              optimizationApplied: ['svg-rendering', 'foreign-object']
            },
            success: true
          })
        }

        img.onerror = () => {
          URL.revokeObjectURL(url)
          reject(new Error('SVG image load failed'))
        }

        img.src = url
      })
      
    } catch (error) {
      throw new Error(`SVG capture failed: ${error}`)
    }
  }

  /**
   * Capture canvas elements directly
   */
  private async captureWithCanvasClone(options: CaptureOptions): Promise<CaptureResult> {
    const startTime = performance.now()
    
    try {
      const canvas = options.element as HTMLCanvasElement
      if (!canvas || canvas.tagName !== 'CANVAS') {
        throw new Error('Element is not a canvas')
      }
      
      const dataUrl = canvas.toDataURL(`image/${options.format || 'png'}`, options.quality || 0.95)
      
      return {
        dataUrl,
        metadata: {
          width: canvas.width,
          height: canvas.height,
          format: options.format || 'png',
          quality: options.quality || 0.95,
          timestamp: Date.now(),
          captureMethod: 'canvas-clone',
          fileSize: this.calculateFileSize(dataUrl),
          devicePixelRatio: window.devicePixelRatio || 1
        },
        performance: {
          captureTime: performance.now() - startTime,
          processingTime: 0,
          totalTime: performance.now() - startTime,
          optimizationApplied: ['direct-canvas-export']
        },
        success: true
      }
      
    } catch (error) {
      throw new Error(`Canvas capture failed: ${error}`)
    }
  }

  /**
   * Native browser API capture (fallback)
   */
  private async captureWithNativeAPI(options: CaptureOptions): Promise<CaptureResult> {
    const startTime = performance.now()
    
    try {
      const target = this.getTargetElement(options)
      const rect = target.getBoundingClientRect()
      
      // Set up canvas
      this.canvas.width = rect.width * (options.scale || 1)
      this.canvas.height = rect.height * (options.scale || 1)
      
      if (options.scale && options.scale !== 1) {
        this.context.scale(options.scale, options.scale)
      }
      
      // Draw background
      this.context.fillStyle = options.background || '#ffffff'
      this.context.fillRect(0, 0, rect.width, rect.height)
      
      // Simple text rendering for fallback
      const text = target.textContent || 'Content not available'
      this.context.fillStyle = '#000000'
      this.context.font = '14px Arial'
      
      const lines = this.wrapText(text, rect.width - 20)
      lines.forEach((line, index) => {
        this.context.fillText(line, 10, 25 + (index * 20))
      })
      
      const dataUrl = this.canvas.toDataURL(`image/${options.format || 'png'}`, options.quality || 0.95)
      
      return {
        dataUrl,
        metadata: {
          width: this.canvas.width,
          height: this.canvas.height,
          format: options.format || 'png',
          quality: options.quality || 0.95,
          timestamp: Date.now(),
          captureMethod: 'native-api',
          fileSize: this.calculateFileSize(dataUrl),
          devicePixelRatio: window.devicePixelRatio || 1
        },
        performance: {
          captureTime: performance.now() - startTime,
          processingTime: 0,
          totalTime: performance.now() - startTime,
          optimizationApplied: ['text-fallback']
        },
        success: true
      }
      
    } catch (error) {
      throw new Error(`Native API capture failed: ${error}`)
    }
  }

  /**
   * Enhance captured image with filters and optimizations
   */
  private async enhanceCapture(result: CaptureResult, enhancement: EnhancementOptions): Promise<CaptureResult> {
    const startTime = performance.now()
    
    try {
      // Load image data
      const img = new Image()
      img.src = result.dataUrl
      
      return new Promise((resolve) => {
        img.onload = () => {
          // Set up enhancement canvas
          const enhanceCanvas = document.createElement('canvas')
          const enhanceContext = enhanceCanvas.getContext('2d')!
          
          enhanceCanvas.width = img.width
          enhanceCanvas.height = img.height
          
          // Apply enhancements
          const optimizations: string[] = [...result.performance.optimizationApplied]
          
          // Brightness and contrast
          if (enhancement.brightness !== undefined || enhancement.contrast !== undefined) {
            enhanceContext.filter = `brightness(${enhancement.brightness || 1}) contrast(${enhancement.contrast || 1})`
            optimizations.push('brightness-contrast')
          }
          
          // Saturation
          if (enhancement.saturation !== undefined) {
            enhanceContext.filter += ` saturate(${enhancement.saturation})`
            optimizations.push('saturation')
          }
          
          // Draw enhanced image
          enhanceContext.drawImage(img, 0, 0)
          
          // Text optimization (sharpen for better OCR)
          if (enhancement.textOptimization) {
            this.applyTextOptimization(enhanceContext, enhanceCanvas)
            optimizations.push('text-optimization')
          }
          
          // Math optimization (enhance mathematical symbols)
          if (enhancement.mathOptimization) {
            this.applyMathOptimization(enhanceContext, enhanceCanvas)
            optimizations.push('math-optimization')
          }
          
          const enhancedDataUrl = enhanceCanvas.toDataURL(`image/${result.metadata.format}`, result.metadata.quality)
          
          resolve({
            ...result,
            dataUrl: enhancedDataUrl,
            metadata: {
              ...result.metadata,
              fileSize: this.calculateFileSize(enhancedDataUrl)
            },
            performance: {
              ...result.performance,
              processingTime: performance.now() - startTime,
              totalTime: result.performance.totalTime + (performance.now() - startTime),
              optimizationApplied: optimizations
            }
          })
        }
      })
      
    } catch (error) {
      console.error('🌿 Enhancement error:', error)
      return result // Return original if enhancement fails
    }
  }

  /**
   * Apply text optimization filters
   */
  private applyTextOptimization(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    
    // Simple sharpening filter for text
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
      
      // Increase contrast for text regions
      const contrast = 1.2
      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast))
      
      data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128))
      data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128))
      data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128))
    }
    
    context.putImageData(imageData, 0, 0)
  }

  /**
   * Apply mathematical symbol optimization
   */
  private applyMathOptimization(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    // Apply sharpening specifically for mathematical symbols
    context.filter = 'contrast(1.1) brightness(1.05)'
    context.drawImage(canvas, 0, 0)
  }

  /**
   * Utility functions
   */
  private getTargetElement(options: CaptureOptions): HTMLElement {
    if (options.element) return options.element
    
    switch (options.target) {
      case 'viewport':
        return document.documentElement
      case 'fullpage':
        return document.body
      default:
        return document.documentElement
    }
  }

  private optimizeClonedDocument(doc: Document, options: CaptureOptions): void {
    // Remove excluded elements
    options.excludeElements?.forEach(selector => {
      const elements = doc.querySelectorAll(selector)
      elements.forEach(el => el.remove())
    })
    
    // Add performance optimizations
    const style = doc.createElement('style')
    style.innerHTML = `
      * { 
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
        font-rendering: optimizeLegibility !important;
        text-rendering: optimizeLegibility !important;
      }
      img { image-rendering: -webkit-optimize-contrast !important; }
    `
    doc.head.appendChild(style)
  }

  private optimizeElementForCapture(element: HTMLElement, options: CaptureOptions): void {
    // Remove excluded child elements
    options.excludeElements?.forEach(selector => {
      const elements = element.querySelectorAll(selector)
      elements.forEach(el => el.remove())
    })
    
    // Optimize styles for capture
    element.style.fontSmooth = 'always'
    element.style.webkitFontSmoothing = 'antialiased'
  }

  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    for (const word of words) {
      const testLine = currentLine + word + ' '
      const metrics = this.context.measureText(testLine)
      
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine.trim())
        currentLine = word + ' '
      } else {
        currentLine = testLine
      }
    }
    
    if (currentLine.trim() !== '') {
      lines.push(currentLine.trim())
    }

    return lines
  }

  private calculateFileSize(dataUrl: string): number {
    // Estimate file size from data URL
    const base64 = dataUrl.split(',')[1]
    return Math.round((base64.length * 3) / 4)
  }

  private isExtensionContext(): boolean {
    return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id
  }

  private generateCacheKey(options: CaptureOptions): string {
    return JSON.stringify({
      target: options.target,
      element: options.element?.id || options.element?.className,
      quality: options.quality,
      format: options.format,
      scale: options.scale
    })
  }

  private async queueCapture(options: CaptureOptions): Promise<CaptureResult> {
    return new Promise((resolve) => {
      this.captureQueue.push(() => this.capture(options))
      this.processQueue()
    })
  }

  private async processQueue(): Promise<void> {
    if (this.captureQueue.length > 0 && !this.isCapturing) {
      const nextCapture = this.captureQueue.shift()
      if (nextCapture) {
        await nextCapture()
      }
    }
  }

  private updatePerformanceMetrics(captureTime: number): void {
    this.performance.totalCaptures++
    this.performance.averageTime = 
      (this.performance.averageTime * (this.performance.totalCaptures - 1) + captureTime) / 
      this.performance.totalCaptures
    this.performance.lastCaptureTime = captureTime
  }

  private createErrorResult(error: Error, processingTime: number): CaptureResult {
    return {
      dataUrl: '',
      metadata: {
        width: 0,
        height: 0,
        format: 'png',
        quality: 0,
        timestamp: Date.now(),
        captureMethod: 'error',
        fileSize: 0,
        devicePixelRatio: window.devicePixelRatio || 1
      },
      performance: {
        captureTime: processingTime,
        processingTime: 0,
        totalTime: processingTime,
        optimizationApplied: []
      },
      success: false,
      error: error.message
    }
  }

  /**
   * Public utility methods
   */
  public clearCache(): void {
    this.cache.clear()
    console.log('🌿 Screenshot cache cleared')
  }

  public getPerformanceStats(): typeof this.performance {
    return { ...this.performance }
  }

  public getBrowserCapabilities(): {
    displayMedia: boolean
    offscreenCanvas: boolean
    imageCapture: boolean
    webGL: boolean
  } {
    return {
      displayMedia: this.supportsDisplayMedia,
      offscreenCanvas: this.supportsOffscreenCanvas,
      imageCapture: this.supportsImageCapture,
      webGL: this.supportsWebGL
    }
  }

  /**
   * Load external libraries dynamically
   */
  public async loadLibrary(library: 'html2canvas' | 'dom-to-image'): Promise<boolean> {
    try {
      const scripts = {
        'html2canvas': 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
        'dom-to-image': 'https://cdnjs.cloudflare.com/ajax/libs/dom-to-image/2.6.0/dom-to-image.min.js'
      }
      
      const script = document.createElement('script')
      script.src = scripts[library]
      script.async = true
      
      return new Promise((resolve) => {
        script.onload = () => {
          console.log(`🌿 ${library} loaded successfully`)
          resolve(true)
        }
        script.onerror = () => {
          console.error(`🌿 Failed to load ${library}`)
          resolve(false)
        }
        document.head.appendChild(script)
      })
      
    } catch (error) {
      console.error(`🌿 Error loading ${library}:`, error)
      return false
    }
  }
}