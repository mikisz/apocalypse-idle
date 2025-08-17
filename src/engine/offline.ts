import { RESOURCES } from '../data/resources.js';
import { RESEARCH_MAP } from '../data/research.js';
import { getResourceRates } from '../state/selectors.js';
import { updateRadio } from './radio.ts';
import { deepClone } from '../utils/clone.ts';
import { processSettlersTick } from './settlers.ts';
import { processTick } from './production.ts';
import { processResearchTick } from './research.ts';
import { createLogEntry } from '../utils/log.js';
import type { GameState, ResourceState } from '../state/useGame.tsx';
import type { RoleBonusMap } from './settlers.ts';
import type { TickEvent } from './gameTick.types.ts';

type ResourceId = keyof typeof RESOURCES;

export interface OfflineEvent extends TickEvent {
  type: 'research' | 'death' | 'candidate';
}

export interface OfflineResult {
  state: GameState;
  gains: Record<ResourceId, number>;
  events: OfflineEvent[];
}

export function applyOfflineProgress(
  state: GameState,
  elapsedSeconds: number,
  roleBonuses: RoleBonusMap = {},
  rng: () => number = Math.random,
): OfflineResult {
  if (elapsedSeconds <= 0)
    return { state, gains: {} as Record<ResourceId, number>, events: [] };
  const before = deepClone((state as any).resources) as Record<
    ResourceId,
    ResourceState
  >;
  const productionBonuses: RoleBonusMap = { ...roleBonuses };
  delete productionBonuses.farmer;
  let current = { ...(state as any) } as any;
  if (!current.research)
    current.research = { current: null, completed: [], progress: {} };
  const events: OfflineEvent[] = [];

  const CHUNK_SECONDS = 60;
  for (let remaining = elapsedSeconds; remaining > 0; ) {
    const dt = Math.min(CHUNK_SECONDS, remaining);
    remaining -= dt;

    current = processTick(current, dt, productionBonuses);
    const researchBefore = current.research?.current?.id;
    current = processResearchTick(current, dt, roleBonuses);
    if (
      researchBefore &&
      !current.research.current &&
      current.research.completed.includes(researchBefore)
    ) {
      const name = RESEARCH_MAP[researchBefore]?.name || researchBefore;
      const entry = createLogEntry(`${name} research complete`);
      current = {
        ...current,
        log: [entry, ...(current.log || [])].slice(0, 100),
      };
      events.push({ ...entry, type: 'research' });
    }
    if (dt > 0 && current.powerStatus) {
      current.powerStatus = {
        ...current.powerStatus,
        supply: current.powerStatus.supply / dt,
        demand: current.powerStatus.demand / dt,
      };
    }

    const rates = getResourceRates(current);
    let totalFoodProdBase = 0;
    for (const id of Object.keys(RESOURCES) as ResourceId[]) {
      if (RESOURCES[id].category === 'FOOD') {
        totalFoodProdBase += rates[id]?.perSec || 0;
      }
    }
    const bonusFoodPerSec = totalFoodProdBase * (roleBonuses['farmer'] || 0);

    const settlersResult = processSettlersTick(
      current,
      dt,
      bonusFoodPerSec,
      rng,
      roleBonuses,
    );
    current = settlersResult.state;
    if (settlersResult.events?.length)
      events.push(
        ...(settlersResult.events as TickEvent[]).map(
          (e: TickEvent): OfflineEvent => ({ ...e, type: 'death' }),
        ),
      );

    const prevCandidate = current.population?.candidate;
    const { candidate, radioTimer } = updateRadio(current, dt);
    let log = current.log || [];
    if (!prevCandidate && candidate) {
      const entry = createLogEntry('Someone responded to the radio');
      log = [entry, ...log].slice(0, 100);
      events.push({ ...entry, type: 'candidate' });
    }
    current = {
      ...current,
      population: { ...current.population, candidate },
      colony: { ...current.colony, radioTimer },
      log,
    };
  }

  for (const res of Object.keys(current.resources) as ResourceId[]) {
    if (current.resources[res].amount > 0)
      current.resources[res].discovered = true;
  }
  const gains = {} as Record<ResourceId, number>;
  for (const res of Object.keys(before) as ResourceId[]) {
    const gain =
      (current.resources[res]?.amount || 0) - (before[res]?.amount || 0);
    if (gain > 0) gains[res] = gain;
  }
  return {
    state: current as GameState,
    gains,
    events,
  };
}
