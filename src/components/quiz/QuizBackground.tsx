'use client'

import { useRef, useEffect } from 'react'

interface Blob {
  x: number
  y: number
  baseX: number
  baseY: number
  radius: number
  color: string
  angle: number
  angleSpeed: number
  orbitRadius: number
  speed: number
}

export default function QuizBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let blobs: Blob[] = []
    let time = 0

    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (!parent) return
      
      canvas.width = parent.offsetWidth
      canvas.height = parent.offsetHeight
      
      // Recreate blobs on resize
      blobs = createBlobs()
    }

    const createBlobs = (): Blob[] => {
      const newBlobs: Blob[] = []
      const colors = [
        'rgba(255, 107, 53, 0.35)',   // Orange
        'rgba(255, 150, 100, 0.3)',   // Light Orange
        'rgba(255, 180, 130, 0.28)',  // Peach
        'rgba(255, 200, 160, 0.25)',  // Light Peach
        'rgba(255, 220, 190, 0.22)',  // Very Light Peach
        'rgba(255, 140, 80, 0.3)',    // Medium Orange
      ]

      // Create 4 large blobs
      for (let i = 0; i < 4; i++) {
        const baseX = Math.random() * canvas.width
        const baseY = Math.random() * canvas.height
        
        newBlobs.push({
          baseX,
          baseY,
          x: baseX,
          y: baseY,
          radius: Math.random() * 80 + 50, // 100-180px radius
          color: colors[i % colors.length],
          angle: Math.random() * Math.PI * 2,
          angleSpeed: (Math.random() * 0.0004 + 0.0003) * (Math.random() > 0.5 ? 1 : -1), // Slow rotation
          orbitRadius: Math.random() * 120 + 60, // Larger circular movement 60-180
          speed: Math.random() * 0.4 + .5, // Drift speed
        })
      }

      // Create 8 small blobs
      for (let i = 0; i < 8; i++) {
        const baseX = Math.random() * canvas.width
        const baseY = Math.random() * canvas.height
        
        newBlobs.push({
          baseX,
          baseY,
          x: baseX,
          y: baseY,
          radius: Math.random() * 30 + 20, // 20-50px radius
          color: colors[(i + 2) % colors.length],
          angle: Math.random() * Math.PI * 2,
          angleSpeed: (Math.random() * 0.0007 + 0.0004) * (Math.random() > 0.5 ? 1 : -1), // Faster rotation
          orbitRadius: Math.random() * 80 + 100, // Larger orbit 40-120
          speed: Math.random() * 0.6 + 0.4, // Faster drift
        })
      }

      return newBlobs
    }

    let lastTimestamp = 0

    const drawBlobs = (timestamp: number) => {
      const deltaSec = (timestamp - lastTimestamp) / 1000 || 0
      lastTimestamp = timestamp

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.filter = 'blur(60px)'

      time += deltaSec

      blobs.forEach((blob, index) => {
        // Update angle for circular motion (radians per second)
        blob.angle += blob.angleSpeed * deltaSec

        // Create smooth floating motion using sine waves
        const driftX = Math.sin(time * blob.speed + index) * blob.orbitRadius
        const driftY = Math.cos(time * blob.speed * 0.8 + index) * blob.orbitRadius

        // Circular orbit motion
        const orbitX = Math.cos(blob.angle) * blob.orbitRadius * 0.5
        const orbitY = Math.sin(blob.angle) * blob.orbitRadius * 0.5

        blob.x = blob.baseX + driftX + orbitX
        blob.y = blob.baseY + driftY + orbitY

        // Slowly drift the base position
        blob.baseX += Math.sin(time * 0.1 + index * 0.5) * 20 * deltaSec
        blob.baseY += Math.cos(time * 0.08 + index * 0.3) * 20 * deltaSec

        // Wrap
        if (blob.baseX < -blob.radius) blob.baseX = canvas.width + blob.radius
        if (blob.baseX > canvas.width + blob.radius) blob.baseX = -blob.radius
        if (blob.baseY < -blob.radius) blob.baseY = canvas.height + blob.radius
        if (blob.baseY > canvas.height + blob.radius) blob.baseY = -blob.radius

        ctx.beginPath()
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2)
        ctx.fillStyle = blob.color
        ctx.fill()
        ctx.closePath()
      })

      ctx.restore()
      animationFrameId = requestAnimationFrame(drawBlobs)
    }

    const handleResize = () => {
      resizeCanvas()
    }

    // Initialize
    resizeCanvas()
    lastTimestamp = performance.now()
    animationFrameId = requestAnimationFrame(drawBlobs)

    // Add resize listener
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
