import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import { RESEARCH_MAP } from '../../data/research.js';
import { RESOURCES } from '../../data/resources.js';
import { BUILDING_MAP } from '../../data/buildings.js';
import { SKILL_LABELS } from '../../data/roles.js';
import { useToast } from '../../components/ui/toast.tsx';
import { getCapacity } from '../selectors.js';
import type { GameState, BuildingEntry, ResourceState } from '../useGame.tsx';
import type { Settler, SkillMap } from '../../engine/candidates.ts';
import { createLogEntry } from '../../utils/log.js';

type SettlerState = Settler & { name?: string };

export default function useNotifications(
  state: GameState,
  setState: Dispatch<SetStateAction<GameState>>,
): void {
  const prevRef = useRef<GameState>(state);
  const resourceNotified = useRef<Set<string>>(new Set());
  const powerNotified = useRef<Set<string>>(new Set());
  const resourceShortageNotified = useRef<Set<string>>(new Set());
  const { toast } = useToast();

  const addLog = (text: string): void => {
    setState(
      (prev: GameState): GameState => ({
        ...prev,
        log: [createLogEntry(text), ...(prev.log || [])].slice(
          0,
          100,
        ) as GameState['log'],
      }),
    );
  };

  useEffect(() => {
    const prev = prevRef.current;

    const prevResearchCurrent = prev.research.current as { id: string } | null;
    if (
      prevResearchCurrent &&
      !state.research.current &&
      (state.research.completed as string[]).includes(prevResearchCurrent.id)
    ) {
      const id = prevResearchCurrent.id;
      const name = RESEARCH_MAP[id]?.name || id;
      const msg = `${name} research complete`;
      toast({ description: msg });
      addLog(msg);
    }

    if (!prev.population.candidate && state.population.candidate) {
      const msg = 'New settler candidate available';
      toast({ description: msg });
      addLog(msg);
    }

    const prevSettlers = prev.population.settlers as SettlerState[];
    const alivePrev = new Set(
      prevSettlers.filter((s) => !s.isDead).map((s) => s.id),
    );
    const prevSettlerMap = new Map<string, SettlerState>(
      prevSettlers.map((s) => [s.id, s]),
    );
    state.population.settlers.forEach((s: SettlerState) => {
      if (s.isDead && alivePrev.has(s.id)) {
        const name = s.name
          ? `${s.name} has died`
          : `${s.firstName || 'A'} ${s.lastName || 'settler'} has died`;
        toast({ description: name });
      } else {
        const prevS = prevSettlerMap.get(s.id);
        if (prevS) {
          Object.entries((s.skills || {}) as SkillMap).forEach(
            ([skill, entry]: [string, SkillMap[string]]) => {
              const prevLvl = prevS.skills?.[skill]?.level || 0;
              if (entry.level > prevLvl) {
                const fullName = s.name
                  ? s.name
                  : `${s.firstName || ''} ${s.lastName || ''}`.trim() ||
                    'A settler';
                const skillName = SKILL_LABELS[skill] || skill;
                const msg = `${fullName} reached ${skillName} level ${entry.level}`;
                toast({ description: msg });
                addLog(msg);
              }
            },
          );
        }
      }
    });

    const buildings = state.buildings as Record<string, BuildingEntry>;
    const prevBuildings = prev.buildings as Record<string, BuildingEntry>;
    Object.entries(buildings).forEach(([id, b]: [string, BuildingEntry]) => {
      const currReason = b?.offlineReason;
      const prevReason = prevBuildings?.[id]?.offlineReason;
      if (
        currReason === 'power' &&
        prevReason !== 'power' &&
        b?.isDesiredOn !== false &&
        !powerNotified.current.has(id)
      ) {
        const name = (BUILDING_MAP as any)[id]?.name || id;
        const msg = `Power shortage: ${name} offline`;
        toast({ description: msg });
        addLog(msg);
        powerNotified.current.add(id);
      }
      if (
        currReason === 'resources' &&
        prevReason !== 'resources' &&
        b?.isDesiredOn !== false &&
        !resourceShortageNotified.current.has(id)
      ) {
        const name = (BUILDING_MAP as any)[id]?.name || id;
        const msg = `Resource shortage: ${name} offline`;
        toast({ description: msg });
        addLog(msg);
        resourceShortageNotified.current.add(id);
      }
      if (currReason !== 'power') powerNotified.current.delete(id);
      if (currReason !== 'resources')
        resourceShortageNotified.current.delete(id);
    });

    const resources = state.resources as Record<string, ResourceState>;
    const prevResources = prev.resources as Record<string, ResourceState>;
    Object.entries(resources).forEach(([id, res]: [string, ResourceState]) => {
      const prevAmt = prevResources?.[id]?.amount || 0;
      const currAmt = res.amount;
      const cap = getCapacity(state, id);
      if (
        prevAmt < cap &&
        currAmt >= cap &&
        !resourceNotified.current.has(id)
      ) {
        const name = (RESOURCES as any)[id]?.name || id;
        const msg = `${name} storage full`;
        toast({ description: msg });
        addLog(msg);
        resourceNotified.current.add(id);
      }
      if (currAmt < cap) resourceNotified.current.delete(id);
    });

    const prevHappy = prev.colony?.happiness?.value || 0;
    const currHappy = state.colony?.happiness?.value || 0;
    const normalize = (v: number): number => Math.round(v * 100) / 100;
    const prevHappyNormalized = normalize(prevHappy);
    const currHappyNormalized = normalize(currHappy);
    if (prevHappyNormalized >= 50 && currHappyNormalized < 50) {
      const msg = 'Happiness dropped below 50%';
      toast({ description: msg });
      addLog(msg);
    } else if (prevHappyNormalized < 50 && currHappyNormalized >= 50) {
      const msg = 'Happiness increased above 50%';
      toast({ description: msg });
      addLog(msg);
    }

    prevRef.current = state;
  }, [state, toast]);
}
