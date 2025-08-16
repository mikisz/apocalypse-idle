import { useMemo } from 'react';
import { RADIO_BASE_SECONDS } from '../data/settlement.js';
import {
  getResourceSections as getResourceSectionsSelector,
  getSettlerCapacity,
  getPowerStatus,
} from '../state/selectors.js';

export function useResourceSections(state) {
  const {
    resources,
    buildings,
    research,
    population,
    gameTime,
    foodPool,
    colony,
  } = state;

  const populationSettlers = population?.settlers;
  const populationCandidate = population?.candidate;
  const researchCompleted = research?.completed;

  const settlers = populationSettlers?.filter((s) => !s.isDead) || [];

  const resourceSections = useMemo(
    () =>
      getResourceSectionsSelector({
        resources,
        buildings,
        research: { completed: researchCompleted },
        population: {
          settlers: populationSettlers,
          candidate: populationCandidate,
        },
        gameTime,
        foodPool,
        colony,
      }),
    [
      resources,
      buildings,
      researchCompleted,
      populationSettlers,
      populationCandidate,
      gameTime,
      foodPool,
      colony,
    ],
  );

  const powerStatus = getPowerStatus(state);
  let powerMessage = 'charging';
  if (powerStatus.stored >= powerStatus.capacity) powerMessage = 'full';
  else if (powerStatus.stored <= 0) powerMessage = 'empty';
  else if (powerStatus.supply < powerStatus.demand)
    powerMessage = 'discharging';

  const totalSettlers = settlers.length;
  const capacity = getSettlerCapacity(state);
  const ratio = capacity > 0 ? totalSettlers / capacity : 2;
  let color = 'text-green-400';
  if (ratio > 1) color = 'text-red-500';
  else if (ratio > 0.8) color = 'text-yellow-400';
  const radioCount = buildings?.radio?.count || 0;
  const candidatePending = !!populationCandidate;
  const hasRadioResearch = (researchCompleted || []).includes('radio');
  const powered = (resources.power?.amount || 0) > 0;
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
      const timer = colony?.radioTimer ?? RADIO_BASE_SECONDS;
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
      let section = g;
      if (g.title === 'Energy') {
        section = {
          ...g,
          items: g.items.map((i) =>
            i.id === 'power'
              ? {
                  ...i,
                  supply: powerStatus.supply,
                  demand: powerStatus.demand,
                  stored: powerStatus.stored,
                  capacity: powerStatus.capacity,
                  status: powerMessage,
                }
              : i,
          ),
        };
      }
      rendered.push(section);
      if (hasRadioResearch && g.title === 'Science')
        rendered.push({ title: 'Settlers', settlers: true });
    });
    if (hasRadioResearch && !rendered.some((e) => e.title === 'Settlers'))
      rendered.push({ title: 'Settlers', settlers: true });
    rendered.push({ title: 'Happiness', happiness: true });
    return rendered;
  }, [resourceSections, hasRadioResearch, powerStatus, powerMessage]);

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

  const happinessBreakdown = colony?.happiness?.breakdown || [];
  const happinessInfo = {
    avg: Math.round(colony?.happiness?.value || 0),
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
