import { useEffect, useRef } from 'react';
import { RESEARCH_MAP } from '../../data/research.js';
import { useToast } from '../../components/ui/toast.tsx';
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
    prevRef.current = state;
  }, [state, toast]);
}
