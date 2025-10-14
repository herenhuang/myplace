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

    // Detect mobile
    const isMobile = () => window.innerWidth < 768

    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (!parent) return

      const mobile = isMobile()

      // On mobile, use lower resolution to reduce GPU load
      // This helps blur render correctly
      if (mobile) {
        canvas.width = parent.offsetWidth * 0.75
        canvas.height = parent.offsetHeight * 0.75
        // Scale canvas back up with CSS
        canvas.style.width = parent.offsetWidth + 'px'
        canvas.style.height = parent.offsetHeight + 'px'
      } else {
        canvas.width = parent.offsetWidth
        canvas.height = parent.offsetHeight
      }

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

      const mobile = isMobile()

      // On mobile: only 3 large blobs with reduced motion
      const blobCount = mobile ? 3 : 4
      const smallBlobCount = mobile ? 0 : 8

      // Create large blobs
      for (let i = 0; i < blobCount; i++) {
        const baseX = Math.random() * canvas.width
        const baseY = Math.random() * canvas.height

        newBlobs.push({
          baseX,
          baseY,
          x: baseX,
          y: baseY,
          radius: mobile ? Math.random() * 100 + 80 : Math.random() * 80 + 50, // Larger on mobile
          color: colors[i % colors.length],
          angle: Math.random() * Math.PI * 2,
          angleSpeed: mobile ? 0 : (Math.random() * 0.0004 + 0.0003) * (Math.random() > 0.5 ? 1 : -1), // No orbit on mobile
          orbitRadius: mobile ? 0 : Math.random() * 120 + 60, // No orbit on mobile
          speed: mobile ? Math.random() * 0.2 + 0.1 : Math.random() * 0.4 + .5, // Slower drift on mobile
        })
      }

      // Create small blobs (desktop only)
      for (let i = 0; i < smallBlobCount; i++) {
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

      // Reduce blur on mobile for better rendering
      const mobile = isMobile()
      ctx.filter = mobile ? 'blur(25px)' : 'blur(60px)'

      time += deltaSec

      blobs.forEach((blob, index) => {
        // Update angle for circular motion (radians per second)
        blob.angle += blob.angleSpeed * deltaSec

        // Create smooth floating motion using sine waves
        const driftRange = mobile ? blob.orbitRadius * 0.3 : blob.orbitRadius // Reduce drift on mobile
        const driftX = Math.sin(time * blob.speed + index) * driftRange
        const driftY = Math.cos(time * blob.speed * 0.8 + index) * driftRange

        // Circular orbit motion (disabled on mobile)
        const orbitX = Math.cos(blob.angle) * blob.orbitRadius * 0.5
        const orbitY = Math.sin(blob.angle) * blob.orbitRadius * 0.5

        blob.x = blob.baseX + driftX + orbitX
        blob.y = blob.baseY + driftY + orbitY

        // Slowly drift the base position (reduced on mobile)
        const baseDrift = mobile ? 5 : 20
        blob.baseX += Math.sin(time * 0.1 + index * 0.5) * baseDrift * deltaSec
        blob.baseY += Math.cos(time * 0.08 + index * 0.3) * baseDrift * deltaSec

        // Wrap
        if (blob.baseX < -blob.radius) blob.baseX = canvas.width + blob.radius
        if (blob.baseX > canvas.width + blob.radius) blob.baseX = -blob.radius
        if (blob.baseY < -blob.radius) blob.baseY = canvas.height + blob.radius
        if (blob.baseY > canvas.height + blob.radius) blob.baseY = -blob.radius

        // Draw blob as radial gradient for soft edges even without blur
        const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius)

        // Extract RGBA values from blob.color
        const colorMatch = blob.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/)
        if (colorMatch) {
          const [, r, g, b, a] = colorMatch
          const alpha = a || '1'

          // Gradient from full opacity center to transparent edge
          gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`)
          gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${parseFloat(alpha) * 0.6})`)
          gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
        } else {
          // Fallback to solid fill if color parsing fails
          gradient.addColorStop(0, blob.color)
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        }

        ctx.beginPath()
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2)
        ctx.fillStyle = gradient
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
        background: 'white',
        zIndex: 0,
        pointerEvents: 'none',
        willChange: 'transform', // Performance hint for mobile
        filter: 'blur(30px)', // CSS fallback blur if canvas blur fails
      }}
    />
  )
}
