# Economy Report

## 1) Overview

Economy generated from commit **bbcec0abfb9fbb25d8a5b49d06f567ef68ca3f94** on 2025-08-11 17:35:30 +0200. Save version: **2**.
Each tick represents 1 second. For each building: base production is modified by season multipliers, summed, then clamped to capacity. Offline progress processes in 60-second chunks.

## 2) Resources

| key   | displayName | category  | startingAmount | startingCapacity | unit |
| ----- | ----------- | --------- | -------------- | ---------------- | ---- |
| food  | Food        | food      | 0              | 300              |      |
| wood  | Wood        | resources | 0              | 100              |      |
| plank | Planks      | resources | 0              | 0                |      |
| scrap | Scrap       | resources | 0              | 100              |      |
| metal | Metal Bars  | resources | 0              | 0                |      |
| water | Water       | food      | 0              | 100              |      |

Global rules: resources cannot go negative; amounts are clamped to capacity.

## 3) Seasons and Global Modifiers

| season | duration (sec) | food  | wood  | plank | scrap | metal | water |
| ------ | -------------- | ----- | ----- | ----- | ----- | ----- | ----- |
| spring | 270            | 1.375 | 1.375 | 1.375 | 1.375 | 1.000 | 1.250 |
| summer | 270            | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 |
| autumn | 270            | 0.909 | 0.909 | 0.909 | 0.909 | 1.000 | 0.909 |
| winter | 270            | 0.000 | 0.000 | 0.000 | 0.000 | 1.000 | 0.500 |

## 4) Buildings

| id          | name         | type       | cost                            | refund | storage               | base prod/s  | season mults                               |
| ----------- | ------------ | ---------- | ------------------------------- | ------ | --------------------- | ------------ | ------------------------------------------ |
| potatoField | Potato Field | production | wood: 20                        | 0.5    | -                     | food: 0.375  | spring: 1.375, summer: 1, autumn: 0.909    |
| cornField   | Corn Field   | production | wood: 30                        | 0.5    | -                     | food: 0.4    | spring: 1.375, summer: 1, autumn: 0.909    |
| ricePaddy   | Rice Paddy   | production | wood: 15                        | 0.5    | -                     | food: 0.333  | spring: 1.375, summer: 1, autumn: 0.909    |
| loggingCamp | Logging Camp | production | scrap: 50                       | 0.5    | -                     | wood: 0.167  | spring: 1.375, summer: 1, autumn: 0.909    |
| sawmill     | Sawmill      | production | scrap: 30, wood: 40, plank: 10  | 0.5    | -                     | plank: 0.25  | spring: 1.375, summer: 1, autumn: 0.909    |
| scrapYard   | Scrap Yard   | production | -                               | 0.5    | -                     | scrap: 0.143 | spring: 1.375, summer: 1, autumn: 0.909    |
| smelter     | Smelter      | production | scrap: 100, wood: 50, plank: 20 | 0.5    | -                     | metal: 0.1   | spring: 1, summer: 1, autumn: 1, winter: 1 |
| granary     | Granary      | storage    | scrap: 20, wood: 60, plank: 10  | 0.5    | food: 200             | -            | -                                          |
| warehouse   | Warehouse    | storage    | scrap: 30, wood: 80, plank: 20  | 0.5    | wood: 200, scrap: 200 | -            | -                                          |

## 5) Population and Roles

No role-based production modifiers in effect.

## 6) Production Math (Exact Formula)

Per building per tick:

`effectiveCycle = cycleTimeSec * seasonSpeed`

`effectiveHarvest = harvestAmount * outputValue * seasonYield`

`cycles = floor((elapsed + timer) / effectiveCycle)`

`production = effectiveHarvest * count * cycles`

Sum production for each resource across buildings, then `clampResource(value, capacity)` where values below 0 become 0 and above capacity become capacity.

Offline progress is applied in 60-second chunks.

## 7) Costs, Refunds, and Edge Rules

Building costs scale by `cost * 1.15^count`, rounded up. Demolition refunds 50% of the previous cost (floored) and adds back resources subject to capacity. Resource values are rounded to 6 decimals in clamping and cannot be negative.

## 8) Starting State

Starting season: spring, Year: 1.

### Resources

| resource | amount | capacity |
| -------- | ------ | -------- |
| food     | 0      | 300      |
| wood     | 0      | 100      |
| plank    | 0      | 0        |
| scrap    | 0      | 100      |
| metal    | 0      | 0        |
| water    | 0      | 100      |

### Buildings

| building    | count |
| ----------- | ----- |
| potatoField | 1     |
| loggingCamp | 1     |
