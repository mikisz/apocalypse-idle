import React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PopulationView from '../PopulationView.jsx';
import { GameContext } from '../../state/useGame.js';

describe('PopulationView', () => {
  test('shows idle settlers and propagates role changes', () => {
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
    const state = { population: { settlers: [settler] } };

    render(
      <GameContext.Provider value={{ state, setSettlerRole }}>
        <PopulationView />
      </GameContext.Provider>,
    );

    const select = screen.getByRole('combobox');
    expect(select.value).toBe('idle');

    fireEvent.change(select, { target: { value: 'farmer' } });
    expect(setSettlerRole).toHaveBeenCalledWith('s1', 'farmer');
  });
});
