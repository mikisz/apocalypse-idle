import { useEffect, useRef } from 'react'

// Simple game loop using setInterval; dt in seconds
export default function useGameLoop(callback, intervalMs = 1000) {
  const lastRef = useRef(performance.now())

  useEffect(() => {
    const id = setInterval(() => {
      const now = performance.now()
      const dt = (now - lastRef.current) / 1000
      lastRef.current = now
      callback(dt)
    }, intervalMs)
    return () => clearInterval(id)
  }, [callback, intervalMs])
}
