import React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PopulationView from '../PopulationView.jsx';
import { GameContext } from '../../state/useGame.tsx';

// JSDOM doesn't implement scrollIntoView which Radix Select relies on
window.HTMLElement.prototype.scrollIntoView = () => {};

describe('PopulationView', () => {
  test('shows idle settlers and propagates role changes', async () => {
    const settler = {
      id: 's1',
      firstName: 'Test',
      lastName: 'Settler',
      sex: 'M',
      isDead: false,
      ageDays: 0,
      role: null,
      skills: {},
    };
    const setSettlerRole = vi.fn();
    const state = {
      population: { settlers: [settler] },
      buildings: { potatoField: { count: 1 } },
    };

    render(
      <GameContext.Provider value={{ state, setSettlerRole }}>
        <PopulationView />
      </GameContext.Provider>,
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger.textContent).toContain('Idle');

    // JSDOM doesn't implement pointer capture APIs used by Radix, so stub them
    // to allow the select to open during the test.
    fireEvent.click(trigger);
    const farmer = await screen.findByRole('option', { name: 'Farmer' });
    fireEvent.click(farmer);
    expect(setSettlerRole).toHaveBeenCalledWith('s1', 'farmer');
  });
});
