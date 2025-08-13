import { useCallback, type Dispatch, type SetStateAction } from 'react';
import { loadGame, deleteSave, saveGame } from '../../engine/persistence.js';
import { defaultState } from '../defaultState.js';
import { prepareLoadedState } from '../prepareLoadedState.ts';
import type { GameState } from '../useGame.tsx';

export interface PersistenceActions {
  retryLoad: () => void;
  resetGame: () => void;
}

export default function usePersistenceActions(
  setState: Dispatch<SetStateAction<GameState>>,
  setLoadError: (err: boolean) => void,
): PersistenceActions {
  const retryLoad = useCallback(() => {
    const { state: loaded, error } = loadGame();
    if (error) {
      setLoadError(true);
      return;
    }
    setLoadError(false);
    if (loaded) {
      setState(prepareLoadedState(loaded));
    }
  }, [setState, setLoadError]);

  const resetGame = useCallback(() => {
    if (window.confirm('Reset colony? This will wipe your save.')) {
      deleteSave();
      const fresh = { ...defaultState, lastSaved: Date.now() };
      setState(fresh);
      saveGame(fresh);
      setLoadError(false);
    }
  }, [setState, setLoadError]);

  return { retryLoad, resetGame };
}
