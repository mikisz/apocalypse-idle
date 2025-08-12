import { describe, it, expect, vi } from 'vitest';

const fakeCandidate = { id: 'cand1' };

vi.mock('../candidates.js', () => ({
  generateCandidate: vi.fn(() => fakeCandidate),
}));

import { updateRadio } from '../radio.js';
import { generateCandidate } from '../candidates.js';

const baseState = {
  buildings: { radio: { count: 1 } },
  resources: { power: { amount: 1 } },
  population: { candidate: null },
  colony: { radioTimer: 10 },
};

describe('updateRadio', () => {
  it('decrements timer without creating a candidate if time remains', () => {
    const state = { ...baseState, colony: { radioTimer: 10 } };
    const { candidate, radioTimer } = updateRadio(state, 3);
    expect(candidate).toBeNull();
    expect(radioTimer).toBe(7);
  });

  it('creates candidate and resets timer when countdown completes', () => {
    const state = { ...baseState, colony: { radioTimer: 2 } };
    const { candidate, radioTimer } = updateRadio(state, 5);
    expect(generateCandidate).toHaveBeenCalledOnce();
    expect(candidate).toEqual(fakeCandidate);
    expect(radioTimer).toBe(0);
  });
});
