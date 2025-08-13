import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BottomDock from './BottomDock.jsx';
import { GameContext } from '../state/useGame.tsx';

describe('BottomDock accessibility', () => {
  it('announces accessible labels for tabs', () => {
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
      expect(screen.getByRole('tab', { name })).toBeTruthy();
    });

    const baseTab = screen.getByRole('tab', { name: 'Base' });
    expect(baseTab.getAttribute('aria-selected')).toBe('true');

    const popTab = screen.getByRole('tab', { name: 'Population' });
    expect(popTab.getAttribute('aria-selected')).toBe('false');
  });
});
