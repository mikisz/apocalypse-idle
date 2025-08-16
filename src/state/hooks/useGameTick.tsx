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
import { getYear } from '../../engine/time.ts';
import { RESOURCES } from '../../data/resources.js';
import { createLogEntry } from '../../utils/log.js';
import { formatAmount } from '../../utils/format.js';

const MAX_OFFLINE_SECONDS = 12 * 60 * 60;
const MIN_OFFLINE_SECONDS = 15 * 60;

export default function useGameTick(setState: Dispatch<SetStateAction<any>>) {
  const pendingOfflineRef = useRef(0);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        setState((prev: any) => {
          const raw = Math.floor((now - (prev.lastSaved || now)) / 1000);
          const elapsed = Math.min(Math.max(raw, 0), MAX_OFFLINE_SECONDS);
          if (elapsed < MIN_OFFLINE_SECONDS) {
            return { ...prev, lastSaved: now };
          }
          pendingOfflineRef.current = elapsed;
          const bonuses = computeRoleBonuses(prev.population?.settlers || []);
          const {
            state: progressed,
            gains,
            events,
          } = applyOfflineProgress(prev, elapsed, bonuses);
          const resourceLogs = Object.entries(gains).map(([res, amt]) =>
            createLogEntry(
              `Gained ${formatAmount(amt)} ${(RESOURCES as any)[res].name} while offline`,
              now,
            ),
          );
          const deathLogs = (events || []).filter((e) => e.type === 'death');
          const researchLogs = (events || []).filter(
            (e) => e.type === 'research',
          );
          const candidateLogs = (events || []).filter(
            (e) => e.type === 'candidate',
          );
          const secondsAfter = (progressed.gameTime?.seconds || 0) + elapsed;
          const yearAfter = getYear({
            ...progressed,
            gameTime: { ...progressed.gameTime, seconds: secondsAfter },
          });
          const settlers = progressed.population.settlers.map((s: any) => ({
            ...s,
          }));
          const show =
            Object.keys(gains).length > 0 ||
            deathLogs.length > 0 ||
            researchLogs.length > 0 ||
            candidateLogs.length > 0;
          const log = [...resourceLogs, ...(progressed.log || [])].slice(
            0,
            100,
          );
          return {
            ...progressed,
            population: { ...progressed.population, settlers },
            gameTime: { seconds: secondsAfter, year: yearAfter },
            ui: {
              ...progressed.ui,
              offlineProgress: show
                ? {
                    elapsed,
                    gains,
                    deaths: deathLogs.map((e) => e.text),
                    research: researchLogs.map((e) => e.text),
                    candidates: candidateLogs.map((e) => e.text),
                  }
                : null,
            },
            log,
            lastSaved: now,
          };
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibility);
  }, [setState]);

  useGameLoop((dt) => {
    let effectiveDt = dt;
    if (pendingOfflineRef.current > 0) {
      effectiveDt = Math.max(0, dt - pendingOfflineRef.current);
      pendingOfflineRef.current = 0;
      if (effectiveDt === 0) return;
    }
    setState((prev: any) => {
      const {
        state: settlersProcessed,
        telemetry,
        roleBonuses,
      } = applySettlers(prev, effectiveDt);
      const { state: withProduction, bonusFoodPerSec } = applyProduction(
        settlersProcessed,
        effectiveDt,
        roleBonuses,
      );
      const updatedTelemetry = {
        ...telemetry,
        bonusFoodPerSec,
        netFoodPerSec: (telemetry.netFoodPerSec || 0) + bonusFoodPerSec,
      };
      return applyYearUpdate(withProduction, effectiveDt, updatedTelemetry);
    });
  }, 1000);
}
