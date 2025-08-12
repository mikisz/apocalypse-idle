import React from 'react';
import { describe, expect, test } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
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

  test('buildings appear under the correct category', () => {
    const gameState = {
      resources: {},
      buildings: {},
      research: { completed: [] },
      gameTime: { seconds: 0 },
      population: { settlers: [] },
      log: [],
    };

    render(
      <GameContext.Provider value={{ state: gameState, setState: () => {} }}>
        <BaseView />
      </GameContext.Provider>,
    );

    const woodSection = screen
      .getAllByText('Wood')
      .find((el) => el.closest('button'))
      .closest('div');
    expect(within(woodSection).getByText(/Logging Camp/)).toBeDefined();

    const scrapSection = screen
      .getAllByText('Scrap')
      .find((el) => el.closest('button'))
      .closest('div');
    expect(within(scrapSection).getByText(/Scrap Yard/)).toBeDefined();

    const stoneSection = screen
      .getAllByText('Stone')
      .find((el) => el.closest('button'))
      .closest('div');
    expect(within(stoneSection).getByText(/Quarry/)).toBeDefined();

    const materialsSection = screen
      .getAllByText('Construction Materials')
      .find((el) => el.closest('button'))
      .closest('div');
    expect(within(materialsSection).getByText(/Sawmill/)).toBeDefined();
    expect(within(materialsSection).getByText(/Metal Workshop/)).toBeDefined();
  });
});
