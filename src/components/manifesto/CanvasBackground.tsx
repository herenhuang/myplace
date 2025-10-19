'use client';

import React, { useRef, useEffect } from 'react';

interface Shape {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  color: string;
  pathData: string;
  rotation: number;
  rotationSpeed: number;
}

// SVG path data from image-mask.tsx clipPaths
const SVG_PATHS = [
  'M0.71161 0H0V1H0.0362048C0.236734 1 0.42296 0.940031 0.577199 0.837408H0.74407V0.718826H0.888889V0.5H1V0.0562347V0H0.71161Z',
  'M0.00124689 0H1V0.665217V0.88913V0.890217C1 0.950849 0.943617 1 0.874065 1C0.804513 1 0.74813 0.950849 0.74813 0.890217V0.890761C0.74813 0.951092 0.692026 1 0.622818 1C0.559929 1 0.50786 0.959615 0.498877 0.906971C0.490714 0.959506 0.439061 1 0.376559 1C0.311952 1 0.258938 0.956733 0.253565 0.901625C0.246444 0.956975 0.192577 1 0.127182 1C0.0569414 1 0 0.950362 0 0.88913V0.666304C0 0.661014 0.00042501 0.655811 0.00124689 0.650718V0Z',
  'M0.827825 0.233206C0.928457 0.262983 1 0.338976 1 0.428023V0.964491C1 0.984102 0.979649 1 0.954545 1H0.0454546C0.0203507 1 0 0.984102 0 0.964491V0.428023C0 0.338976 0.0715426 0.262983 0.172175 0.233206C0.187663 0.102409 0.328522 0 0.5 0C0.671478 0 0.812337 0.102409 0.827825 0.233206Z',
  'M1 1H0.293592V0.868235H0V0.412941C0.0268256 0.241176 0.256754 0.0822454 0.500745 0C0.788326 0.098025 0.962742 0.26 0.99851 0.409412L1 1Z',
  'M0.997417 0.541807C1.02854 0.316235 0.773628 -0.00919936 0.492039 0.000199072C0.249199 0.00830422 0 0.217547 0 0.539457C0.0251948 0.836695 0.248984 1 0.492039 1C0.745469 1 0.982596 0.83787 0.997417 0.541807Z',
  'M0.00886287 0.313679C0.0269396 0.216981 0.172073 0 0.502947 0C0.798211 0 0.962906 0.196934 0.992581 0.318396C1.02374 0.511792 0.937683 0.525943 0.921363 0.625C0.921363 0.716981 1 0.746462 1 0.833726C0.988294 0.89801 0.974952 0.93728 0.949553 1H0.0504066C0.0237622 0.936348 0.00886178 0.908019 0.00292682 0.834906C-0.0104279 0.748821 0.0726626 0.735849 0.0771149 0.625C0.0696933 0.525943 -0.0297155 0.520047 0.00886287 0.313679Z',
  'M0 1H0.152466C0.185351 0.960002 0.327354 0.884713 0.505232 0.884713C0.683109 0.884713 0.818635 0.968237 0.849028 1H1V0.347104C0.985052 0.222406 0.838565 0.00477544 0.497758 6.98837e-05C0.156951 -0.00463567 0.0239163 0.229466 0 0.347104V1Z',
  'M0 0.578143V0H0.298507C0.725373 0.027027 0.958209 0.27027 1 0.518214V1H0.147761V0.694477H0.061194V0.578143H0Z',
  'M1 1H0V0.365648C0.0111437 0.322987 0.0446555 0.306894 0.110945 0.298564C0 0.231481 0.0794603 0.107906 0.22039 0.166751C0.157421 0.0690679 0.296852 -0.0156706 0.398801 0.0855445C0.407796 -0.0215584 0.578711 -0.0356796 0.604198 0.0867166C0.673163 -0.00154936 0.836582 0.0502345 0.782609 0.163217C0.890555 0.113787 1.01499 0.220886 0.887556 0.302092C0.957241 0.303259 0.983419 0.319478 1 0.365648V1Z',
];

const CanvasBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shapesRef = useRef<Shape[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to fill the viewport
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    // Color palette inspired by the design
    const colors = [
      'rgba(252, 165, 165, 1)', // red-300
      'rgba(253, 186, 116, 1)', // orange-300
      'rgba(252, 211, 77, 1)',  // yellow-300
      'rgba(134, 239, 172, 1)', // green-300
      'rgba(94, 234, 212, 1)',  // teal-300
      'rgba(147, 197, 253, 1)', // blue-300
      'rgba(196, 181, 253, 1)', // purple-300
      'rgba(244, 114, 182, 1)', // pink-300
    ];

    // Initialize shapes
    const initShapes = () => {
      shapesRef.current = Array.from({ length: 15 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2,
        size: Math.random() * 100 + 60,
        color: colors[Math.floor(Math.random() * colors.length)],
        pathData: SVG_PATHS[Math.floor(Math.random() * SVG_PATHS.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
      }));
    };
    initShapes();

    // Parse and draw SVG path from image-mask.tsx
    const drawSVGPath = (ctx: CanvasRenderingContext2D, shape: Shape) => {
      ctx.save();
      ctx.translate(shape.x, shape.y);
      ctx.rotate(shape.rotation);
      ctx.fillStyle = shape.color;
      
      // Use Path2D with the SVG path string directly
      const path = new Path2D(shape.pathData);
      
      // Scale and center the path
      // SVG paths use normalized coordinates (0-1), we need to:
      // 1. Scale to the shape size
      // 2. Translate to center (since paths are 0-1, center is at 0.5, 0.5)
      const scale = shape.size;
      ctx.translate(-scale * 0.5, -scale * 0.5);
      ctx.scale(scale, scale);
      
      ctx.fill(path);
      ctx.restore();
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      shapesRef.current.forEach((shape) => {
        drawSVGPath(ctx, shape);

        // Update position
        shape.x += shape.dx;
        shape.y += shape.dy;

        // Update rotation
        shape.rotation += shape.rotationSpeed;

        // Bounce off edges
        if (shape.x - shape.size < 0 || shape.x + shape.size > canvas.width) {
          shape.dx *= -1;
          shape.x = Math.max(shape.size, Math.min(canvas.width - shape.size, shape.x));
        }
        if (shape.y - shape.size < 0 || shape.y + shape.size > canvas.height) {
          shape.dy *= -1;
          shape.y = Math.max(shape.size, Math.min(canvas.height - shape.size, shape.y));
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      resizeCanvas();
      initShapes(); // Reinitialize shapes on resize
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
};

export default CanvasBackground;

