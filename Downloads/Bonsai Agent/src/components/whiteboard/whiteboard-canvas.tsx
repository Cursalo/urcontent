'use client'

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Pen,
  Eraser,
  Square,
  Circle,
  Minus,
  Type,
  RotateCcw,
  Download,
  Palette,
} from 'lucide-react'

interface Point {
  x: number
  y: number
}

interface DrawingPath {
  points: Point[]
  color: string
  width: number
  tool: 'pen' | 'eraser'
}

interface Shape {
  type: 'rectangle' | 'circle' | 'line'
  start: Point
  end: Point
  color: string
  width: number
}

interface TextElement {
  text: string
  position: Point
  color: string
  fontSize: number
}

export interface WhiteboardRef {
  clear: () => void
  undo: () => void
  redo: () => void
  downloadImage: () => void
}

const WhiteboardCanvas = forwardRef<WhiteboardRef>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle' | 'line' | 'text'>('pen')
  const [currentColor, setCurrentColor] = useState('#000000')
  const [currentWidth, setCurrentWidth] = useState(2)
  const [paths, setPaths] = useState<DrawingPath[]>([])
  const [shapes, setShapes] = useState<Shape[]>([])
  const [textElements, setTextElements] = useState<TextElement[]>([])
  const [history, setHistory] = useState<{
    paths: DrawingPath[]
    shapes: Shape[]
    textElements: TextElement[]
  }[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [startPoint, setStartPoint] = useState<Point | null>(null)
  const [isShapeMode, setIsShapeMode] = useState(false)

  const colors = [
    '#000000', '#EF4444', '#3B82F6', '#10B981', 
    '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280'
  ]

  const widths = [1, 2, 4, 8]

  useImperativeHandle(ref, () => ({
    clear: clearCanvas,
    undo: undoAction,
    redo: redoAction,
    downloadImage: downloadCanvas,
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
        redrawCanvas()
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  const saveToHistory = () => {
    const newState = {
      paths: [...paths],
      shapes: [...shapes],
      textElements: [...textElements],
    }
    
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newState)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMousePos(e)
    
    if (currentTool === 'text') {
      const text = prompt('Enter text:')
      if (text) {
        const newTextElement: TextElement = {
          text,
          position: point,
          color: currentColor,
          fontSize: 16,
        }
        setTextElements(prev => [...prev, newTextElement])
        saveToHistory()
      }
      return
    }

    if (['rectangle', 'circle', 'line'].includes(currentTool)) {
      setStartPoint(point)
      setIsShapeMode(true)
      return
    }

    setIsDrawing(true)
    
    if (currentTool === 'pen' || currentTool === 'eraser') {
      const newPath: DrawingPath = {
        points: [point],
        color: currentTool === 'eraser' ? '#FFFFFF' : currentColor,
        width: currentWidth,
        tool: currentTool,
      }
      setPaths(prev => [...prev, newPath])
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && !isShapeMode) return
    
    const point = getMousePos(e)
    
    if (isShapeMode && startPoint) {
      redrawCanvas()
      drawPreviewShape(startPoint, point)
      return
    }

    if (isDrawing && (currentTool === 'pen' || currentTool === 'eraser')) {
      setPaths(prev => {
        const newPaths = [...prev]
        const currentPath = newPaths[newPaths.length - 1]
        currentPath.points.push(point)
        return newPaths
      })
      
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!ctx) return
      
      drawPath(ctx, paths[paths.length - 1])
    }
  }

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isShapeMode && startPoint) {
      const endPoint = getMousePos(e)
      const newShape: Shape = {
        type: currentTool as 'rectangle' | 'circle' | 'line',
        start: startPoint,
        end: endPoint,
        color: currentColor,
        width: currentWidth,
      }
      setShapes(prev => [...prev, newShape])
      setIsShapeMode(false)
      setStartPoint(null)
      saveToHistory()
      return
    }

    if (isDrawing) {
      setIsDrawing(false)
      saveToHistory()
    }
  }

  const drawPath = (ctx: CanvasRenderingContext2D, path: DrawingPath) => {
    if (path.points.length < 2) return
    
    ctx.strokeStyle = path.color
    ctx.lineWidth = path.width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    if (path.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
    } else {
      ctx.globalCompositeOperation = 'source-over'
    }
    
    ctx.beginPath()
    ctx.moveTo(path.points[0].x, path.points[0].y)
    
    for (let i = 1; i < path.points.length; i++) {
      ctx.lineTo(path.points[i].x, path.points[i].y)
    }
    
    ctx.stroke()
  }

  const drawShape = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.strokeStyle = shape.color
    ctx.lineWidth = shape.width
    ctx.globalCompositeOperation = 'source-over'
    
    ctx.beginPath()
    
    switch (shape.type) {
      case 'rectangle':
        const width = shape.end.x - shape.start.x
        const height = shape.end.y - shape.start.y
        ctx.rect(shape.start.x, shape.start.y, width, height)
        break
      case 'circle':
        const radius = Math.sqrt(
          Math.pow(shape.end.x - shape.start.x, 2) + 
          Math.pow(shape.end.y - shape.start.y, 2)
        )
        ctx.arc(shape.start.x, shape.start.y, radius, 0, 2 * Math.PI)
        break
      case 'line':
        ctx.moveTo(shape.start.x, shape.start.y)
        ctx.lineTo(shape.end.x, shape.end.y)
        break
    }
    
    ctx.stroke()
  }

  const drawText = (ctx: CanvasRenderingContext2D, textElement: TextElement) => {
    ctx.fillStyle = textElement.color
    ctx.font = `${textElement.fontSize}px Arial`
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillText(textElement.text, textElement.position.x, textElement.position.y)
  }

  const drawPreviewShape = (start: Point, end: Point) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return
    
    const previewShape: Shape = {
      type: currentTool as 'rectangle' | 'circle' | 'line',
      start,
      end,
      color: currentColor,
      width: currentWidth,
    }
    
    drawShape(ctx, previewShape)
  }

  const redrawCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Set white background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw all paths
    paths.forEach(path => drawPath(ctx, path))
    
    // Draw all shapes
    shapes.forEach(shape => drawShape(ctx, shape))
    
    // Draw all text
    textElements.forEach(text => drawText(ctx, text))
  }

  useEffect(() => {
    redrawCanvas()
  }, [paths, shapes, textElements])

  const clearCanvas = () => {
    setPaths([])
    setShapes([])
    setTextElements([])
    saveToHistory()
  }

  const undoAction = () => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1]
      setPaths(previousState.paths)
      setShapes(previousState.shapes)
      setTextElements(previousState.textElements)
      setHistoryIndex(historyIndex - 1)
    }
  }

  const redoAction = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setPaths(nextState.paths)
      setShapes(nextState.shapes)
      setTextElements(nextState.textElements)
      setHistoryIndex(historyIndex + 1)
    }
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const link = document.createElement('a')
    link.download = 'whiteboard.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Toolbar */}
      <div className="p-2 bg-white border-b border-gray-200 space-y-2">
        {/* Tools */}
        <div className="flex items-center space-x-1">
          <Button
            variant={currentTool === 'pen' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentTool('pen')}
          >
            <Pen className="h-4 w-4" />
          </Button>
          <Button
            variant={currentTool === 'eraser' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentTool('eraser')}
          >
            <Eraser className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button
            variant={currentTool === 'rectangle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentTool('rectangle')}
          >
            <Square className="h-4 w-4" />
          </Button>
          <Button
            variant={currentTool === 'circle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentTool('circle')}
          >
            <Circle className="h-4 w-4" />
          </Button>
          <Button
            variant={currentTool === 'line' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentTool('line')}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant={currentTool === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentTool('text')}
          >
            <Type className="h-4 w-4" />
          </Button>
        </div>

        {/* Colors */}
        <div className="flex items-center space-x-1">
          <Palette className="h-4 w-4 text-gray-500" />
          {colors.map(color => (
            <button
              key={color}
              onClick={() => setCurrentColor(color)}
              className={`w-6 h-6 rounded border-2 ${
                currentColor === color ? 'border-gray-900' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Brush Size */}
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-500">Size:</span>
          {widths.map(width => (
            <Button
              key={width}
              variant={currentWidth === width ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentWidth(width)}
              className="w-8 h-8 p-0"
            >
              <div
                className="rounded-full bg-current"
                style={{ width: width * 2, height: width * 2 }}
              />
            </Button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1">
          <Button variant="outline" size="sm" onClick={undoAction}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={downloadCanvas}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair bg-white"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  )
})

WhiteboardCanvas.displayName = 'WhiteboardCanvas'

export { WhiteboardCanvas }