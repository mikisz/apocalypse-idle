import { describe, expect, test } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useResourceSections } from './useResourceSections.js';

describe('useResourceSections', () => {
  test('sums capacities of all food resources', () => {
    const state = {
      resources: {
        potatoes: { amount: 100, discovered: true },
        meat: { amount: 50, discovered: true },
      },
      buildings: {},
      research: { completed: [] },
      population: { settlers: [] },
    };
    const { result } = renderHook((props) => useResourceSections(props), {
      initialProps: state,
    });
    const foodSection = result.current.sections.find((s) => s.title === 'Food');
    const totalRow = foodSection.items.find((i) => i.id === 'food-total');
    expect(totalRow.capacity).toBe(200 + 100); // changed: 450+150 -> 200+100
  });

  test('marks resources at capacity', () => {
    const state = {
      resources: {
        wood: { amount: 80, discovered: true },
      },
      buildings: {},
      research: { completed: [] },
      population: { settlers: [] },
    };
    const { result } = renderHook((props) => useResourceSections(props), {
      initialProps: state,
    });
    const rawSection = result.current.sections.find(
      (s) => s.title === 'Raw Materials',
    );
    const woodRow = rawSection.items.find((i) => i.id === 'wood');
    expect(woodRow.capped).toBe(true);
  });

  test('includes power status info', () => {
    const state = {
      resources: { power: { amount: 5, discovered: true } },
      powerStatus: { supply: 2, demand: 1, stored: 5, capacity: 10 },
      buildings: {},
      research: { completed: ['basicEnergy'] },
      population: { settlers: [] },
    };
    const { result } = renderHook((props) => useResourceSections(props), {
      initialProps: state,
    });
    const energySection = result.current.sections.find(
      (s) => s.title === 'Energy',
    );
    const powerRow = energySection.items.find((i) => i.id === 'power');
    expect(powerRow.supply).toBe(2);
    expect(powerRow.demand).toBe(1);
    expect(powerRow.stored).toBe(5);
    expect(powerRow.capacity).toBe(10);
    expect(powerRow.status).toBe('charging');
  });
});
