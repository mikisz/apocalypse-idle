import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import OfflineProgressModal from './OfflineProgressModal.jsx';
import { GameContext } from '../state/useGame.tsx';

describe('OfflineProgressModal', () => {
  it('renders research and candidate messages from offline progress', () => {
    const contextValue = {
      state: {
        ui: {
          offlineProgress: {
            elapsed: 60,
            gains: {},
            researchCompleted: ['Agriculture research complete'],
            candidateArrivals: ['Someone responded to the radio'],
          },
        },
      },
      dismissOfflineModal: () => {},
    };

    render(
      <GameContext.Provider value={contextValue}>
        <OfflineProgressModal />
      </GameContext.Provider>,
    );

    expect(
      screen.getByText('Agriculture research complete'),
    ).toBeTruthy();
    expect(
      screen.getByText('Someone responded to the radio'),
    ).toBeTruthy();
  });
});
