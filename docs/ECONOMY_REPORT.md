# Economy Report

## 1) Overview
Economy generated from commit **63b0fbfb32c756104bd862057cab4559b24254d2** on 2025-08-14 02:09:55 +0200. Save version: **7**.
Each tick represents 1 second. For each building: base production is modified by season multipliers, summed, then clamped to capacity. Offline progress processes in 60-second chunks.

## 2) Resources
| key | displayName | category | startingAmount | startingCapacity | unit | source |
| - | - | - | - | - | - | - |
| potatoes | Potatoes | FOOD | 0 | 200 |  | resources.js:RESOURCES.potatoes |
| meat | Meat | FOOD | 0 | 100 |  | resources.js:RESOURCES.meat |
| wood | Wood | RAW | 0 | 80 |  | resources.js:RESOURCES.wood |
| stone | Stone | RAW | 0 | 50 |  | resources.js:RESOURCES.stone |
| scrap | Scrap | RAW | 0 | 60 |  | resources.js:RESOURCES.scrap |
| planks | Planks | CONSTRUCTION_MATERIALS | 0 | 40 |  | resources.js:RESOURCES.planks |
| bricks | Bricks | CONSTRUCTION_MATERIALS | 0 | 40 |  | resources.js:RESOURCES.bricks |
| metalParts | Metal Parts | CONSTRUCTION_MATERIALS | 0 | 24 |  | resources.js:RESOURCES.metalParts |
| tools | Tools | CONSTRUCTION_MATERIALS | 0 | 24 |  | resources.js:RESOURCES.tools |
| science | Science | SOCIETY | 0 | 400 |  | resources.js:RESOURCES.science |
| power | Power | ENERGY | 0 | 20 |  | resources.js:RESOURCES.power |

## 3) Seasons
| season | duration (sec) | potatoes | meat | wood | stone | scrap | planks | bricks | metalParts | tools | science | power | source |
| - | - | - | - | - | - | - | - | - | - | - | - | - | - |
| spring | 270 | 1.250 | 1.250 | 1.100 | 1.100 | 1.100 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | time.js:SEASONS[0] |
| summer | 270 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | time.js:SEASONS[1] |
| autumn | 270 | 0.850 | 0.850 | 0.900 | 0.900 | 0.900 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | time.js:SEASONS[2] |
| winter | 270 | 0.000 | 0.000 | 0.800 | 0.800 | 0.800 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | time.js:SEASONS[3] |

## 4) Buildings
| id | name | type | cost | costGrowth | refund | storage | base prod/s | inputs per sec | requiresResearch | season mults | source |
| - | - | - | - | - | - | - | - | - | - | - | - |
| potatoField | Potato Field | production | {"wood":17} | 1.12 | 0.5 | - | {"potatoes":0.375} | - | - | {"spring":1.25,"summer":1,"autumn":0.85,"winter":0} | buildings.js:BUILDINGS[0] |
| huntersHut | Hunter's Hut | production | {"wood":25,"scrap":10,"stone":5} | 1.15 | 0.5 | - | {"meat":0.22} | - | huntingHut | {"spring":1.1,"summer":1,"autumn":0.9,"winter":0.6} | buildings.js:BUILDINGS[1] |
| loggingCamp | Logging Camp | production | {"scrap":15} | 1.12 | 0.5 | - | {"wood":0.3} | - | - | {"spring":1.1,"summer":1,"autumn":0.9,"winter":0.8} | buildings.js:BUILDINGS[2] |
| scrapyard | Scrap Yard | production | {"wood":12} | 1.12 | 0.5 | - | {"scrap":0.08} | - | - | {"spring":1.1,"summer":1,"autumn":0.9,"winter":0.8} | buildings.js:BUILDINGS[3] |
| quarry | Quarry | production | {"wood":20,"scrap":5} | 1.12 | 0.5 | - | {"stone":0.12} | - | - | {"spring":1.1,"summer":1,"autumn":0.9,"winter":0.8} | buildings.js:BUILDINGS[4] |
| sawmill | Sawmill | processing | {"wood":53,"scrap":20,"stone":13} | 1.13 | 0.5 | - | {"planks":0.5} | {"wood":0.8} | industry1 | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[5] |
| metalWorkshop | Metal Workshop | processing | {"wood":30,"scrap":30,"stone":10,"planks":10} | 1.13 | 0.5 | - | {"metalParts":0.4} | {"scrap":0.4} | industry1 | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[6] |
| toolsmithy | Toolsmithy | processing | {"wood":50,"scrap":30,"stone":20,"planks":25,"metalParts":15} | 1.13 | 0.5 | - | {"tools":0.18} | {"planks":0.25,"metalParts":0.15,"power":0.4} | industry2 | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[7] |
| school | School | production | {"wood":30,"scrap":12,"stone":12} | 1.13 | 0.5 | - | {"science":0.45} | - | - | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[8] |
| woodGenerator | Wood Generator | production | {"wood":50,"stone":10,"planks":20,"metalParts":10} | 1.13 | 0.5 | - | {"power":1} | {"wood":0.25} | basicEnergy | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[9] |
| shelter | Shelter | production | {"wood":30,"scrap":10} | 1.8 | 0.5 | - | - | - | - | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[10] |
| radio | Radio | production | {"wood":80,"scrap":40,"stone":20,"planks":20,"metalParts":10} | 1 | 0.5 | - | - | {"power":0.1} | radio | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[11] |
| foodStorage | Granary | storage | {"wood":20,"scrap":5,"stone":5} | 1.22 | 0.5 | {"potatoes":150,"meat":75} | - | - | - | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[12] |
| rawStorage | Warehouse | storage | {"wood":25,"scrap":10,"stone":10} | 1.22 | 0.5 | {"wood":120,"scrap":80,"stone":60} | - | - | - | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[13] |
| materialsDepot | Materials Depot | storage | {"wood":25,"scrap":10,"stone":5} | 1.22 | 0.5 | {"planks":100,"metalParts":40} | - | - | industry1 | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[14] |
| battery | Battery | storage | {"wood":40,"stone":20,"planks":20,"metalParts":10} | 1.22 | 0.5 | {"power":40} | - | - | basicEnergy | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[15] |

## 5) Research
| id | name | science cost | time (sec) | prereqs | milestones | unlocks | effects | source |
| - | - | - | - | - | - | - | - | - |
| industry1 | Industry I | 60 | 120 | - | - | {"resources":["planks","metalParts"],"buildings":["sawmill","metalWorkshop","materialsDepot"],"categories":["CONSTRUCTION_MATERIALS"]} | - | research.js:RESEARCH[0] |
| woodworking1 | Woodworking I | 60 | 90 | industry1 | - | {"resources":[],"buildings":[],"categories":[]} | [{"category":"WOOD","percent":0.05,"type":"output"}] | research.js:RESEARCH[1] |
| salvaging1 | Salvaging I | 60 | 90 | industry1 | - | {"resources":[],"buildings":[],"categories":[]} | [{"category":"SCRAP","percent":0.05,"type":"output"}] | research.js:RESEARCH[2] |
| logistics1 | Logistics I | 60 | 90 | industry1 | - | {"resources":[],"buildings":[],"categories":[]} | [{"category":"RAW","percent":0.05,"type":"storage"},{"category":"CONSTRUCTION_MATERIALS","percent":0.05,"type":"storage"}] | research.js:RESEARCH[3] |
| industry2 | Industry II | 200 | 240 | woodworking1, salvaging1, logistics1 | {"produced":{"planks":50,"metalParts":30}} | {"resources":[],"buildings":["toolsmithy"],"categories":[]} | - | research.js:RESEARCH[4] |
| industryProduction | Industry Production | 170 | 270 | woodworking1, salvaging1, logistics1 | - | {"resources":[],"buildings":[],"categories":[]} | [{"category":"CONSTRUCTION_MATERIALS","percent":0.05,"type":"output"}] | research.js:RESEARCH[5] |
| woodworking2 | Woodworking II | 220 | 360 | industry2, industryProduction, woodworking1, salvaging1, logistics1 | - | {"resources":[],"buildings":[],"categories":[]} | [{"category":"WOOD","percent":0.05,"type":"output"}] | research.js:RESEARCH[6] |
| salvaging2 | Salvaging II | 220 | 360 | industry2, industryProduction, woodworking1, salvaging1, logistics1 | - | {"resources":[],"buildings":[],"categories":[]} | [{"category":"SCRAP","percent":0.05,"type":"output"}] | research.js:RESEARCH[7] |
| logistics2 | Logistics II | 230 | 360 | industry2, industryProduction, woodworking1, salvaging1, logistics1 | - | {"resources":[],"buildings":[],"categories":[]} | [{"category":"RAW","percent":0.05,"type":"storage"},{"category":"CONSTRUCTION_MATERIALS","percent":0.05,"type":"storage"}] | research.js:RESEARCH[8] |
| basicEnergy | Basic Energy | 150 | 210 | industry2 | - | {"resources":["power"],"buildings":["woodGenerator","battery"],"categories":["Energy"]} | - | research.js:RESEARCH[9] |
| radio | Radio | 150 | 240 | basicEnergy | - | {"resources":[],"buildings":["radio"],"categories":[]} | - | research.js:RESEARCH[10] |
| food1 | Food I | 50 | 90 | - | - | {"resources":[],"buildings":[],"categories":[]} | - | research.js:RESEARCH[11] |
| huntingHut | Hunting Hut | 60 | 90 | food1 | - | {"resources":["meat"],"buildings":["huntersHut"],"categories":[]} | - | research.js:RESEARCH[12] |
| food2 | Food II | 150 | 240 | huntingHut | - | {"resources":[],"buildings":[],"categories":[]} | [{"resource":"meat","percent":0.04,"type":"output"}] | research.js:RESEARCH[13] |

## 6) Roles
| id | name | skill | resource | building | source |
| - | - | - | - | - | - |
| farmer | Farmer | Farming | undefined | undefined | roles.js:ROLES.farmer |
| hunter | Hunter | Hunting | undefined | undefined | roles.js:ROLES.hunter |
| gatherer | Gatherer | Gathering | undefined | undefined | roles.js:ROLES.gatherer |
| carpenter | Carpenter | Carpentry | undefined | undefined | roles.js:ROLES.carpenter |
| metalworker | Metalworker | Metalworking | undefined | undefined | roles.js:ROLES.metalworker |
| toolsmith | Toolsmith | Toolsmithing | undefined | undefined | roles.js:ROLES.toolsmith |
| engineer | Engineer | Engineering | undefined | undefined | roles.js:ROLES.engineer |
| scientist | Scientist | Scientist | undefined | undefined | roles.js:ROLES.scientist |

## 7) Starting State
Starting season: spring, Year: 1.

### Resources
| resource | amount | capacity | source |
| - | - | - | - |
| potatoes | 0 | 200 | resources.js:RESOURCES.potatoes.startingAmount/startingCapacity |
| meat | 0 | 100 | resources.js:RESOURCES.meat.startingAmount/startingCapacity |
| wood | 0 | 80 | resources.js:RESOURCES.wood.startingAmount/startingCapacity |
| stone | 0 | 50 | resources.js:RESOURCES.stone.startingAmount/startingCapacity |
| scrap | 0 | 60 | resources.js:RESOURCES.scrap.startingAmount/startingCapacity |
| planks | 0 | 40 | resources.js:RESOURCES.planks.startingAmount/startingCapacity |
| bricks | 0 | 40 | resources.js:RESOURCES.bricks.startingAmount/startingCapacity |
| metalParts | 0 | 24 | resources.js:RESOURCES.metalParts.startingAmount/startingCapacity |
| tools | 0 | 24 | resources.js:RESOURCES.tools.startingAmount/startingCapacity |
| science | 0 | 400 | resources.js:RESOURCES.science.startingAmount/startingCapacity |
| power | 0 | 20 | resources.js:RESOURCES.power.startingAmount/startingCapacity |

### Buildings
| building | count | source |
| - | - | - |
| potatoField | 2 | defaultState.js:initBuildings().potatoField.count |
| loggingCamp | 1 | defaultState.js:initBuildings().loggingCamp.count |
| shelter | 1 | defaultState.js:initBuildings().shelter.count |

## 8) Rules & Formulas
- Building cost: costBase * costGrowth^count, rounded up (source: buildings.js:getBuildingCost())
- Demolition refund: refund * last cost (source: buildings.js:BUILDINGS[].refund)
- Clamp: clampResource(value, capacity) (source: production.js:clampResource())
- TICK_SECONDS = 1 (source: balance.js:BALANCE.TICK_SECONDS)
- FOOD_CONSUMPTION_PER_SETTLER = 0.4 (source: balance.js:BALANCE.FOOD_CONSUMPTION_PER_SETTLER)
- STARVATION_DEATH_TIMER_SECONDS = 90 (source: balance.js:BALANCE.STARVATION_DEATH_TIMER_SECONDS)
- ROLE_BONUS_PER_SETTLER(level): level<=10 -> 0.1*level; else 1 + 0.05*(level-10) (source: balance.js:ROLE_BONUS_PER_SETTLER)
- SHELTER_MAX = 5 (source: settlement.js:SHELTER_MAX)
- SHELTER_COST_GROWTH = 1.8 (source: settlement.js:SHELTER_COST_GROWTH)
- RADIO_BASE_SECONDS = 120 (source: settlement.js:RADIO_BASE_SECONDS)

## Summary
Analyzed **16** buildings. Season mode: **average**.
Weights: {"wood":1,"stone":1.3,"scrap":2.2,"planks":4,"metalParts":6,"power":1,"potatoes":0.9,"meat":1.4,"science":2.5}. Targets: 1, 10, 50.
Outliers – too fast: 0, too slow: 15.

## Buildings
| id | category | type | growth | PBT@1 | PBT@10 | PBT@50 | out/s (base) | in/s (base) |
| - | - | - | - | - | - | - | - | - |
| potatoField | Food | production | 1.12 | 64.99 | 183.51 | 16,772.28 | potatoes:0.375 | - |
| huntersHut | Food | production | 1.15 | 193 | 687.59 | 181,877.34 | meat:0.22 | - |
| loggingCamp | Raw Materials | production | 1.12 | 115.79 | 324.21 | 29,881.4 | wood:0.3 | - |
| scrapyard | Raw Materials | production | 1.12 | 71.77 | 203.35 | 18,522.73 | scrap:0.08 | - |
| quarry | Raw Materials | production | 1.12 | 209.18 | 585.7 | 53,989.2 | stone:0.12 | - |
| sawmill | Construction Materials | processing | 1.13 | 94.92 | 288.5 | 37,862 | planks:0.5 | wood:0.8 |
| metalWorkshop | Construction Materials | processing | 1.13 | 98.03 | 299.67 | 39,102.7 | metalParts:0.4 | scrap:0.4 |
| toolsmithy | Construction Materials | processing | 1.13 | — | — | — | tools:0.18 | planks:0.25,metalParts:0.15,power:0.4 |
| school | Science | production | 1.13 | 64 | 196 | 25,530.22 | science:0.45 | - |
| woodGenerator | Energy | production | 1.13 | 270.67 | 828.4 | 107,968.93 | power:1 | wood:0.25 |
| shelter | Settlement | production | 1.8 | — | — | — | - | - |
| radio | Utilities | production | 1 | — | — | — | - | power:0.1 |
| foodStorage |  | storage | 1.22 | — | — | — | - | - |
| rawStorage |  | storage | 1.22 | — | — | — | - | - |
| materialsDepot |  | storage | 1.22 | — | — | — | - | - |
| battery |  | storage | 1.22 | — | — | — | - | - |

## Converters
| id | growth | in/s | out/s | ratio(out/in) | PBT@1 | PBT@10 | PBT@50 | mode |
| - | - | - | - | - | - | - | - | - |
| sawmill | 1.13 | wood:0.8 | planks:0.5 | 2.5 | 94.92 | 288.5 | 37,862 | all-or-nothing |
| metalWorkshop | 1.13 | scrap:0.4 | metalParts:0.4 | 2.73 | 98.03 | 299.67 | 39,102.7 | all-or-nothing |
| toolsmithy | 1.13 | planks:0.25,metalParts:0.15,power:0.4 | tools:0.18 | 0 | — | — | — | all-or-nothing |

## Storage
| id | growth | +capacity |
| - | - | - |
| foodStorage | 1.22 | potatoes:150,meat:75 |
| rawStorage | 1.22 | wood:120,scrap:80,stone:60 |
| materialsDepot | 1.22 | planks:100,metalParts:40 |
| battery | 1.22 | power:40 |

## Outliers
### Too Slow
- potatoField @50: 16,772.28 sec
- huntersHut @1: 193 sec
- huntersHut @10: 687.59 sec
- huntersHut @50: 181,877.34 sec
- loggingCamp @50: 29,881.4 sec
- scrapyard @50: 18,522.73 sec
- quarry @1: 209.18 sec
- quarry @10: 585.7 sec
- quarry @50: 53,989.2 sec
- sawmill @50: 37,862 sec
- metalWorkshop @50: 39,102.7 sec
- school @50: 25,530.22 sec
- woodGenerator @1: 270.67 sec
- woodGenerator @10: 828.4 sec
- woodGenerator @50: 107,968.93 sec

