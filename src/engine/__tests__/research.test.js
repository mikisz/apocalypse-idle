import { describe, it, expect } from 'vitest';
import {
  startResearch,
  processResearchTick,
  cancelResearch,
} from '../research.js';
import { RESEARCH_MAP } from '../../data/research.js';
import { defaultState } from '../../state/defaultState.js';
import { getResearchOutputBonus } from '../../state/selectors.js';
import { computeRoleBonuses } from '../settlers.js';

function clone(obj) {
  return structuredClone(obj);
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

  it('scientists speed up research', () => {
    const state = clone(defaultState);
    state.resources.science.amount = 50;
    state.population.settlers = Array.from({ length: 4 }).map((_, i) => ({
      id: i,
      role: 'scientist',
      isDead: false,
      skills: { scientist: { level: 20 } },
    }));
    let s = startResearch(state, 'industry1');
    const bonuses = computeRoleBonuses(state.population.settlers);
    s = processResearchTick(s, 8, bonuses);
    expect(s.research.current).not.toBe(null);
    s = processResearchTick(s, 1, bonuses);
    expect(s.research.current).toBe(null);
  });

  it('unlocks radio after industry research', () => {
    const state = clone(defaultState);
    state.resources.science.amount = 200;
    let s = startResearch(state, 'industry1');
    s = processResearchTick(s, RESEARCH_MAP['industry1'].timeSec);
    s = startResearch(s, 'radio');
    expect(s.research.current.id).toBe('radio');
    s = processResearchTick(s, RESEARCH_MAP['radio'].timeSec);
    expect(s.research.completed).toContain('radio');
  });
});
