import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BuildingRow from './BuildingRow.jsx';

describe('BuildingRow', () => {
  it('shows cardTextOverride for food capacity', () => {
    const building = {
      name: 'Granary',
      description: 'Increases food storage.',
      capacityAdd: { FOOD: 225 },
      cardTextOverride: 'Food Capacity +225',
    };

    render(
      <BuildingRow
        building={building}
        costEntries={[]}
        perOutputs={[]}
        perInputs={[]}
        canAfford
        unlocked
        onBuild={() => {}}
        onDemolish={() => {}}
        onToggle={() => {}}
      />,
    );

    expect(screen.getByText('Increase:')).toBeTruthy();
    expect(screen.getByText('Food Capacity +225')).toBeTruthy();

  });
});
