import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BottomDock from './BottomDock.jsx';
import { GameContext } from '../state/useGame.ts';

describe('BottomDock accessibility', () => {
  it('announces accessible labels for buttons', () => {
    const contextValue = {
      state: { ui: { activeTab: 'base' } },
      setActiveTab: vi.fn(),
    };
    render(
      <GameContext.Provider value={contextValue}>
        <BottomDock />
      </GameContext.Provider>,
    );

    const labels = ['Base', 'Population', 'Research', 'Expeditions'];
    labels.forEach((name) => {
      expect(screen.getByRole('button', { name })).toBeTruthy();
    });

    const baseButton = screen.getByRole('button', { name: 'Base' });
    expect(baseButton.getAttribute('aria-current')).toBe('page');

    const popButton = screen.getByRole('button', { name: 'Population' });
    expect(popButton.hasAttribute('aria-current')).toBe(false);
  });
});
