# Economy Report

## 1) Overview

Economy generated from commit **c165a592774acdbc653d9db413b42c1a1d032d6f** on 2025-08-12 02:12:22 +0200. Save version: **4**.  
Each tick represents 1 second. For each building: base production is modified by season multipliers, summed, then clamped to capacity. Offline progress processes in 60-second chunks.

## 2) Resources

| key        | displayName | category               | startingAmount | startingCapacity | unit |
| ---------- | ----------- | ---------------------- | -------------- | ---------------- | ---- |
| potatoes   | Potatoes    | FOOD                   | 0              | 300              |      |
| wood       | Wood        | RAW                    | 0              | 100              |      |
| stone      | Stone       | RAW                    | 0              | 100              |      |
| scrap      | Scrap       | RAW                    | 0              | 100              |      |
| planks     | Planks      | CONSTRUCTION_MATERIALS | 0              | 50               |      |
| metalParts | Metal Parts | CONSTRUCTION_MATERIALS | 0              | 20               |      |
| science    | Science     | SOCIETY                | 0              | 400              |      |
| power      | Power       | ENERGY                 | 0              | 2                |      |

Global rules: resources cannot go negative; amounts are clamped to capacity.

## 3) Seasons and Global Modifiers

| season | duration (sec) | potatoes | wood  | stone | scrap | planks | metalParts | science | power |
| ------ | -------------- | -------- | ----- | ----- | ----- | ------ | ---------- | ------- | ----- |
| spring | 270            | 1.250    | 1.100 | 1.100 | 1.100 | 1.000  | 1.000      | 1.000   | 1.000 |
| summer | 270            | 1.000    | 1.000 | 1.000 | 1.000 | 1.000  | 1.000      | 1.000   | 1.000 |
| autumn | 270            | 0.850    | 0.900 | 0.900 | 0.900 | 1.000  | 1.000      | 1.000   | 1.000 |
| winter | 270            | 0.000    | 0.800 | 0.800 | 0.800 | 1.000  | 1.000      | 1.000   | 1.000 |

## 4) Buildings

| id            | name           | type       | cost                                        | refund | storage | base prod/s     | inputs per sec | season mults                                     |
| ------------- | -------------- | ---------- | ------------------------------------------- | ------ | ------- | --------------- | -------------- | ------------------------------------------------ |
| potatoField   | Potato Field   | production | wood: 15                                    | 0.5    | -       | potatoes: 0.375 | -              | spring: 1.25, summer: 1, autumn: 0.85            |
| loggingCamp   | Logging Camp   | production | scrap: 15                                   | 0.5    | -       | wood: 0.2       | -              | spring: 1.1, summer: 1, autumn: 0.9, winter: 0.8 |
| scrapyard     | Scrap Yard     | production | wood: 12                                    | 0.5    | -       | scrap: 0.06     | -              | spring: 1.1, summer: 1, autumn: 0.9, winter: 0.8 |
| quarry        | Quarry         | production | wood: 20, scrap: 5                          | 0.5    | -       | stone: 0.08     | -              | spring: 1.1, summer: 1, autumn: 0.9, winter: 0.8 |
| sawmill       | Sawmill        | processing | wood: 40, scrap: 15, stone: 10              | 0.5    | -       | planks: 0.5     | wood: 1        | spring: 1, summer: 1, autumn: 1, winter: 1       |
| metalWorkshop | Metal Workshop | processing | wood: 30, scrap: 30, stone: 10, planks: 10  | 0.5    | -       | metalParts: 0.4 | scrap: 1       | spring: 1, summer: 1, autumn: 1, winter: 1       |
| school        | School         | production | wood: 25, scrap: 10, stone: 10              | 0.5    | -       | science: 0.5    | -              | spring: 1, summer: 1, autumn: 1, winter: 1       |
| woodGenerator | Wood Generator | production | wood: 50, stone: 10                         | 0.5    | -       | power: 1        | wood: 0.3      | spring: 1, summer: 1, autumn: 1, winter: 1       |
| foodStorage   | Granary        | storage    | wood: 20, scrap: 5, stone: 5                | 0.5    | -       | -               | -              | -                                                |
| rawStorage    | Warehouse      | storage    | wood: 25, scrap: 10, stone: 10              | 0.5    | -       | -               | -              | -                                                |
| materialsDepot| Materials Depot| storage    | wood: 25, scrap: 10, stone: 5                | 0.5    | -       | -               | -              | -                                                |
| battery       | Battery        | storage    | wood: 40, stone: 20                         | 0.5    | -       | -               | -              | -                                                |

## 5) Research

| id           | name           | science cost | time (sec) | prereqs                 | unlocks                                                                               |
| ------------ | -------------- | ------------ | ---------- | ----------------------- | ------------------------------------------------------------------------------------- |
| basicEnergy  | Basic Energy   | 20           | 120        | -                       | resources: power; buildings: woodGenerator, battery; categories: Energy               |
| industry1    | Industry I     | 40           | 60         | -                       | buildings: sawmill, metalWorkshop, materialsDepot; categories: CONSTRUCTION_MATERIALS |
| woodworking1 | Woodworking I  | 30           | 45         | industry1               | -                                                                                     |
| salvaging1   | Salvaging I    | 30           | 45         | industry1               | -                                                                                     |
| logistics1   | Logistics I    | 35           | 60         | industry1               | -                                                                                     |
| industry2    | Industry II    | 140          | 180        | industry1               | buildings: toolsmithy                                                                 |
| woodworking2 | Woodworking II | 70           | 120        | woodworking1, industry2 | -                                                                                     |
| salvaging2   | Salvaging II   | 70           | 120        | salvaging1, industry2   | -                                                                                     |
| logistics2   | Logistics II   | 80           | 150        | logistics1, industry2   | -                                                                                     |

## 6) Population and Roles

No role-based production modifiers in effect.

## 7) Production Math (Exact Formula)

Per building per tick:

`effectiveCycle = cycleTimeSec * seasonSpeed`  
`effectiveHarvest = harvestAmount * outputValue * seasonYield`  
`cycles = floor((elapsed + timer) / effectiveCycle)`  
`production = effectiveHarvest * count * cycles`

Sum production for each resource across buildings, then `clampResource(value, capacity)` where values below 0 become 0 and above capacity become capacity.

Offline progress is applied in 60-second chunks.

## 8) Costs, Refunds, and Edge Rules

Building costs scale by `cost * 1.15^count`, rounded up. Demolition refunds 50% of the previous cost (floored) and adds back resources subject to capacity. Resource values are rounded to 6 decimals in clamping and cannot be negative.

## 9) Starting State

Starting season: spring, Year: 1.

### Resources

| resource   | amount | capacity |
| ---------- | ------ | -------- |
| potatoes   | 0      | 300      |
| wood       | 0      | 100      |
| stone      | 0      | 100      |
| scrap      | 0      | 100      |
| planks     | 0      | 50       |
| metalParts | 0      | 20       |
| science    | 0      | 400      |
| power      | 0      | 2        |

### Buildings

| building | count |
| -------- | ----- |
