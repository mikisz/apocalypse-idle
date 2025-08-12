import { useEffect, useRef } from 'react';

// Simple game loop using setInterval; dt in seconds
export default function useGameLoop(callback, intervalMs = 1000) {
  const lastRef = useRef(performance.now());
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const id = setInterval(() => {
      const now = performance.now();
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      callbackRef.current(dt);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}
