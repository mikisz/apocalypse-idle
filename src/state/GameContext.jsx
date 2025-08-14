import React, { useMemo, useState } from 'react';
import { GameContext } from './useGame.tsx';
import { loadGame } from '../engine/persistence.ts';
import { defaultState } from './defaultState.js';
import { prepareLoadedState } from './prepareLoadedState.ts';
import useGameTick from './hooks/useGameTick.tsx';
import useAutosave from './hooks/useAutosave.tsx';
import useNotifications from './hooks/useNotifications.tsx';
import useUiActions from './hooks/useUiActions.tsx';
import usePopulationActions from './hooks/usePopulationActions.tsx';
import useResearchActions from './hooks/useResearchActions.tsx';
import usePersistenceActions from './hooks/usePersistenceActions.tsx';

export function GameProvider({ children }) {
  const { state: loaded, error: loadErr } = loadGame();
  const [state, setState] = useState(() => {
    if (loadErr) {
      if (import.meta.env.DEV) console.warn('[loadGame] error:', loadErr);
    }
    return loaded
      ? prepareLoadedState(loaded)
      : { ...defaultState, lastSaved: Date.now() };
  });
  const [loadError, setLoadError] = useState(!!loadErr);

  useGameTick(setState);
  useAutosave(state, setState);
  useNotifications(state, setState);

  const ui = useUiActions(setState);
  const population = usePopulationActions(setState);
  const research = useResearchActions(setState);
  const persistence = usePersistenceActions(setState, setLoadError);

  const actions = useMemo(
    () => ({ ...ui, ...population, ...research, ...persistence }),
    [ui, population, research, persistence],
  );

  const value = useMemo(
    () => ({ state, setState, loadError, ...actions }),
    [state, actions, loadError],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
