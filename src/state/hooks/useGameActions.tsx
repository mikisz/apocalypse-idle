import { useCallback, type Dispatch, type SetStateAction } from 'react';
import { ROLE_BUILDINGS } from '../../data/roles.js';
import { createLogEntry } from '../../utils/log.js';
import { startResearch, cancelResearch } from '../../engine/research.js';
import { loadGame, deleteSave, saveGame } from '../../engine/persistence.js';
import { defaultState } from '../defaultState.js';
import { prepareLoadedState } from '../prepareLoadedState.ts';
import type { GameState } from '../useGame.tsx';

export interface GameActions {
  setActiveTab: (tab: string) => void;
  toggleDrawer: () => void;
  setSettlerRole: (id: string, role: string | null) => void;
  beginResearch: (id: string) => void;
  abortResearch: () => void;
  dismissOfflineModal: () => void;
  retryLoad: () => void;
  resetGame: () => void;
}

export default function useGameActions(
  setState: Dispatch<SetStateAction<GameState>>,
  setLoadError: (err: boolean) => void,
): GameActions {
  const setActiveTab = useCallback(
    (tab: string) => {
      setState((prev: GameState) => ({
        ...prev,
        ui: { ...prev.ui, activeTab: tab },
      }));
    },
    [setState],
  );

  const toggleDrawer = useCallback(() => {
    setState((prev: GameState) => ({
      ...prev,
      ui: { ...prev.ui, drawerOpen: !prev.ui.drawerOpen },
    }));
  }, [setState]);

  const setSettlerRole = useCallback(
    (id: string, role: string | null) => {
      setState((prev: GameState) => {
        const settler = prev.population.settlers.find((s) => s.id === id);
        if (!settler) return prev;
        const normalized = role === 'idle' ? null : role;
        if (normalized) {
          const building = ROLE_BUILDINGS[
            normalized as keyof typeof ROLE_BUILDINGS
          ] as keyof GameState['buildings'];
          const count = prev.buildings[building]?.count || 0;
          if (count <= 0) return prev;
        }
        const settlers = prev.population.settlers.map((s) =>
          s.id === id ? { ...s, role: normalized } : s,
        ) as GameState['population']['settlers'];
        const roleName = normalized ?? 'idle';
        const entry = createLogEntry(
          `${settler.firstName} ${settler.lastName} is now ${roleName}`,
        );
        const log = [entry, ...prev.log].slice(0, 100);
        return {
          ...prev,
          population: { ...prev.population, settlers },
          log,
        } as GameState;
      });
    },
    [setState],
  );

  const beginResearch = useCallback(
    (id: string) => {
      setState((prev: GameState) => startResearch(prev, id));
    },
    [setState],
  );

  const abortResearch = useCallback(() => {
    setState((prev: GameState) => cancelResearch(prev));
  }, [setState]);

  const dismissOfflineModal = useCallback(() => {
    setState((prev: GameState) => ({
      ...prev,
      ui: { ...prev.ui, offlineProgress: null },
    }));
  }, [setState]);

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

  return {
    setActiveTab,
    toggleDrawer,
    setSettlerRole,
    beginResearch,
    abortResearch,
    dismissOfflineModal,
    retryLoad,
    resetGame,
  };
}
