import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GameContext } from './useGame.js'
import useGameLoop from '../engine/useGameLoop.js'
import { saveGame, loadGame, deleteSave } from '../engine/persistence.js'
import { processTick, applyOfflineProgress } from '../engine/production.js'
import { defaultState } from './defaultState.js'

export function GameProvider({ children }) {
  const [state, setState] = useState(() => {
    const loaded = loadGame()
    if (loaded) {
      const now = Date.now()
      const elapsed = Math.floor((now - (loaded.lastSaved || now)) / 1000)
      if (elapsed > 0) {
        const { state: progressed, gains } = applyOfflineProgress(loaded, elapsed)
        const show = Object.keys(gains).length > 0
        return {
          ...progressed,
          ui: {
            ...progressed.ui,
            offlineProgress: show ? { elapsed, gains } : null,
          },
          lastSaved: now,
        }
      }
      return { ...loaded, lastSaved: now }
    }
    return { ...defaultState, lastSaved: Date.now() }
  })

  // Main game loop: increment time and produce resources every second
  useGameLoop(() => {
    setState((prev) => {
      const afterTick = processTick(prev)
      return { ...afterTick, gameTime: afterTick.gameTime + 1 }
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
      const settlers = prev.population.settlers.map((s) =>
        s.id === id ? { ...s, role } : s,
      )
      const entry = `${settler.firstName} ${settler.lastName} is now ${role}`
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
    [state, setActiveTab, toggleDrawer, setSettlerRole, dismissOfflineModal, resetGame],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

