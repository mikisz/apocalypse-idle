import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import BottomDock from './BottomDock.jsx'
import { GameContext } from '../state/useGame.js'

describe('BottomDock accessibility', () => {
  it('announces accessible labels for buttons', () => {
    const contextValue = {
      state: { ui: { activeTab: 'base' } },
      setActiveTab: vi.fn(),
    }
    render(
      <GameContext.Provider value={contextValue}>
        <BottomDock />
      </GameContext.Provider>,
    )

    const labels = ['Base', 'Population', 'Research', 'Expeditions']
    labels.forEach((name) => {
      expect(screen.getByRole('button', { name })).toBeTruthy()
    })
  })
})
