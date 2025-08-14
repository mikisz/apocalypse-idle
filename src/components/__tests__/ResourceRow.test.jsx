import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ResourceRow from '../ResourceRow.jsx';
import { processSettlersTick } from '../../engine/settlers.ts';
import { defaultState } from '../../state/defaultState.js';
import { deepClone } from '../../utils/clone.ts';
import { BALANCE } from '../../data/balance.js';

describe('ResourceRow', () => {
  it('shows capacity when amount is within epsilon of cap', () => {
    const createRng = (seed = 1) => () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const rng = createRng();
    const state = deepClone(defaultState);
    const cap = 200;
    state.resources.potatoes.amount = cap;
    state.foodPool = { amount: cap, capacity: cap };
    state.population.settlers = [{ id: 's1' }];
    const bonusPerSec = BALANCE.FOOD_CONSUMPTION_PER_SETTLER + 0.1;
    const { state: next } = processSettlersTick(state, 1, bonusPerSec, rng);
    render(
      <ResourceRow
        name="Potatoes"
        amount={next.resources.potatoes.amount}
        capacity={cap}
      />,
    );
    expect(screen.getByText('200 / 200')).toBeTruthy();
  });
});
