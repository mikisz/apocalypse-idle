import { Dispatch, SetStateAction } from 'react';
import useGameLoop from '../../engine/useGameLoop.ts';
import { processTick } from '../../engine/production.js';
import { processResearchTick } from '../../engine/research.js';
import { getResourceRates } from '../selectors.js';
import { RESOURCES } from '../../data/resources.js';
import {
  processSettlersTick,
  computeRoleBonuses,
} from '../../engine/settlers.js';
import { updateRadio } from '../../engine/radio.js';
import { getYear, DAYS_PER_YEAR } from '../../engine/time.js';

export default function useGameTick(setState: Dispatch<SetStateAction<any>>) {
  useGameLoop((dt) => {
    setState((prev) => {
      const roleBonuses = computeRoleBonuses(prev.population?.settlers || []);
      const productionBonuses = { ...roleBonuses };
      delete productionBonuses.farmer;
      const afterTick = processTick(prev, dt, productionBonuses);
      const withResearch = processResearchTick(afterTick, dt, roleBonuses);
      const rates = getResourceRates(withResearch);
      let totalFoodProdBase = 0;
      Object.keys(RESOURCES).forEach((id) => {
        if (RESOURCES[id].category === 'FOOD') {
          totalFoodProdBase += rates[id]?.perSec || 0;
        }
      });
      const bonusFoodPerSec =
        totalFoodProdBase * ((roleBonuses['farmer'] || 0) / 100);
      const { state: settlersProcessed, telemetry } = processSettlersTick(
        withResearch,
        dt,
        bonusFoodPerSec,
        Math.random,
        roleBonuses,
      );
      const { candidate, radioTimer } = updateRadio(settlersProcessed, dt);
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
        settlers = settlers.map((s: any) => ({
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
}
