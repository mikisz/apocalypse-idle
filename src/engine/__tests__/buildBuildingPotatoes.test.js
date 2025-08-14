import { describe, it, expect } from 'vitest';
import { buildBuilding } from '../production.js';

describe('buildBuilding', () => {
  it('does not consume potatoes for buildings without potato cost', () => {
    const state = {
      resources: {
        potatoes: { amount: 10, discovered: true },
        scrap: { amount: 20, discovered: true },
      },
      buildings: {},
    };
    const next = buildBuilding(state, 'loggingCamp');
    expect(next.resources.potatoes.amount).toBe(10);
  });
});
