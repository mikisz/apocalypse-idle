import React, { useMemo, useState, useCallback } from 'react'
import { GameContext } from './useGame.js'
import useGameLoop from '../engine/useGameLoop.js'
import { tick } from '../engine/tick.js'
import { buildingDefs, isBuildingVisible } from '../engine/mechanics.js'

const defaultState = {
  resources: {
    scrap: { amount: 0, capacity: 100, discovered: true },
  },
  buildings: {
    scavengerHut: { count: 0 },
  },
  log: [],
}

export function GameProvider({ children }) {
  const [state, setState] = useState(defaultState)

  // Pętla gry
  useGameLoop((dt) => {
    setState((prev) => tick(prev, dt))
  }, 250)

  // Akcje
  const addResource = useCallback((resId, amount) => {
    setState((prev) => {
      const r = prev.resources[resId]
      if (!r) return prev
      const newAmount = Math.min(r.capacity, r.amount + amount)
      return {
        ...prev,
        resources: { ...prev.resources, [resId]: { ...r, amount: newAmount } },
      }
    })
  }, [])

  const canAfford = useCallback(
    (buildingId) => {
      const cost = buildingDefs[buildingId]?.cost || {}
      return Object.entries(cost).every(
        ([rid, need]) => (state.resources[rid]?.amount || 0) >= need,
      )
    },
    [state],
  )

  const buyBuilding = useCallback(
    (buildingId) => {
      const def = buildingDefs[buildingId]
      if (!def) return
      if (!canAfford(buildingId)) return

      setState((prev) => {
        const newResources = { ...prev.resources }
        for (const [rid, need] of Object.entries(def.cost)) {
          const r = newResources[rid]
          newResources[rid] = { ...r, amount: r.amount - need }
        }
        const current = prev.buildings[buildingId]?.count || 0
        const newBuildings = {
          ...prev.buildings,
          [buildingId]: { count: current + 1 },
        }
        return {
          ...prev,
          resources: newResources,
          buildings: newBuildings,
          log: [`Zbudowano: ${def.name}`, ...prev.log].slice(0, 50),
        }
      })
    },
    [canAfford],
  )

  const value = useMemo(
    () => ({
      state,
      addResource,
      buyBuilding,
      canAfford,
      isBuildingVisible: (bId) => isBuildingVisible(state, bId),
    }),
    [state, addResource, buyBuilding, canAfford],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
