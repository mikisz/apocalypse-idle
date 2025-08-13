import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BuildingRow from './BuildingRow.jsx';
import { BUILDING_MAP } from '../data/buildings.js';
import { GameContext } from '../state/useGame.ts';
import { defaultState } from '../state/defaultState.js';

describe('BuildingRow', () => {
  it('shows capacity increase for storage buildings', () => {
    const ctx = {
      state: defaultState,
      setState: vi.fn(),
      setActiveTab: vi.fn(),
      toggleDrawer: vi.fn(),
      setSettlerRole: vi.fn(),
      beginResearch: vi.fn(),
      abortResearch: vi.fn(),
      dismissOfflineModal: vi.fn(),
      resetGame: vi.fn(),
      loadError: false,
      retryLoad: vi.fn(),
    };

    render(
      <GameContext.Provider value={ctx}>
        <BuildingRow
          building={BUILDING_MAP.foodStorage}
          completedResearch={[]}
        />
      </GameContext.Provider>,
    );

    expect(screen.getByText('Increase:')).toBeTruthy();
    expect(screen.getByText(/🍖 \+150 Meat capacity/)).toBeTruthy();
    expect(screen.getByText(/🥔 \+300 Potatoes capacity/)).toBeTruthy();
  });
});

