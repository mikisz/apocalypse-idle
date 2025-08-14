/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch, SetStateAction } from 'react';
import useGameLoop from '../../engine/useGameLoop.tsx';
import {
  applyProduction,
  applySettlers,
  applyYearUpdate,
} from '../../engine/gameTick.ts';

export default function useGameTick(setState: Dispatch<SetStateAction<any>>) {
  useGameLoop((dt) => {
    setState((prev: any) => {
      const {
        state: settlersProcessed,
        telemetry,
        roleBonuses,
      } = applySettlers(prev, dt);
      const {
        state: withProduction,
        bonusFoodPerSec,
      } = applyProduction(settlersProcessed, dt, roleBonuses);
      const updatedTelemetry = {
        ...telemetry,
        bonusFoodPerSec,
        netFoodPerSec: (telemetry.netFoodPerSec || 0) + bonusFoodPerSec,
      };
      return applyYearUpdate(withProduction, dt, updatedTelemetry);
    });
  }, 1000);
}
