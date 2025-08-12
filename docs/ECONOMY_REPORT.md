# Economy Report

## 1) Overview
Economy generated from commit **5e5a6b7d1786bbde7e8dafea4711f644f2d09a5b** on 2025-08-13 01:43:36 +0200. Save version: **6**.
Each tick represents 1 second. For each building: base production is modified by season multipliers, summed, then clamped to capacity. Offline progress processes in 60-second chunks.

## 2) Resources
| key | displayName | category | startingAmount | startingCapacity | unit | source |
| - | - | - | - | - | - | - |
| potatoes | Potatoes | FOOD | 0 | 450 |  | resources.js:RESOURCES.potatoes |
| meat | Meat | FOOD | 0 | 150 |  | resources.js:RESOURCES.meat |
| wood | Wood | RAW | 0 | 150 |  | resources.js:RESOURCES.wood |
| stone | Stone | RAW | 0 | 80 |  | resources.js:RESOURCES.stone |
| scrap | Scrap | RAW | 0 | 80 |  | resources.js:RESOURCES.scrap |
| planks | Planks | CONSTRUCTION_MATERIALS | 0 | 50 |  | resources.js:RESOURCES.planks |
| metalParts | Metal Parts | CONSTRUCTION_MATERIALS | 0 | 20 |  | resources.js:RESOURCES.metalParts |
| science | Science | SOCIETY | 0 | 400 |  | resources.js:RESOURCES.science |
| power | Power | ENERGY | 0 | 2 |  | resources.js:RESOURCES.power |

## 3) Seasons
| season | duration (sec) | potatoes | meat | wood | stone | scrap | planks | metalParts | science | power | source |
| - | - | - | - | - | - | - | - | - | - | - | - |
| spring | 270 | 1.250 | 1.250 | 1.100 | 1.100 | 1.100 | 1.000 | 1.000 | 1.000 | 1.000 | time.js:SEASONS[0] |
| summer | 270 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | time.js:SEASONS[1] |
| autumn | 270 | 0.850 | 0.850 | 0.900 | 0.900 | 0.900 | 1.000 | 1.000 | 1.000 | 1.000 | time.js:SEASONS[2] |
| winter | 270 | 0.000 | 0.000 | 0.800 | 0.800 | 0.800 | 1.000 | 1.000 | 1.000 | 1.000 | time.js:SEASONS[3] |

## 4) Buildings
| id | name | type | cost | costGrowth | refund | storage | base prod/s | inputs per sec | requiresResearch | season mults | source |
| - | - | - | - | - | - | - | - | - | - | - | - |
| potatoField | Potato Field | production | {"wood":17} | 1.13 | 0.5 | - | {"potatoes":0.375} | - | - | {"spring":1.25,"summer":1,"autumn":0.85,"winter":0} | buildings.js:BUILDINGS[0] |
| huntersHut | Hunter's Hut | production | {"wood":25,"scrap":10,"stone":5} | 1.15 | 0.5 | - | {"meat":0.19} | - | hunting1 | {"spring":1.1,"summer":1,"autumn":0.9,"winter":0.6} | buildings.js:BUILDINGS[1] |
| loggingCamp | Logging Camp | production | {"scrap":15} | 1.13 | 0.5 | - | {"wood":0.3} | - | - | {"spring":1.1,"summer":1,"autumn":0.9,"winter":0.8} | buildings.js:BUILDINGS[2] |
| scrapyard | Scrap Yard | production | {"wood":12} | 1.13 | 0.5 | - | {"scrap":0.08} | - | - | {"spring":1.1,"summer":1,"autumn":0.9,"winter":0.8} | buildings.js:BUILDINGS[3] |
| quarry | Quarry | production | {"wood":20,"scrap":5} | 1.13 | 0.5 | - | {"stone":0.104} | - | - | {"spring":1.1,"summer":1,"autumn":0.9,"winter":0.8} | buildings.js:BUILDINGS[4] |
| sawmill | Sawmill | processing | {"wood":48,"scrap":18,"stone":12} | 1.13 | 0.5 | - | {"planks":0.5} | {"wood":0.8} | industry1 | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[5] |
| metalWorkshop | Metal Workshop | processing | {"wood":30,"scrap":30,"stone":10,"planks":10} | 1.13 | 0.5 | - | {"metalParts":0.4} | {"scrap":0.4} | industry1 | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[6] |
| school | School | production | {"wood":30,"scrap":12,"stone":12} | 1.13 | 0.5 | - | {"science":0.45} | - | - | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[7] |
| woodGenerator | Wood Generator | production | {"wood":50,"stone":10} | 1.13 | 0.5 | - | {"power":1} | {"wood":0.25} | basicEnergy | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[8] |
| shelter | Shelter | production | {"wood":30,"scrap":10} | 1.8 | 0.5 | - | - | - | - | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[9] |
| radio | Radio | production | {"wood":80,"scrap":40,"stone":20,"planks":20} | 1 | 0.5 | - | - | {"power":0.1} | radio | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[10] |
| foodStorage | Granary | storage | {"wood":20,"scrap":5,"stone":5} | 1.2 | 0.5 | {"potatoes":300,"meat":150} | - | - | - | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[11] |
| rawStorage | Warehouse | storage | {"wood":25,"scrap":10,"stone":10} | 1.2 | 0.5 | {"wood":200,"stone":80,"scrap":90} | - | - | - | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[12] |
| materialsDepot | Materials Depot | storage | {"wood":25,"scrap":10,"stone":5} | 1.2 | 0.5 | {"planks":300,"metalParts":240} | - | - | industry1 | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[13] |
| battery | Battery | storage | {"wood":40,"stone":20} | 1.2 | 0.5 | {"power":600} | - | - | basicEnergy | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[14] |

## 5) Research
| id | name | science cost | time (sec) | prereqs | milestones | unlocks | effects | source |
| - | - | - | - | - | - | - | - | - |
| basicEnergy | Basic Energy | 80 | 120 | industry1 | - | {"resources":["power"],"buildings":["woodGenerator","battery"],"categories":["Energy"]} | - | research.js:RESEARCH[0] |
| industry1 | Industry I | 60 | 90 | - | - | {"resources":["planks","metalParts"],"buildings":["sawmill","metalWorkshop","materialsDepot"],"categories":["CONSTRUCTION_MATERIALS"]} | - | research.js:RESEARCH[1] |
| hunting1 | Hunting I | 50 | 90 | - | - | {"resources":["meat"],"buildings":["huntersHut"],"categories":[]} | - | research.js:RESEARCH[2] |
| radio | Radio | 150 | 240 | industry1, basicEnergy | - | {"resources":[],"buildings":["radio"],"categories":[]} | - | research.js:RESEARCH[3] |
| woodworking1 | Woodworking I | 60 | 90 | industry1 | - | {"resources":[],"buildings":[],"categories":[]} | [{"category":"WOOD","percent":0.05,"type":"output"}] | research.js:RESEARCH[4] |
| salvaging1 | Salvaging I | 60 | 90 | industry1 | - | {"resources":[],"buildings":[],"categories":[]} | [{"category":"SCRAP","percent":0.05,"type":"output"}] | research.js:RESEARCH[5] |
| logistics1 | Logistics I | 60 | 90 | industry1 | - | {"resources":[],"buildings":[],"categories":[]} | [{"category":"RAW","percent":0.05,"type":"storage"},{"category":"CONSTRUCTION_MATERIALS","percent":0.05,"type":"storage"}] | research.js:RESEARCH[6] |
| industry2 | Industry II | 200 | 240 | industry1 | {"produced":{"planks":50,"metalParts":30}} | {"resources":[],"buildings":["toolsmithy"],"categories":[]} | - | research.js:RESEARCH[7] |
| woodworking2 | Woodworking II | 140 | 240 | woodworking1, industry2 | - | {"resources":[],"buildings":[],"categories":[]} | [{"category":"WOOD","percent":0.05,"type":"output"}] | research.js:RESEARCH[8] |
| salvaging2 | Salvaging II | 140 | 240 | salvaging1, industry2 | - | {"resources":[],"buildings":[],"categories":[]} | [{"category":"SCRAP","percent":0.05,"type":"output"}] | research.js:RESEARCH[9] |
| logistics2 | Logistics II | 150 | 270 | logistics1, industry2 | - | {"resources":[],"buildings":[],"categories":[]} | [{"category":"RAW","percent":0.05,"type":"storage"},{"category":"CONSTRUCTION_MATERIALS","percent":0.05,"type":"storage"}] | research.js:RESEARCH[10] |
| hunting2 | Hunting II | 130 | 240 | hunting1 | - | {"resources":[],"buildings":[],"categories":[]} | [{"category":"FOOD","percent":0.1,"type":"output"}] | research.js:RESEARCH[11] |
| industryProduction | Industry Production | 130 | 240 | industry1 | - | {"resources":[],"buildings":[],"categories":[]} | [{"category":"CONSTRUCTION_MATERIALS","percent":0.1,"type":"output"}] | research.js:RESEARCH[12] |

## 6) Roles
| id | name | skill | resource | building | source |
| - | - | - | - | - | - |
| farmer | Farmer | Farming | potatoes | potatoField | roles.js:ROLES.farmer |
| hunter | Hunter | Hunting | meat | huntersHut | roles.js:ROLES.hunter |
| woodcutter | Woodcutter | Woodcutting | wood | loggingCamp | roles.js:ROLES.woodcutter |
| scavenger | Scavenger | Scavenging | scrap | scrapyard | roles.js:ROLES.scavenger |
| quarryWorker | Quarry Worker | Quarrying | stone | quarry | roles.js:ROLES.quarryWorker |
| scientist | Scientist | Scientist | science | school | roles.js:ROLES.scientist |

## 7) Starting State
Starting season: spring, Year: 1.

### Resources
| resource | amount | capacity | source |
| - | - | - | - |
| potatoes | 0 | 450 | resources.js:RESOURCES.potatoes.startingAmount/startingCapacity |
| meat | 0 | 150 | resources.js:RESOURCES.meat.startingAmount/startingCapacity |
| wood | 0 | 150 | resources.js:RESOURCES.wood.startingAmount/startingCapacity |
| stone | 0 | 80 | resources.js:RESOURCES.stone.startingAmount/startingCapacity |
| scrap | 0 | 80 | resources.js:RESOURCES.scrap.startingAmount/startingCapacity |
| planks | 0 | 50 | resources.js:RESOURCES.planks.startingAmount/startingCapacity |
| metalParts | 0 | 20 | resources.js:RESOURCES.metalParts.startingAmount/startingCapacity |
| science | 0 | 400 | resources.js:RESOURCES.science.startingAmount/startingCapacity |
| power | 0 | 2 | resources.js:RESOURCES.power.startingAmount/startingCapacity |

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
Analyzed **15** buildings. Season mode: **average**.
Weights: {"wood":1,"stone":1.3,"scrap":2.2,"planks":4,"metalParts":6,"power":1,"potatoes":0.9,"meat":1.4,"science":2.5}. Targets: 1, 10, 50.
Outliers – too fast: 1, too slow: 13.

## Buildings
| id | category | type | growth | PBT@1 | PBT@10 | PBT@50 | out/s (base) | in/s (base) |
| - | - | - | - | - | - | - | - | - |
| potatoField | Food | production | 1.13 | 64.99 | 198.81 | 25,924.97 | potatoes:0.375 | - |
| huntersHut | Food | production | 1.15 | 223.48 | 796.16 | 210,594.82 | meat:0.19 | - |
| loggingCamp | Raw Materials | production | 1.13 | 115.79 | 355.09 | 46,192.28 | wood:0.3 | - |
| scrapyard | Raw Materials | production | 1.13 | 71.77 | 221.29 | 28,630.38 | scrap:0.08 | - |
| quarry | Raw Materials | production | 1.13 | 241.36 | 748.99 | 96,286.2 | stone:0.104 | - |
| sawmill | Construction Materials | processing | 1.13 | 86 | 261.75 | 34,305.08 | planks:0.5 | wood:0.8 |
| metalWorkshop | Construction Materials | processing | 1.13 | 98.03 | 299.67 | 39,102.7 | metalParts:0.4 | scrap:0.4 |
| school | Science | production | 1.13 | 64 | 196 | 25,530.22 | science:0.45 | - |
| woodGenerator | Energy | production | 1.13 | 84 | 255.07 | 33,507.6 | power:1 | wood:0.25 |
| shelter | Settlement | production | 1.8 | — | — | — | - | - |
| radio | Utilities | production | 1 | — | — | — | - | power:0.1 |
| foodStorage |  | storage | 1.2 | — | — | — | - | - |
| rawStorage |  | storage | 1.2 | — | — | — | - | - |
| materialsDepot |  | storage | 1.2 | — | — | — | - | - |
| battery |  | storage | 1.2 | — | — | — | - | - |

## Converters
| id | growth | in/s | out/s | ratio(out/in) | PBT@1 | PBT@10 | PBT@50 | mode |
| - | - | - | - | - | - | - | - | - |
| sawmill | 1.13 | wood:0.8 | planks:0.5 | 2.5 | 86 | 261.75 | 34,305.08 | all-or-nothing |
| metalWorkshop | 1.13 | scrap:0.4 | metalParts:0.4 | 2.73 | 98.03 | 299.67 | 39,102.7 | all-or-nothing |

## Storage
| id | growth | +capacity |
| - | - | - |
| foodStorage | 1.2 | potatoes:300,meat:150 |
| rawStorage | 1.2 | wood:200,stone:80,scrap:90 |
| materialsDepot | 1.2 | planks:300,metalParts:240 |
| battery | 1.2 | power:600 |

## Outliers
### Too Fast
- sawmill @1: 86 sec
### Too Slow
- potatoField @50: 25,924.97 sec
- huntersHut @1: 223.48 sec
- huntersHut @10: 796.16 sec
- huntersHut @50: 210,594.82 sec
- loggingCamp @50: 46,192.28 sec
- scrapyard @50: 28,630.38 sec
- quarry @1: 241.36 sec
- quarry @10: 748.99 sec
- quarry @50: 96,286.2 sec
- sawmill @50: 34,305.08 sec
- metalWorkshop @50: 39,102.7 sec
- school @50: 25,530.22 sec
- woodGenerator @50: 33,507.6 sec

