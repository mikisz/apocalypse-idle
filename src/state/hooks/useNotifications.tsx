import { useEffect, useRef } from 'react';
import { RESEARCH_MAP } from '../../data/research.js';
import { RESOURCES } from '../../data/resources.js';
import { BUILDING_MAP } from '../../data/buildings.js';
import { useToast } from '../../components/ui/toast.tsx';
import { getCapacity } from '../selectors.js';
import type { GameState } from '../useGame.tsx';

export default function useNotifications(state: GameState): void {
  const prevRef = useRef<GameState>(state);
  const resourceNotified = useRef<Set<string>>(new Set());
  const powerNotified = useRef<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    const prev = prevRef.current;

    if (
      prev.research.current &&
      !state.research.current &&
      state.research.completed.includes(prev.research.current.id)
    ) {
      const id = prev.research.current.id;
      const name = RESEARCH_MAP[id]?.name || id;
      toast({ description: `${name} research complete` });
    }

    if (!prev.population.candidate && state.population.candidate) {
      toast({ description: 'New settler candidate available' });
    }

    const prevSettlers = prev.population.settlers;
    const alivePrev = new Set(
      prevSettlers.filter((s) => !s.isDead).map((s) => s.id),
    );
    state.population.settlers.forEach((s) => {
      if (s.isDead && alivePrev.has(s.id)) {
        const name = s.name ? `${s.name} has died` : 'A settler has died';
        toast({ description: name });
      }
    });

    Object.entries(state.buildings).forEach(([id, b]) => {
      const currReason = b?.offlineReason;
      const prevReason = prev.buildings?.[id]?.offlineReason;
      if (
        currReason === 'power' &&
        prevReason !== 'power' &&
        !powerNotified.current.has(id)
      ) {
        const name = BUILDING_MAP[id]?.name || id;
        toast({ description: `Power shortage: ${name} offline` });
        powerNotified.current.add(id);
      }
      if (currReason !== 'power') powerNotified.current.delete(id);
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
        toast({ description: `${name} storage full` });
        resourceNotified.current.add(id);
      }
      if (currAmt < cap) resourceNotified.current.delete(id);
    });

    prevRef.current = state;
  }, [state, toast]);
}
