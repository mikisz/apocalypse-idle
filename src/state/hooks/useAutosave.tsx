import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import { saveGame } from '../../engine/persistence.ts';
import type { GameState } from '../useGame.tsx';

export default function useAutosave(
  state: GameState,
  setState: Dispatch<SetStateAction<GameState>>,
): void {
  const stateRef = useRef<GameState>(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const save = () => {
      setState(() => saveGame(stateRef.current) as unknown as GameState);
    };
    const id = setInterval(save, 10000);
    window.addEventListener('beforeunload', save);
    return () => {
      clearInterval(id);
      window.removeEventListener('beforeunload', save);
    };
  }, [setState]);
}
