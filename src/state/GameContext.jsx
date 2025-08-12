import React, { useMemo, useState } from 'react';
import { GameContext } from './useGame.ts';
import { loadGame } from '../engine/persistence.js';
import { defaultState } from './defaultState.js';
import { prepareLoadedState } from './prepareLoadedState.ts';
import useGameTick from './hooks/useGameTick.ts';
import useAutosave from './hooks/useAutosave.ts';
import useGameActions from './hooks/useGameActions.ts';

export function GameProvider({ children }) {
  const { state: loaded, error: loadErr } = loadGame();
  const [state, setState] = useState(() => {
    if (loadErr) {
      console.warn('[loadGame] error:', loadErr);
    }
    return loaded
      ? prepareLoadedState(loaded)
      : { ...defaultState, lastSaved: Date.now() };
  });
  const [loadError, setLoadError] = useState(!!loadErr);

  useGameTick(setState);
  useAutosave(state, setState);

  const actions = useGameActions(setState, setLoadError);

  const value = useMemo(
    () => ({ state, setState, loadError, ...actions }),
    [state, actions, loadError],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
