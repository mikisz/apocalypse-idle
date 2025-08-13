import { useEffect, useRef } from 'react';
import { RESEARCH_MAP } from '../../data/research.js';
import { RESOURCES } from '../../data/resources.js';
import { useToast } from '../../components/ui/toast.tsx';
import { getCapacity } from '../selectors.js';
import type { GameState } from '../useGame.tsx';

export default function useNotifications(state: GameState): void {
  const prevRef = useRef<GameState>(state);
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

    Object.entries(state.resources).forEach(([id, res]) => {
      const prevAmt = prev.resources?.[id]?.amount || 0;
      const currAmt = res.amount;
      const cap = getCapacity(state, id);
      if (prevAmt < cap && currAmt >= cap) {
        const name = RESOURCES[id]?.name || id;
        toast({ description: `${name} storage full` });
      }
    });
    prevRef.current = state;
  }, [state, toast]);
}
