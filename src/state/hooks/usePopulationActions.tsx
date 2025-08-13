import { useCallback, type Dispatch, type SetStateAction } from 'react';
import { ROLE_BUILDINGS } from '../../data/roles.js';
import { createLogEntry } from '../../utils/log.js';
import type { GameState } from '../useGame.tsx';

export interface PopulationActions {
  setSettlerRole: (id: string, role: string | null) => void;
  banishSettler: (id: string) => void;
}

export default function usePopulationActions(
  setState: Dispatch<SetStateAction<GameState>>,
): PopulationActions {
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

  const banishSettler = useCallback(
    (id: string) => {
      setState((prev: GameState) => {
        const settler = prev.population.settlers.find((s) => s.id === id);
        if (!settler) return prev;
        const settlers = prev.population.settlers.filter(
          (s) => s.id !== id,
        ) as GameState['population']['settlers'];
        const entry = createLogEntry(
          `${settler.firstName} ${settler.lastName} was banished`,
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

  return { setSettlerRole, banishSettler };
}
