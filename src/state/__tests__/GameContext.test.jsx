import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameProvider } from '../GameContext.jsx';
import { useGame } from '../useGame.tsx';
import { loadGame } from '../../engine/persistence.js';

vi.mock('../../engine/persistence.js', () => ({
  saveGame: vi.fn((s) => s),
  loadGame: vi.fn(),
  deleteSave: vi.fn(),
  CURRENT_SAVE_VERSION: 6,
}));

vi.mock('../../engine/useGameLoop.tsx', () => ({
  default: vi.fn(),
}));

describe('GameProvider loading', () => {
  it('fills missing fields from defaults when loading partial save', () => {
    loadGame.mockReturnValue({
      resources: { wood: { amount: 10 } },
      buildings: {},
      population: {},
      lastSaved: Date.now(),
    });

    function Probe() {
      const { state } = useGame();
      return (
        <>
          <div data-testid="tab">{state.ui.activeTab}</div>
          <div data-testid="wood-discovered">
            {String(state.resources.wood.discovered)}
          </div>
          <div data-testid="stone-exists">
            {String(Boolean(state.resources.stone))}
          </div>
          <div data-testid="settlers">{state.population.settlers.length}</div>
        </>
      );
    }

    render(
      <GameProvider>
        <Probe />
      </GameProvider>,
    );

    expect(screen.getByTestId('tab').textContent).toBe('base');
    expect(screen.getByTestId('wood-discovered').textContent).toBe('false');
    expect(screen.getByTestId('stone-exists').textContent).toBe('true');
    expect(Number(screen.getByTestId('settlers').textContent)).toBeGreaterThan(
      0,
    );
  });
});
