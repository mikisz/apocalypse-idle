import type { RoleBonusMap } from './settlers.ts';

export interface TickTelemetry {
  netFoodPerSec: number;
  bonusFoodPerSec: number;
  totalFoodBonusPercent: number;
  totalSettlersConsumption: number;
  potatoes: number;
  starvationTimerSeconds: number;
  roleBonuses: RoleBonusMap;
}

export interface TickEvent {
  id: string;
  text: string;
  time: number;
}

export type TickEvents = TickEvent[];
