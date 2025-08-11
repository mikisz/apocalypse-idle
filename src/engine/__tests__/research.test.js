import { describe, it, expect } from 'vitest';
import {
  startResearch,
  processResearchTick,
  cancelResearch,
} from '../research.js';
import { defaultState } from '../../state/defaultState.js';
import { getResearchOutputBonus } from '../../state/selectors.js';

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

describe('research engine', () => {
  it('starts and completes research', () => {
    const state = clone(defaultState);
    state.resources.science.amount = 50;
    let s = startResearch(state, 'industry1');
    expect(s.research.current.id).toBe('industry1');
    expect(s.resources.science.amount).toBe(10);
    s = processResearchTick(s, 60);
    expect(s.research.current).toBe(null);
    expect(s.research.completed).toContain('industry1');
  });

  it('cancels research with refund', () => {
    const state = clone(defaultState);
    state.resources.science.amount = 50;
    let s = startResearch(state, 'industry1');
    s = processResearchTick(s, 10);
    s = cancelResearch(s);
    expect(s.research.current).toBe(null);
    expect(s.research.progress['industry1']).toBe(0);
    expect(s.resources.science.amount).toBe(30); // 50 - 40 + 20
  });

  it('computes output bonuses from completed research', () => {
    const state = clone(defaultState);
    state.research.completed = ['woodworking1', 'woodworking2'];
    const bonus = getResearchOutputBonus(state, 'wood');
    expect(bonus).toBeCloseTo(0.1, 5);
  });
});
