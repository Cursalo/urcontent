'use client'

/**
 * 🌿 Bonsai Mathematical Expression Recognition System
 * 
 * Advanced mathematical content recognition and analysis system
 * Combines computer vision, OCR, and AI to understand mathematical expressions
 */

export interface MathRecognitionResult {
  expressions: MathExpression[]
  variables: VariableInfo[]
  functions: FunctionInfo[]
  graphs: GraphAnalysis[]
  geometry: GeometryInfo[]
  confidence: number
  processingTime: number
}

export interface MathExpression {
  id: string
  latex: string
  plainText: string
  type: 'equation' | 'inequality' | 'expression' | 'function' | 'formula'
  complexity: 'simple' | 'moderate' | 'complex'
  domain: 'algebra' | 'geometry' | 'calculus' | 'statistics' | 'trigonometry'
  variables: string[]
  constants: number[]
  operations: Operation[]
  boundingBox: BoundingBox
  confidence: number
  solution?: SolutionStep[]
}

export interface VariableInfo {
  symbol: string
  type: 'unknown' | 'parameter' | 'constant'
  domain: 'real' | 'integer' | 'complex' | 'boolean'
  constraints: string[]
  occurrences: number
}

export interface FunctionInfo {
  name: string
  type: 'linear' | 'quadratic' | 'exponential' | 'logarithmic' | 'trigonometric' | 'polynomial'
  domain: string
  range: string
  properties: string[]
  graphable: boolean
}

export interface GraphAnalysis {
  type: 'function' | 'data' | 'statistical'
  axes: AxisInfo[]
  curves: CurveInfo[]
  points: Point[]
  annotations: Annotation[]
  scale: ScaleInfo
  gridLines: boolean
}

export interface GeometryInfo {
  shapes: GeometricShape[]
  measurements: Measurement[]
  relationships: GeometricRelationship[]
  theorems: string[]
  proofSteps: string[]
}

export interface Operation {
  type: 'arithmetic' | 'algebraic' | 'transcendental' | 'logical'
  operator: string
  precedence: number
  associativity: 'left' | 'right'
}

export interface SolutionStep {
  step: number
  operation: string
  expression: string
  explanation: string
  justification: string
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface AxisInfo {
  type: 'x' | 'y'
  label: string
  min: number
  max: number
  unit: string
  scale: 'linear' | 'logarithmic' | 'custom'
  tickMarks: number[]
}

export interface CurveInfo {
  type: 'line' | 'parabola' | 'circle' | 'ellipse' | 'hyperbola' | 'polynomial'
  equation: string
  points: Point[]
  properties: string[]
}

export interface Point {
  x: number
  y: number
  label?: string
  type: 'data' | 'intersection' | 'critical' | 'vertex'
}

export interface Annotation {
  text: string
  position: Point
  type: 'label' | 'measurement' | 'note'
}

export interface ScaleInfo {
  xScale: number
  yScale: number
  origin: Point
  gridSpacing: number
}

export interface GeometricShape {
  type: 'triangle' | 'rectangle' | 'circle' | 'polygon' | 'line' | 'ray' | 'segment'
  vertices: Point[]
  measurements: Measurement[]
  properties: string[]
  area?: number
  perimeter?: number
}

export interface Measurement {
  type: 'length' | 'angle' | 'area' | 'volume'
  value: number
  unit: string
  label: string
  precision: number
}

export interface GeometricRelationship {
  type: 'parallel' | 'perpendicular' | 'congruent' | 'similar' | 'inscribed' | 'tangent'
  elements: string[]
  description: string
}

export class BonsaiMathRecognizer {
  private mathJaxLoaded = false
  private latexPatterns: RegExp[]
  private mathSymbols: Map<string, string>
  private functionPatterns: Map<string, RegExp>

  constructor() {
    this.initializeMathRecognition()
  }

  private initializeMathRecognition(): void {
    // Common LaTeX patterns for recognition
    this.latexPatterns = [
      /\\frac\{([^}]+)\}\{([^}]+)\}/g,  // Fractions
      /\\sqrt(\[([^\]]+)\])?\{([^}]+)\}/g,  // Square roots and nth roots
      /\\int(_\{([^}]+)\})?(\^\{([^}]+)\})?\s*([^\\]+)\s*d([a-z])/g,  // Integrals
      /\\sum(_\{([^}]+)\})?(\^\{([^}]+)\})?/g,  // Summations
      /\\lim_\{([^}]+)\}/g,  // Limits
      /([a-z])\^(\{[^}]+\}|\d)/g,  // Exponents
      /([a-z])_(\{[^}]+\}|\d)/g,  // Subscripts
      /\\(sin|cos|tan|log|ln|exp)\s*\(?([^)]+)\)?/g,  // Functions
    ]

    // Mathematical symbols mapping
    this.mathSymbols = new Map([
      ['∞', '\\infty'],
      ['≤', '\\leq'],
      ['≥', '\\geq'],
      ['≠', '\\neq'],
      ['±', '\\pm'],
      ['×', '\\times'],
      ['÷', '\\div'],
      ['π', '\\pi'],
      ['θ', '\\theta'],
      ['α', '\\alpha'],
      ['β', '\\beta'],
      ['γ', '\\gamma'],
      ['δ', '\\delta'],
      ['λ', '\\lambda'],
      ['μ', '\\mu'],
      ['σ', '\\sigma'],
      ['Σ', '\\Sigma'],
      ['∫', '\\int'],
      ['∂', '\\partial'],
      ['∇', '\\nabla'],
      ['√', '\\sqrt'],
      ['∝', '\\propto'],
      ['∈', '\\in'],
      ['∉', '\\notin'],
      ['⊂', '\\subset'],
      ['⊆', '\\subseteq'],
      ['∪', '\\cup'],
      ['∩', '\\cap'],
      ['∅', '\\emptyset']
    ])

    // Function detection patterns
    this.functionPatterns = new Map([
      ['linear', /[+-]?\d*[a-z]\s*[+-]\s*\d+/],
      ['quadratic', /[+-]?\d*[a-z]\^?2\s*[+-]\s*\d*[a-z]\s*[+-]\s*\d+/],
      ['exponential', /\d*\s*\*?\s*\d+\^[a-z]|\d*\s*\*?\s*e\^[a-z]/],
      ['logarithmic', /(log|ln)\s*\(?[a-z]/],
      ['trigonometric', /(sin|cos|tan|sec|csc|cot)\s*\(?[a-z]/],
      ['polynomial', /[a-z]\^[3-9]|[a-z]\^\{[0-9]+\}/],
      ['rational', /\\frac\{[^}]*[a-z][^}]*\}\{[^}]*[a-z][^}]*\}/]
    ])

    this.loadMathJax()
  }

  /**
   * Load MathJax library for LaTeX rendering and processing
   */
  private async loadMathJax(): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      // Check if MathJax is already loaded
      if ('MathJax' in window) {
        this.mathJaxLoaded = true
        return
      }

      // Configure MathJax
      window.MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']],
          processEscapes: true,
          processEnvironments: true
        },
        options: {
          menuOptions: {
            settings: {
              assistiveMml: true
            }
          }
        },
        startup: {
          ready: () => {
            console.log('🌿 MathJax loaded successfully')
            this.mathJaxLoaded = true
          }
        }
      }

      // Load MathJax script
      const script = document.createElement('script')
      script.src = 'https://polyfill.io/v3/polyfill.min.js?features=es6'
      document.head.appendChild(script)

      const mathJaxScript = document.createElement('script')
      mathJaxScript.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js'
      mathJaxScript.async = true
      document.head.appendChild(mathJaxScript)

    } catch (error) {
      console.error('🌿 Failed to load MathJax:', error)
    }
  }

  /**
   * Main mathematical recognition function
   */
  async recognizeMathContent(
    imageData: string, 
    textContent?: string
  ): Promise<MathRecognitionResult> {
    const startTime = Date.now()

    try {
      // Extract mathematical expressions from text if provided
      const textExpressions = textContent ? this.extractMathFromText(textContent) : []
      
      // Analyze image for mathematical content
      const imageExpressions = await this.extractMathFromImage(imageData)
      
      // Combine and deduplicate expressions
      const allExpressions = [...textExpressions, ...imageExpressions]
      const uniqueExpressions = this.deduplicateExpressions(allExpressions)
      
      // Analyze variables, functions, and geometric content
      const variables = this.analyzeVariables(uniqueExpressions)
      const functions = this.analyzeFunctions(uniqueExpressions)
      const graphs = await this.analyzeGraphs(imageData)
      const geometry = await this.analyzeGeometry(imageData)
      
      // Calculate overall confidence
      const confidence = this.calculateOverallConfidence(
        uniqueExpressions, variables, functions, graphs, geometry
      )

      return {
        expressions: uniqueExpressions,
        variables,
        functions,
        graphs,
        geometry,
        confidence,
        processingTime: Date.now() - startTime
      }

    } catch (error) {
      console.error('🌿 Math recognition error:', error)
      return this.createEmptyResult(Date.now() - startTime)
    }
  }

  /**
   * Extract mathematical expressions from text content
   */
  private extractMathFromText(text: string): MathExpression[] {
    const expressions: MathExpression[] = []
    let expressionId = 0

    // Find LaTeX expressions
    this.latexPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern)
      for (const match of matches) {
        const latex = match[0]
        const plainText = this.latexToPlainText(latex)
        
        expressions.push({
          id: `text_${expressionId++}`,
          latex,
          plainText,
          type: this.classifyExpression(latex),
          complexity: this.assessComplexity(latex),
          domain: this.determineDomain(latex),
          variables: this.extractVariables(latex),
          constants: this.extractConstants(latex),
          operations: this.extractOperations(latex),
          boundingBox: { x: 0, y: 0, width: 0, height: 0 }, // Text position not available
          confidence: 0.85
        })
      }
    })

    // Find mathematical symbols and convert to LaTeX
    for (const [symbol, latex] of this.mathSymbols) {
      if (text.includes(symbol)) {
        expressions.push({
          id: `symbol_${expressionId++}`,
          latex,
          plainText: symbol,
          type: 'expression',
          complexity: 'simple',
          domain: this.determineDomain(latex),
          variables: [],
          constants: [],
          operations: [],
          boundingBox: { x: 0, y: 0, width: 0, height: 0 },
          confidence: 0.9
        })
      }
    }

    // Find inline mathematical expressions (numbers, variables, simple equations)
    const mathPattern = /(\d+(?:\.\d+)?|\b[a-z]\b|\d*[a-z]\^?\d*|\d+\s*[+\-×÷]\s*\d+)/gi
    const mathMatches = text.matchAll(mathPattern)
    
    for (const match of mathMatches) {
      const expression = match[0]
      if (expression.length > 1) { // Skip single characters unless they're variables
        expressions.push({
          id: `inline_${expressionId++}`,
          latex: this.textToLatex(expression),
          plainText: expression,
          type: 'expression',
          complexity: 'simple',
          domain: this.determineDomain(expression),
          variables: this.extractVariables(expression),
          constants: this.extractConstants(expression),
          operations: this.extractOperations(expression),
          boundingBox: { x: 0, y: 0, width: 0, height: 0 },
          confidence: 0.7
        })
      }
    }

    return expressions
  }

  /**
   * Extract mathematical expressions from image using AI vision
   */
  private async extractMathFromImage(imageData: string): Promise<MathExpression[]> {
    // This would integrate with the main vision engine
    // For now, return empty array - this should be called from the main vision system
    return []
  }

  /**
   * Convert LaTeX to plain text representation
   */
  private latexToPlainText(latex: string): string {
    let text = latex

    // Replace common LaTeX commands with plain text
    const replacements = [
      [/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)'],
      [/\\sqrt\{([^}]+)\}/g, 'sqrt($1)'],
      [/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, '$2^(1/$1)'],
      [/\\int/g, 'integral'],
      [/\\sum/g, 'sum'],
      [/\\lim/g, 'limit'],
      [/\\infty/g, 'infinity'],
      [/\\pi/g, 'pi'],
      [/\\theta/g, 'theta'],
      [/\\alpha/g, 'alpha'],
      [/\\beta/g, 'beta'],
      [/\\gamma/g, 'gamma'],
      [/\\delta/g, 'delta'],
      [/\\leq/g, '<='],
      [/\\geq/g, '>='],
      [/\\neq/g, '!='],
      [/\\times/g, '*'],
      [/\\div/g, '/'],
      [/\{([^}]+)\}/g, '$1'],
      [/\\_/g, '_'],
      [/\\\\/g, '']
    ]

    replacements.forEach(([pattern, replacement]) => {
      text = text.replace(pattern, replacement as string)
    })

    return text.trim()
  }

  /**
   * Convert plain text to LaTeX
   */
  private textToLatex(text: string): string {
    let latex = text

    // Convert common mathematical notation to LaTeX
    const conversions = [
      [/(\d+)\/(\d+)/g, '\\frac{$1}{$2}'],
      [/sqrt\(([^)]+)\)/g, '\\sqrt{$1}'],
      [/([a-z])\^(\d+)/g, '$1^{$2}'],
      [/([a-z])_(\d+)/g, '$1_{$2}'],
      [/infinity/g, '\\infty'],
      [/pi/g, '\\pi'],
      [/theta/g, '\\theta'],
      [/<=/g, '\\leq'],
      [/>=/g, '\\geq'],
      [/!=/g, '\\neq'],
      [/\*/g, '\\times']
    ]

    conversions.forEach(([pattern, replacement]) => {
      latex = latex.replace(pattern, replacement as string)
    })

    return latex
  }

  /**
   * Classify mathematical expression type
   */
  private classifyExpression(expression: string): MathExpression['type'] {
    if (expression.includes('=') && !expression.includes('≠')) return 'equation'
    if (expression.includes('<') || expression.includes('>') || expression.includes('≤') || expression.includes('≥')) return 'inequality'
    if (expression.includes('f(') || expression.includes('g(') || expression.includes('h(')) return 'function'
    if (expression.includes('∫') || expression.includes('∑') || expression.includes('lim')) return 'formula'
    return 'expression'
  }

  /**
   * Assess expression complexity
   */
  private assessComplexity(expression: string): MathExpression['complexity'] {
    let complexityScore = 0

    // Factor scoring
    if (expression.includes('frac') || expression.includes('/')) complexityScore += 1
    if (expression.includes('sqrt')) complexityScore += 1
    if (expression.includes('^') && expression.match(/\^[23456789]/)) complexityScore += 1
    if (expression.includes('^') && expression.match(/\^\{[0-9]+\}/)) complexityScore += 2
    if (expression.includes('int') || expression.includes('sum')) complexityScore += 3
    if (expression.includes('sin') || expression.includes('cos') || expression.includes('tan')) complexityScore += 1
    if (expression.includes('log') || expression.includes('ln')) complexityScore += 1
    if (expression.includes('lim')) complexityScore += 2

    if (complexityScore >= 4) return 'complex'
    if (complexityScore >= 2) return 'moderate'
    return 'simple'
  }

  /**
   * Determine mathematical domain
   */
  private determineDomain(expression: string): MathExpression['domain'] {
    if (expression.includes('sin') || expression.includes('cos') || expression.includes('tan')) return 'trigonometry'
    if (expression.includes('int') || expression.includes('diff') || expression.includes('lim')) return 'calculus'
    if (expression.includes('mean') || expression.includes('std') || expression.includes('var')) return 'statistics'
    if (expression.includes('angle') || expression.includes('triangle') || expression.includes('circle')) return 'geometry'
    return 'algebra'
  }

  /**
   * Extract variables from expression
   */
  private extractVariables(expression: string): string[] {
    const variables = new Set<string>()
    const variablePattern = /\b[a-z]\b/g
    const matches = expression.matchAll(variablePattern)
    
    for (const match of matches) {
      variables.add(match[0])
    }
    
    return Array.from(variables)
  }

  /**
   * Extract constants from expression
   */
  private extractConstants(expression: string): number[] {
    const constants = new Set<number>()
    const numberPattern = /\b\d+(?:\.\d+)?\b/g
    const matches = expression.matchAll(numberPattern)
    
    for (const match of matches) {
      constants.add(parseFloat(match[0]))
    }
    
    return Array.from(constants)
  }

  /**
   * Extract operations from expression
   */
  private extractOperations(expression: string): Operation[] {
    const operations: Operation[] = []
    
    const operatorPatterns = [
      { type: 'arithmetic', operators: ['+', '-', '*', '/', '^'], precedence: [1, 1, 2, 2, 3] },
      { type: 'algebraic', operators: ['sqrt', 'frac', 'pow'], precedence: [4, 4, 3] },
      { type: 'transcendental', operators: ['sin', 'cos', 'tan', 'log', 'ln', 'exp'], precedence: [5] },
      { type: 'logical', operators: ['=', '<', '>', '<=', '>=', '!='], precedence: [0] }
    ]

    operatorPatterns.forEach(({ type, operators, precedence }) => {
      operators.forEach((op, index) => {
        if (expression.includes(op)) {
          operations.push({
            type: type as Operation['type'],
            operator: op,
            precedence: precedence[index] || precedence[0],
            associativity: op === '^' ? 'right' : 'left'
          })
        }
      })
    })

    return operations
  }

  /**
   * Analyze variables in expressions
   */
  private analyzeVariables(expressions: MathExpression[]): VariableInfo[] {
    const variableMap = new Map<string, VariableInfo>()

    expressions.forEach(expr => {
      expr.variables.forEach(variable => {
        if (variableMap.has(variable)) {
          variableMap.get(variable)!.occurrences++
        } else {
          variableMap.set(variable, {
            symbol: variable,
            type: this.classifyVariable(variable, expr),
            domain: this.determineVariableDomain(variable, expr),
            constraints: this.findConstraints(variable, expressions),
            occurrences: 1
          })
        }
      })
    })

    return Array.from(variableMap.values())
  }

  private classifyVariable(variable: string, expression: MathExpression): VariableInfo['type'] {
    // Common constants
    const constants = ['e', 'π', 'i']
    if (constants.includes(variable)) return 'constant'
    
    // Parameters are often early alphabet letters in functions
    if (['a', 'b', 'c', 'd'].includes(variable) && expression.type === 'function') return 'parameter'
    
    return 'unknown'
  }

  private determineVariableDomain(variable: string, expression: MathExpression): VariableInfo['domain'] {
    if (expression.domain === 'geometry') return 'real'
    if (variable === 'i' || expression.plainText.includes('complex')) return 'complex'
    if (expression.plainText.includes('integer') || expression.plainText.includes('counting')) return 'integer'
    return 'real'
  }

  private findConstraints(variable: string, expressions: MathExpression[]): string[] {
    const constraints: string[] = []
    
    expressions.forEach(expr => {
      if (expr.variables.includes(variable)) {
        if (expr.type === 'inequality') {
          constraints.push(expr.plainText)
        }
        if (expr.plainText.includes('positive')) constraints.push('positive')
        if (expr.plainText.includes('negative')) constraints.push('negative')
        if (expr.plainText.includes('integer')) constraints.push('integer')
        if (expr.plainText.includes('real')) constraints.push('real')
      }
    })
    
    return [...new Set(constraints)]
  }

  /**
   * Analyze mathematical functions
   */
  private analyzeFunctions(expressions: MathExpression[]): FunctionInfo[] {
    const functions: FunctionInfo[] = []

    expressions.forEach(expr => {
      if (expr.type === 'function') {
        const functionType = this.identifyFunctionType(expr.plainText)
        functions.push({
          name: this.extractFunctionName(expr.plainText),
          type: functionType,
          domain: this.determineFunctionDomain(functionType),
          range: this.determineFunctionRange(functionType),
          properties: this.identifyFunctionProperties(expr.plainText, functionType),
          graphable: true
        })
      }
    })

    return functions
  }

  private identifyFunctionType(text: string): FunctionInfo['type'] {
    for (const [type, pattern] of this.functionPatterns) {
      if (pattern.test(text)) {
        return type as FunctionInfo['type']
      }
    }
    return 'polynomial'
  }

  private extractFunctionName(text: string): string {
    const match = text.match(/([fg]h?)\s*\(/)
    return match ? match[1] : 'f'
  }

  private determineFunctionDomain(type: FunctionInfo['type']): string {
    const domains = {
      linear: 'all real numbers',
      quadratic: 'all real numbers',
      exponential: 'all real numbers',
      logarithmic: 'positive real numbers',
      trigonometric: 'all real numbers',
      polynomial: 'all real numbers',
      rational: 'all real numbers except zeros of denominator'
    }
    return domains[type] || 'all real numbers'
  }

  private determineFunctionRange(type: FunctionInfo['type']): string {
    const ranges = {
      linear: 'all real numbers',
      quadratic: 'y ≥ k or y ≤ k',
      exponential: 'positive real numbers',
      logarithmic: 'all real numbers',
      trigonometric: '[-1, 1] for sin/cos',
      polynomial: 'depends on degree and leading coefficient',
      rational: 'depends on function'
    }
    return ranges[type] || 'depends on function'
  }

  private identifyFunctionProperties(text: string, type: FunctionInfo['type']): string[] {
    const properties: string[] = []
    
    if (type === 'linear') properties.push('constant rate of change')
    if (type === 'quadratic') properties.push('parabolic shape', 'vertex form')
    if (type === 'exponential') properties.push('exponential growth/decay')
    if (type === 'logarithmic') properties.push('inverse of exponential')
    if (type === 'trigonometric') properties.push('periodic', 'oscillating')
    
    if (text.includes('even')) properties.push('even function')
    if (text.includes('odd')) properties.push('odd function')
    if (text.includes('increasing')) properties.push('increasing')
    if (text.includes('decreasing')) properties.push('decreasing')
    
    return properties
  }

  /**
   * Analyze graphs in the image
   */
  private async analyzeGraphs(imageData: string): Promise<GraphAnalysis[]> {
    // This would use computer vision to detect and analyze graphs
    // Implementation would involve edge detection, line finding, etc.
    return []
  }

  /**
   * Analyze geometric content
   */
  private async analyzeGeometry(imageData: string): Promise<GeometryInfo[]> {
    // This would use computer vision to detect geometric shapes
    // Implementation would involve contour detection, shape classification, etc.
    return []
  }

  /**
   * Remove duplicate expressions
   */
  private deduplicateExpressions(expressions: MathExpression[]): MathExpression[] {
    const unique = new Map<string, MathExpression>()
    
    expressions.forEach(expr => {
      const key = expr.latex || expr.plainText
      if (!unique.has(key) || unique.get(key)!.confidence < expr.confidence) {
        unique.set(key, expr)
      }
    })
    
    return Array.from(unique.values())
  }

  /**
   * Calculate overall confidence score
   */
  private calculateOverallConfidence(
    expressions: MathExpression[],
    variables: VariableInfo[],
    functions: FunctionInfo[],
    graphs: GraphAnalysis[],
    geometry: GeometryInfo[]
  ): number {
    if (expressions.length === 0) return 0
    
    const expressionConfidence = expressions.reduce((sum, expr) => sum + expr.confidence, 0) / expressions.length
    const contentBonus = Math.min(0.1, (variables.length + functions.length + graphs.length + geometry.length) * 0.02)
    
    return Math.min(0.98, expressionConfidence + contentBonus)
  }

  /**
   * Create empty result for error cases
   */
  private createEmptyResult(processingTime: number): MathRecognitionResult {
    return {
      expressions: [],
      variables: [],
      functions: [],
      graphs: [],
      geometry: [],
      confidence: 0,
      processingTime
    }
  }

  /**
   * Render LaTeX expression to image
   */
  async renderLatexToImage(latex: string): Promise<string | null> {
    if (!this.mathJaxLoaded) {
      console.warn('🌿 MathJax not loaded, cannot render LaTeX')
      return null
    }

    try {
      // Create temporary element for rendering
      const tempDiv = document.createElement('div')
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.fontSize = '20px'
      tempDiv.innerHTML = `$$${latex}$$`
      
      document.body.appendChild(tempDiv)
      
      // @ts-ignore - MathJax global
      await window.MathJax.typesetPromise([tempDiv])
      
      // Convert to canvas
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')!
      
      // Set canvas size based on rendered content
      const rect = tempDiv.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      
      // Draw white background
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      
      // This is a simplified version - actual implementation would need
      // more sophisticated DOM-to-canvas conversion
      
      document.body.removeChild(tempDiv)
      
      return canvas.toDataURL('image/png')
      
    } catch (error) {
      console.error('🌿 Error rendering LaTeX:', error)
      return null
    }
  }

  /**
   * Get supported mathematical notation
   */
  getSupportedNotation(): { symbols: string[]; functions: string[]; operators: string[] } {
    return {
      symbols: Array.from(this.mathSymbols.keys()),
      functions: ['sin', 'cos', 'tan', 'log', 'ln', 'exp', 'sqrt', 'abs'],
      operators: ['+', '-', '*', '/', '^', '=', '<', '>', '≤', '≥', '≠', '±']
    }
  }
}