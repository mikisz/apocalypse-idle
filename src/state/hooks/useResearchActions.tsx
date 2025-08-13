import { useCallback, type Dispatch, type SetStateAction } from 'react';
import { startResearch, cancelResearch } from '../../engine/research.js';
import type { GameState } from '../useGame.tsx';

export interface ResearchActions {
  beginResearch: (id: string) => void;
  abortResearch: () => void;
}

export default function useResearchActions(
  setState: Dispatch<SetStateAction<GameState>>,
): ResearchActions {
  const beginResearch = useCallback(
    (id: string) => {
      setState((prev: GameState) => startResearch(prev, id));
    },
    [setState],
  );

  const abortResearch = useCallback(() => {
    setState((prev: GameState) => cancelResearch(prev));
  }, [setState]);

  return { beginResearch, abortResearch };
}
