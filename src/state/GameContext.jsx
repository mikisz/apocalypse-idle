import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GameContext } from './useGame.js'
import useGameLoop from '../engine/useGameLoop.js'
import { saveGame, loadGame, deleteSave } from '../engine/persistence.js'
import { processTick, applyOfflineProgress } from '../engine/production.js'
import { defaultState } from './defaultState.js'
import { getYear, initSeasons } from '../engine/time.js'

export function GameProvider({ children }) {
  const [state, setState] = useState(() => {
    const loaded = loadGame()
    if (loaded) {
      const gameTime =
        typeof loaded.gameTime === 'number'
          ? { seconds: loaded.gameTime }
          : loaded.gameTime || { seconds: 0 }
      const meta = { seasons: initSeasons() }
      const base = { ...loaded, gameTime, meta }
      const prevYear = gameTime.year || getYear(base)
      gameTime.year = prevYear
      const now = Date.now()
      const elapsed = Math.floor((now - (loaded.lastSaved || now)) / 1000)
      if (elapsed > 0) {
        const { state: progressed, gains } = applyOfflineProgress(base, elapsed)
        const secondsAfter = progressed.gameTime?.seconds || 0
        const yearAfter = getYear(progressed)
        let settlers = progressed.population.settlers
        if (yearAfter > prevYear) {
          const diff = yearAfter - prevYear
          settlers = settlers.map((s) => ({ ...s, age: s.age + diff }))
        }
        const show = Object.keys(gains).length > 0
        return {
          ...progressed,
          population: { ...progressed.population, settlers },
          gameTime: { seconds: secondsAfter, year: yearAfter },
          ui: {
            ...progressed.ui,
            offlineProgress: show ? { elapsed, gains } : null,
          },
          lastSaved: now,
        }
      }
      return {
        ...base,
        gameTime: { ...gameTime, year: prevYear },
        lastSaved: now,
      }
    }
    return { ...defaultState, lastSaved: Date.now() }
  })

  // Main game loop: increment time and produce resources
  useGameLoop((dt) => {
    setState((prev) => {
      const afterTick = processTick(prev, dt)
      const nextSeconds = (afterTick.gameTime?.seconds || 0) + dt
      const computedYear = getYear({
        ...afterTick,
        gameTime: { ...afterTick.gameTime, seconds: nextSeconds },
      })
      let year = afterTick.gameTime?.year || 1
      let settlers = afterTick.population.settlers
      if (computedYear > year) {
        const diff = computedYear - year
        year = computedYear
        settlers = settlers.map((s) => ({ ...s, age: s.age + diff }))
      }
      return {
        ...afterTick,
        population: { ...afterTick.population, settlers },
        gameTime: { seconds: nextSeconds, year },
      }
    })
  }, 1000)

  // Autosave interval and on unload
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    const save = () => {
      setState(() => saveGame(stateRef.current))
    }
    const id = setInterval(save, 10000)
    window.addEventListener('beforeunload', save)
    return () => {
      clearInterval(id)
      window.removeEventListener('beforeunload', save)
    }
  }, [])

  const setActiveTab = useCallback((tab) => {
    setState((prev) => ({ ...prev, ui: { ...prev.ui, activeTab: tab } }))
  }, [])

  const toggleDrawer = useCallback(() => {
    setState((prev) => ({ ...prev, ui: { ...prev.ui, drawerOpen: !prev.ui.drawerOpen } }))
  }, [])

  const setSettlerRole = useCallback((id, role) => {
    setState((prev) => {
      const settler = prev.population.settlers.find((s) => s.id === id)
      if (!settler) return prev
      const normalized = role === 'idle' ? null : role
      const settlers = prev.population.settlers.map((s) =>
        s.id === id ? { ...s, role: normalized } : s,
      )
      const entry = `${settler.firstName} ${settler.lastName} is now ${normalized}`
      const log = [entry, ...prev.log].slice(0, 100)
      return { ...prev, population: { ...prev.population, settlers }, log }
    })
  }, [])

  const dismissOfflineModal = useCallback(() => {
    setState((prev) => ({ ...prev, ui: { ...prev.ui, offlineProgress: null } }))
  }, [])

  const resetGame = useCallback(() => {
    if (window.confirm('Reset colony? This will wipe your save.')) {
      deleteSave()
      const fresh = { ...defaultState, lastSaved: Date.now() }
      setState(fresh)
      saveGame(fresh)
    }
  }, [])

  const value = useMemo(
    () => ({
      state,
      setActiveTab,
      toggleDrawer,
      setSettlerRole,
      setState,
      dismissOfflineModal,
      resetGame,
    }),
    [
      state,
      setActiveTab,
      toggleDrawer,
      setSettlerRole,
      dismissOfflineModal,
      resetGame,
    ],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

