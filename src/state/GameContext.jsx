import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { GameContext } from './useGame.js';
import useGameLoop from '../engine/useGameLoop.js';
import { saveGame, loadGame, deleteSave } from '../engine/persistence.js';
import { processTick, applyOfflineProgress } from '../engine/production.js';
import { processSettlersTick, computeRoleBonuses } from '../engine/settlers.js';
import {
  startResearch,
  cancelResearch,
  processResearchTick,
} from '../engine/research.js';
import { defaultState } from './defaultState.js';
import {
  getYear,
  initSeasons,
  SECONDS_PER_DAY,
  DAYS_PER_YEAR,
} from '../engine/time.js';
import { getResourceRates } from './selectors.js';
import { RESOURCES } from '../data/resources.js';
import { ROLE_BUILDINGS } from '../data/roles.js';
import { createLogEntry } from '../utils/log.js';
import { RADIO_BASE_SECONDS } from '../data/settlement.js';
import { generateCandidate } from '../engine/candidates.js';

function mergeDeep(target, source) {
  const out = { ...target };
  Object.keys(source).forEach((key) => {
    const srcVal = source[key];
    const tgtVal = target?.[key];
    if (srcVal && typeof srcVal === 'object' && !Array.isArray(srcVal)) {
      out[key] = mergeDeep(tgtVal || {}, srcVal);
    } else if (srcVal !== undefined) {
      out[key] = srcVal;
    }
  });
  return out;
}

function prepareLoadedState(loaded) {
  const gameTime =
    typeof loaded.gameTime === 'number'
      ? { seconds: loaded.gameTime }
      : loaded.gameTime || { seconds: 0 };
  const base = mergeDeep(defaultState, { ...loaded, gameTime });
  base.meta = { ...base.meta, seasons: initSeasons() };
  const prevYear = base.gameTime.year || getYear(base);
  base.gameTime.year = prevYear;
  const now = Date.now();
  const elapsed = Math.floor((now - (loaded.lastSaved || now)) / 1000);
  if (elapsed > 0) {
    const bonuses = computeRoleBonuses(base.population?.settlers || []);
    const { state: progressed, gains } = applyOfflineProgress(
      base,
      elapsed,
      bonuses,
    );
    const secondsAfter = (progressed.gameTime?.seconds || 0) + elapsed;
    const yearAfter = getYear({
      ...progressed,
      gameTime: { ...progressed.gameTime, seconds: secondsAfter },
    });
    const settlers = progressed.population.settlers.map((s) => ({
      ...s,
      ageDays: (s.ageDays || 0) + elapsed / SECONDS_PER_DAY,
    }));
    const show = Object.keys(gains).length > 0;
    return {
      ...progressed,
      population: { ...progressed.population, settlers },
      gameTime: { seconds: secondsAfter, year: yearAfter },
      ui: {
        ...progressed.ui,
        offlineProgress: show ? { elapsed, gains } : null,
      },
      lastSaved: now,
    };
  }
  return {
    ...base,
    gameTime: { ...base.gameTime, year: prevYear },
    lastSaved: now,
  };
}

export function GameProvider({ children }) {
  const { state: loaded, error: loadErr } = loadGame();
  const [state, setState] = useState(() => {
    if (loadErr) {
      // If there is a loading error – log and fall back to the default state
      console.warn('[loadGame] error:', loadErr);
    }
    return loaded
      ? prepareLoadedState(loaded)
      : { ...defaultState, lastSaved: Date.now() };
  });
  const [loadError, setLoadError] = useState(!!loadErr);

  // Main game loop: increment time and produce resources
  useGameLoop((dt) => {
    setState((prev) => {
      const roleBonuses = computeRoleBonuses(prev.population?.settlers || []);
      const afterTick = processTick(prev, dt, roleBonuses);
      const withResearch = processResearchTick(afterTick, dt, roleBonuses);
      const rates = getResourceRates(withResearch);
      let totalFoodProdBase = 0;
      Object.keys(RESOURCES).forEach((id) => {
        if (RESOURCES[id].category === 'FOOD') {
          totalFoodProdBase += rates[id]?.perSec || 0;
        }
      });
      const { state: settlersProcessed, telemetry } = processSettlersTick(
        withResearch,
        dt,
        totalFoodProdBase,
        Math.random,
        roleBonuses,
      );
      let candidate = prev.population?.candidate || null;
      let radioTimer = prev.colony?.radioTimer ?? RADIO_BASE_SECONDS;
      if (prev.buildings?.radio?.count > 0) {
        const powered = (prev.resources.power?.amount || 0) > 0;
        if (powered && !candidate) {
          radioTimer = Math.max(0, radioTimer - dt);
          if (radioTimer <= 0) {
            candidate = generateCandidate();
            radioTimer = 0;
          }
        }
      }
      const nextSeconds = (settlersProcessed.gameTime?.seconds || 0) + dt;
      const computedYear = getYear({
        ...settlersProcessed,
        gameTime: { ...settlersProcessed.gameTime, seconds: nextSeconds },
      });
      let year = settlersProcessed.gameTime?.year || 1;
      let settlers = settlersProcessed.population.settlers;
      if (computedYear > year) {
        const diff = computedYear - year;
        year = computedYear;
        settlers = settlers.map((s) => ({
          ...s,
          ageDays: (s.ageDays || 0) + diff * DAYS_PER_YEAR,
        }));
      }
      return {
        ...settlersProcessed,
        population: { ...settlersProcessed.population, settlers, candidate },
        colony: { ...settlersProcessed.colony, radioTimer },
        gameTime: { seconds: nextSeconds, year },
        meta: {
          ...settlersProcessed.meta,
          telemetry: {
            ...settlersProcessed.meta?.telemetry,
            settlers: telemetry,
          },
        },
      };
    });
  }, 1000);

  // Autosave interval and on unload
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const save = () => {
      setState(() => saveGame(stateRef.current));
    };
    const id = setInterval(save, 10000);
    window.addEventListener('beforeunload', save);
    return () => {
      clearInterval(id);
      window.removeEventListener('beforeunload', save);
    };
  }, []);

  const setActiveTab = useCallback((tab) => {
    setState((prev) => ({ ...prev, ui: { ...prev.ui, activeTab: tab } }));
  }, []);

  const toggleDrawer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      ui: { ...prev.ui, drawerOpen: !prev.ui.drawerOpen },
    }));
  }, []);

  const setSettlerRole = useCallback((id, role) => {
    setState((prev) => {
      const settler = prev.population.settlers.find((s) => s.id === id);
      if (!settler) return prev;
      const normalized = role === 'idle' ? null : role;
      if (normalized) {
        const building = ROLE_BUILDINGS[normalized];
        const count = prev.buildings?.[building]?.count || 0;
        if (count <= 0) return prev;
      }
      const settlers = prev.population.settlers.map((s) =>
        s.id === id ? { ...s, role: normalized } : s,
      );
      const roleName = normalized ?? 'idle';
      const entry = createLogEntry(
        `${settler.firstName} ${settler.lastName} is now ${roleName}`,
      );
      const log = [entry, ...prev.log].slice(0, 100);
      return { ...prev, population: { ...prev.population, settlers }, log };
    });
  }, []);

  const beginResearch = useCallback((id) => {
    setState((prev) => startResearch(prev, id));
  }, []);

  const abortResearch = useCallback(() => {
    setState((prev) => cancelResearch(prev));
  }, []);

  const dismissOfflineModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      ui: { ...prev.ui, offlineProgress: null },
    }));
  }, []);

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
  }, []);

  const resetGame = useCallback(() => {
    if (window.confirm('Reset colony? This will wipe your save.')) {
      deleteSave();
      const fresh = { ...defaultState, lastSaved: Date.now() };
      setState(fresh);
      saveGame(fresh);
      setLoadError(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      state,
      setActiveTab,
      toggleDrawer,
      setSettlerRole,
      beginResearch,
      abortResearch,
      setState,
      dismissOfflineModal,
      resetGame,
      loadError,
      retryLoad,
    }),
    [
      state,
      setActiveTab,
      toggleDrawer,
      setSettlerRole,
      beginResearch,
      abortResearch,
      dismissOfflineModal,
      resetGame,
      loadError,
      retryLoad,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
