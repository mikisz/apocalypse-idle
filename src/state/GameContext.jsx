import { useCallback, useEffect, useMemo, useState } from 'react'
import { GameContext } from './useGame.js'
import useGameLoop from '../engine/useGameLoop.js'
import { saveGame, loadGame } from '../engine/persistence.js'
import { makeRandomSettler } from '../data/names.js'

const defaultState = {
  gameTime: 0,
  ui: { activeTab: 'base', drawerOpen: false },
  resources: { scrap: 0, food: 0 },
  population: { settlers: [makeRandomSettler()] },
  buildings: {},
  log: [],
}

export function GameProvider({ children }) {
  const [state, setState] = useState(() => loadGame() || defaultState)

  // Main game loop: increment time every second
  useGameLoop(() => {
    setState((prev) => ({ ...prev, gameTime: prev.gameTime + 1 }))
  }, 1000)

  // Autosave
  useEffect(() => {
    const id = setInterval(() => saveGame(state), 10000)
    return () => clearInterval(id)
  }, [state])

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

  const value = useMemo(
    () => ({ state, setActiveTab, toggleDrawer, setSettlerRole, setState }),
    [state, setActiveTab, toggleDrawer, setSettlerRole],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

