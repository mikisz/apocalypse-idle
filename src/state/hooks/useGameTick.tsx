/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import useGameLoop from '../../engine/useGameLoop.tsx';
import {
  applyProduction,
  applySettlers,
  applyYearUpdate,
} from '../../engine/gameTick.ts';
import { applyOfflineProgress } from '../../engine/offline.ts';
import { computeRoleBonuses } from '../../engine/settlers.ts';

export default function useGameTick(setState: Dispatch<SetStateAction<any>>) {
  const hiddenAt = useRef<number | null>(
    document.visibilityState === 'hidden' ? Date.now() : null,
  );

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt.current = Date.now();
      } else if (document.visibilityState === 'visible') {
        const now = Date.now();
        const last = hiddenAt.current;
        hiddenAt.current = now;
        if (last != null) {
          const elapsed = (now - last) / 1000;
          if (elapsed > 0) {
            setState((prev: any) => {
              const bonuses = computeRoleBonuses(
                prev.population?.settlers || [],
              );
              const { state } = applyOfflineProgress(prev, elapsed, bonuses);
              return state;
            });
          }
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibility);
  }, [setState]);

  useGameLoop((dt) => {
    setState((prev: any) => {
      const {
        state: settlersProcessed,
        telemetry,
        roleBonuses,
      } = applySettlers(prev, dt);
      const { state: withProduction, bonusFoodPerSec } = applyProduction(
        settlersProcessed,
        dt,
        roleBonuses,
      );
      const updatedTelemetry = {
        ...telemetry,
        bonusFoodPerSec,
        netFoodPerSec: (telemetry.netFoodPerSec || 0) + bonusFoodPerSec,
      };
      return applyYearUpdate(withProduction, dt, updatedTelemetry);
    });
  }, 1000);
}
