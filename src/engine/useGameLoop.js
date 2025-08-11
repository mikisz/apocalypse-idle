import { useEffect, useRef } from 'react'

// Prosta pętla gry na setInterval; dt w sekundach
export default function useGameLoop(callback, intervalMs = 250) {
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
