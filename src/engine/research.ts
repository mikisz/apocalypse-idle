import { RESEARCH_MAP } from '../data/research.js';
import { clampResource } from './resources.ts';
import { getCapacity, invalidateCapacityCache } from '../state/capacityCache.ts';

export function startResearch(state: any, id: string): any {
  const node = RESEARCH_MAP[id];
  if (!node) return state;
  if (state.research.current) return state;
  const cost = node.cost?.science || 0;
  const have = state.resources.science?.amount || 0;
  if (have < cost) return state;
  const resources = { ...state.resources };
  resources.science = { ...resources.science, amount: have - cost };
  const progress = { ...state.research.progress, [id]: 0 };
  return {
    ...state,
    resources,
    research: { ...state.research, current: { id }, progress },
  };
}

export function cancelResearch(state: any): any {
  const current = state.research.current;
  if (!current) return state;
  const node = RESEARCH_MAP[current.id];
  const refund = Math.floor((node.cost?.science || 0) * 0.5);
  const resources = { ...state.resources };
  const capacity = getCapacity(state, 'science');
  const entry = resources.science || { amount: 0, discovered: false };
  const nextAmt = clampResource(entry.amount + refund, capacity);
  resources.science = {
    ...entry,
    amount: nextAmt,
    discovered: entry.discovered || nextAmt > 0,
  };
  const progress = { ...state.research.progress, [current.id]: 0 };
  return {
    ...state,
    resources,
    research: { ...state.research, current: null, progress },
  };
}

export function processResearchTick(
  state: any,
  seconds: number = 1,
  roleBonuses: Record<string, number> = {},
): any {
  const current = state.research.current;
  if (!current) return state;
  const node = RESEARCH_MAP[current.id];
  const prev = state.research.progress[current.id] || 0;
  const bonus = roleBonuses['scientist'] || 0;
  const next = prev + seconds * (1 + bonus);
  const progress = { ...state.research.progress, [current.id]: next };
  if (next >= node.timeSec) {
    const completed = [...state.research.completed, current.id];
    let resources = { ...state.resources };
    if (node.unlocks?.resources) {
      node.unlocks.resources.forEach((resId) => {
        const entry = resources[resId] || {
          amount: 0,
          discovered: false,
          produced: 0,
        };
        resources[resId] = { ...entry, discovered: true };
      });
    }
    const nextState = {
      ...state,
      resources,
      research: { current: null, completed, progress },
    };
    const effects = Array.isArray(node.effects) ? node.effects : [node.effects];
    if (effects.some((e: any) => e.type === 'storage')) {
      invalidateCapacityCache();
    }
    return nextState;
  }
  return { ...state, research: { ...state.research, progress, current } };
}
