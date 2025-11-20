"use client"

import { useEffect, useState, useRef } from "react"

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
  size: number
  color: string
}

interface AnimatedCountdownProps {
  seconds: number
  label: string
}

export function AnimatedCountdown({ seconds, label }: AnimatedCountdownProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [prevSeconds, setPrevSeconds] = useState(seconds)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particleIdRef = useRef(0)

  useEffect(() => {
    if (seconds !== prevSeconds) {
      const newParticles: Particle[] = []
      const particleCount = 20

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount
        const speed = 2 + Math.random() * 3
        newParticles.push({
          id: particleIdRef.current++,
          x: 0,
          y: 0,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          size: 3 + Math.random() * 4,
          color: `hsl(${270 + Math.random() * 30}, 70%, ${60 + Math.random() * 20}%)`,
        })
      }

      setParticles((prev) => [...prev, ...newParticles])
      setPrevSeconds(seconds)
    }
  }, [seconds, prevSeconds])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number

    const animate = () => {
      canvas.width = canvas.offsetWidth * 2
      canvas.height = canvas.offsetHeight * 2
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      setParticles((prev) => {
        const updated = prev
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vy: particle.vy + 0.1,
            life: particle.life - 0.02,
          }))
          .filter((p) => p.life > 0)

        updated.forEach((particle) => {
          ctx.save()
          ctx.globalAlpha = particle.life
          ctx.fillStyle = particle.color
          ctx.shadowBlur = 10
          ctx.shadowColor = particle.color
          ctx.beginPath()
          ctx.arc(centerX + particle.x, centerY + particle.y, particle.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        })

        return updated
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="relative inline-block">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ width: "100%", height: "100%" }}
      />
      <div className="relative">
        <div
          className="text-6xl md:text-7xl lg:text-8xl font-thin tabular-nums transition-all duration-300"
          style={{
            color: "#7851A9",
            animation: seconds <= 10 ? "pulse 1s ease-in-out infinite" : "none",
          }}
        >
          {seconds.toString().padStart(2, "0")}
        </div>
        <div
          className="text-xs md:text-sm uppercase tracking-widest font-light mt-2"
          style={{
            color: "#7851A9",
          }}
        >
          {label}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  )
}
