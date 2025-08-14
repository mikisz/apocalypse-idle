import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import { RESEARCH_MAP } from '../../data/research.js';
import { RESOURCES } from '../../data/resources.js';
import { BUILDING_MAP } from '../../data/buildings.js';
import { SKILL_LABELS } from '../../data/roles.js';
import { useToast } from '../../components/ui/toast.tsx';
import { getCapacity } from '../selectors.js';
import type { GameState } from '../useGame.tsx';
import { createLogEntry } from '../../utils/log.js';

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
    setState((prev) => ({
      ...prev,
      log: [createLogEntry(text), ...(prev.log || [])].slice(0, 100),
    }));
  };

  useEffect(() => {
    const prev = prevRef.current;

    if (
      prev.research.current &&
      !state.research.current &&
      state.research.completed.includes(prev.research.current.id)
    ) {
      const id = prev.research.current.id;
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

    const prevSettlers = prev.population.settlers;
    const alivePrev = new Set(
      prevSettlers.filter((s) => !s.isDead).map((s) => s.id),
    );
    const prevSettlerMap = new Map(prevSettlers.map((s) => [s.id, s]));
    state.population.settlers.forEach((s) => {
      if (s.isDead && alivePrev.has(s.id)) {
        const name = s.name
          ? `${s.name} has died`
          : `${s.firstName || 'A'} ${s.lastName || 'settler'} has died`;
        toast({ description: name });
      } else {
        const prevS = prevSettlerMap.get(s.id);
        if (prevS) {
          Object.entries(s.skills || {}).forEach(([skill, entry]) => {
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
          });
        }
      }
    });

    Object.entries(state.buildings).forEach(([id, b]) => {
      const currReason = b?.offlineReason;
      const prevReason = prev.buildings?.[id]?.offlineReason;
      if (
        currReason === 'power' &&
        prevReason !== 'power' &&
        b?.isDesiredOn !== false &&
        !powerNotified.current.has(id)
      ) {
        const name = BUILDING_MAP[id]?.name || id;
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
        const name = BUILDING_MAP[id]?.name || id;
        const msg = `Resource shortage: ${name} offline`;
        toast({ description: msg });
        addLog(msg);
        resourceShortageNotified.current.add(id);
      }
      if (currReason !== 'power') powerNotified.current.delete(id);
      if (currReason !== 'resources')
        resourceShortageNotified.current.delete(id);
    });

    Object.entries(state.resources).forEach(([id, res]) => {
      const prevAmt = prev.resources?.[id]?.amount || 0;
      const currAmt = res.amount;
      const cap = getCapacity(state, id);
      if (
        prevAmt < cap &&
        currAmt >= cap &&
        !resourceNotified.current.has(id)
      ) {
        const name = RESOURCES[id]?.name || id;
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
