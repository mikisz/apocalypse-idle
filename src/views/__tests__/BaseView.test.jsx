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
});
