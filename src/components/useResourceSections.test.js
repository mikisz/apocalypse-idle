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
    expect(totalRow.capacity).toBe(450 + 150);
  });
});
