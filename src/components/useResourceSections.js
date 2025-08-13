import { useMemo } from 'react';
import { RADIO_BASE_SECONDS } from '../data/settlement.js';
import {
  getResourceSections as getResourceSectionsSelector,
  getSettlerCapacity,
} from '../state/selectors.js';

export function useResourceSections(state) {
  const settlers = state.population?.settlers?.filter((s) => !s.isDead) || [];

  const resourceSections = useMemo(
    () => getResourceSectionsSelector(state),
    [
      state.resources,
      state.buildings,
      state.research?.completed,
      state.population?.settlers,
      state.gameTime,
      state.foodPool,
    ],
  );

  const totalSettlers = settlers.length;
  const capacity = getSettlerCapacity(state);
  const ratio = capacity > 0 ? totalSettlers / capacity : 2;
  let color = 'text-green-400';
  if (ratio > 1) color = 'text-red-500';
  else if (ratio > 0.8) color = 'text-yellow-400';
  const radioCount = state.buildings?.radio?.count || 0;
  const candidatePending = !!state.population?.candidate;
  const hasRadioResearch = (state.research.completed || []).includes('radio');
  const powered = (state.resources.power?.amount || 0) > 0;
  let radioLine = hasRadioResearch
    ? 'Radio: not built'
    : 'Radio research not complete';
  let progress = 0;
  if (hasRadioResearch && radioCount > 0) {
    if (candidatePending) {
      radioLine = 'A settler is waiting for your decision';
    } else if (!powered) {
      radioLine = 'Radio: inactive (no power)';
    } else {
      const timer = state.colony?.radioTimer ?? RADIO_BASE_SECONDS;
      const mm = String(Math.floor(timer / 60)).padStart(2, '0');
      const ss = String(Math.floor(timer % 60)).padStart(2, '0');
      radioLine = `Next settler in: ${mm}:${ss}`;
      progress = Math.max(
        0,
        Math.min(1, (RADIO_BASE_SECONDS - timer) / RADIO_BASE_SECONDS),
      );
    }
  }

  const sections = useMemo(() => {
    const rendered = [];
    resourceSections.forEach((g) => {
      rendered.push(g);
      if (hasRadioResearch && g.title === 'Science')
        rendered.push({ title: 'Settlers', settlers: true });
    });
    if (hasRadioResearch && !rendered.some((e) => e.title === 'Settlers'))
      rendered.push({ title: 'Settlers', settlers: true });
    rendered.push({ title: 'Happiness', happiness: true });
    return rendered;
  }, [resourceSections, hasRadioResearch]);

  const settlersInfo = {
    total: totalSettlers,
    capacity,
    color,
    radioLine,
    progress,
    radioCount,
    candidatePending,
    powered,
  };

  const happinessBreakdown = state.colony?.happiness?.breakdown || [];
  const happinessInfo = {
    avg: Math.round(state.colony?.happiness?.value || 0),
    total: totalSettlers,
    capacity,
    breakdown: happinessBreakdown,
    overcrowding:
      happinessBreakdown.find((b) => b.label === 'Overcrowding')?.value || 0,
    foodVariety:
      happinessBreakdown.find((b) => b.label === 'Food variety')?.value || 0,
  };

  return { sections, settlersInfo, happinessInfo };
}
