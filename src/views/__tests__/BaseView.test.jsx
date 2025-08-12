import React from 'react';
import { describe, expect, test } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BaseView from '../BaseView.jsx';
import { GameContext } from '../../state/useGame.js';

describe('BaseView', () => {
  test('build clamps negative resource amounts to zero', () => {
    let gameState = {
      resources: {
        wood: { amount: 100, discovered: true },
        potatoes: { amount: -5, discovered: true },
      },
      buildings: { potatoField: { count: 0 } },
      research: { completed: [] },
      gameTime: { seconds: 0 },
      population: { settlers: [] },
      log: [],
    };
    const setState = (fn) => {
      gameState = fn(gameState);
    };

    render(
      <GameContext.Provider value={{ state: gameState, setState }}>
        <BaseView />
      </GameContext.Provider>,
    );

    const buildButton = screen.getAllByRole('button', { name: 'Build' })[0];
    fireEvent.click(buildButton);

    expect(gameState.resources.potatoes.amount).toBe(0);
  });

  test('research-locked buildings are hidden until unlocked', () => {
    let gameState = {
      resources: {},
      buildings: {},
      research: { completed: [] },
      gameTime: { seconds: 0 },
      population: { settlers: [] },
      log: [],
    };
    const setState = (fn) => {
      gameState = fn(gameState);
    };

    const { rerender } = render(
      <GameContext.Provider value={{ state: gameState, setState }}>
        <BaseView />
      </GameContext.Provider>,
    );

    // Open Storage accordion in the buildings section
    const storageToggle = screen.getAllByRole('button', { name: /Storage/ })[1];
    fireEvent.click(storageToggle);

    expect(screen.queryByText(/Sawmill/)).toBeNull();
    expect(screen.queryByText(/Materials Depot/)).toBeNull();

    gameState = {
      ...gameState,
      research: { completed: ['industry1'] },
    };
    rerender(
      <GameContext.Provider value={{ state: gameState, setState }}>
        <BaseView />
      </GameContext.Provider>,
    );

    expect(screen.queryByText(/Sawmill/)).not.toBeNull();
    expect(screen.queryByText(/Materials Depot/)).not.toBeNull();
  });
});
