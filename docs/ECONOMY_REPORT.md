# Economy Report

## 1) Overview
Economy generated from commit **fea12af6a78ea53efde6c6b33916b2cdc4d64b21** on 2025-08-12 03:58:01 +0200. Save version: **5**.
Each tick represents 1 second. For each building: base production is modified by season multipliers, summed, then clamped to capacity. Offline progress processes in 60-second chunks.

## 2) Resources
| key | displayName | category | startingAmount | startingCapacity | unit | source |
| - | - | - | - | - | - | - |
| potatoes | Potatoes | FOOD | 0 | 300 |  | resources.js:RESOURCES.potatoes |
| wood | Wood | RAW | 0 | 100 |  | resources.js:RESOURCES.wood |
| stone | Stone | RAW | 0 | 100 |  | resources.js:RESOURCES.stone |
| scrap | Scrap | RAW | 0 | 100 |  | resources.js:RESOURCES.scrap |
| planks | Planks | CONSTRUCTION_MATERIALS | 0 | 50 |  | resources.js:RESOURCES.planks |
| metalParts | Metal Parts | CONSTRUCTION_MATERIALS | 0 | 20 |  | resources.js:RESOURCES.metalParts |
| science | Science | SOCIETY | 0 | 400 |  | resources.js:RESOURCES.science |
| power | Power | ENERGY | 0 | 2 |  | resources.js:RESOURCES.power |

## 3) Seasons
| season | duration (sec) | potatoes | wood | stone | scrap | planks | metalParts | science | power | source |
| - | - | - | - | - | - | - | - | - | - | - |
| spring | 270 | 1.250 | 1.100 | 1.100 | 1.100 | 1.000 | 1.000 | 1.000 | 1.000 | time.js:SEASONS[0] |
| summer | 270 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | time.js:SEASONS[1] |
| autumn | 270 | 0.850 | 0.900 | 0.900 | 0.900 | 1.000 | 1.000 | 1.000 | 1.000 | time.js:SEASONS[2] |
| winter | 270 | 0.000 | 0.800 | 0.800 | 0.800 | 1.000 | 1.000 | 1.000 | 1.000 | time.js:SEASONS[3] |

## 4) Buildings
| id | name | type | cost | costGrowth | refund | storage | base prod/s | inputs per sec | requiresResearch | season mults | source |
| - | - | - | - | - | - | - | - | - | - | - | - |
| potatoField | Potato Field | production | {"wood":15} | 1.15 | 0.5 | - | {"potatoes":0.375} | - | - | {"spring":1.25,"summer":1,"autumn":0.85,"winter":0} | buildings.js:BUILDINGS[0] |
| loggingCamp | Logging Camp | production | {"scrap":15} | 1.15 | 0.5 | - | {"wood":0.25} | - | - | {"spring":1.1,"summer":1,"autumn":0.9,"winter":0.8} | buildings.js:BUILDINGS[1] |
| scrapyard | Scrap Yard | production | {"wood":12} | 1.15 | 0.5 | - | {"scrap":0.08} | - | - | {"spring":1.1,"summer":1,"autumn":0.9,"winter":0.8} | buildings.js:BUILDINGS[2] |
| quarry | Quarry | production | {"wood":20,"scrap":5} | 1.15 | 0.5 | - | {"stone":0.08} | - | - | {"spring":1.1,"summer":1,"autumn":0.9,"winter":0.8} | buildings.js:BUILDINGS[3] |
| sawmill | Sawmill | processing | {"wood":40,"scrap":15,"stone":10} | 1.15 | 0.5 | - | {"planks":0.5} | {"wood":0.8} | industry1 | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[4] |
| metalWorkshop | Metal Workshop | processing | {"wood":30,"scrap":30,"stone":10,"planks":10} | 1.15 | 0.5 | - | {"metalParts":0.4} | {"scrap":0.4} | industry1 | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[5] |
| school | School | production | {"wood":25,"scrap":10,"stone":10} | 1.15 | 0.5 | - | {"science":0.5} | - | - | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[6] |
| woodGenerator | Wood Generator | production | {"wood":50,"stone":10} | 1.15 | 0.5 | - | {"power":1} | {"wood":0.25} | basicEnergy | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[7] |
| shelter | Shelter | production | {"wood":30,"scrap":10} | 1.8 | 0.5 | - | - | - | - | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[8] |
| radio | Radio | production | {"wood":80,"scrap":40,"stone":20} | 1 | 0.5 | - | - | {"power":0.1} | radio | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[9] |
| foodStorage | Granary | storage | {"wood":20,"scrap":5,"stone":5} | 1.15 | 0.5 | {"potatoes":300} | - | - | - | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[10] |
| rawStorage | Warehouse | storage | {"wood":25,"scrap":10,"stone":10} | 1.15 | 0.5 | {"wood":200,"stone":80,"scrap":120} | - | - | - | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[11] |
| materialsDepot | Materials Depot | storage | {"wood":25,"scrap":10,"stone":5} | 1.15 | 0.5 | {"planks":150,"metalParts":60} | - | - | industry1 | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[12] |
| battery | Battery | storage | {"wood":40,"stone":20} | 1.15 | 0.5 | {"power":40} | - | - | basicEnergy | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[13] |

## 5) Research
| id | name | science cost | time (sec) | prereqs | milestones | unlocks | effects | source |
| - | - | - | - | - | - | - | - | - |
| basicEnergy | Basic Energy | 80 | 120 | industry1 | - | {"resources":["power"],"buildings":["woodGenerator","battery"],"categories":["Energy"]} | - | research.js:RESEARCH[0] |
| industry1 | Industry I | 60 | 90 | - | - | {"resources":["planks","metalParts"],"buildings":["sawmill","metalWorkshop","materialsDepot"],"categories":["CONSTRUCTION_MATERIALS"]} | - | research.js:RESEARCH[1] |
| radio | Radio | 120 | 180 | industry1, basicEnergy | - | {"resources":[],"buildings":["radio"],"categories":[]} | - | research.js:RESEARCH[2] |
| woodworking1 | Woodworking I | 50 | 70 | industry1 | - | {"resources":[],"buildings":[],"categories":[]} | [{"category":"WOOD","percent":0.05,"type":"output"}] | research.js:RESEARCH[3] |
| salvaging1 | Salvaging I | 50 | 70 | industry1 | - | {"resources":[],"buildings":[],"categories":[]} | [{"category":"SCRAP","percent":0.05,"type":"output"}] | research.js:RESEARCH[4] |
| logistics1 | Logistics I | 60 | 90 | industry1 | - | {"resources":[],"buildings":[],"categories":[]} | [{"category":"RAW","percent":0.05,"type":"storage"},{"category":"CONSTRUCTION_MATERIALS","percent":0.05,"type":"storage"}] | research.js:RESEARCH[5] |
| industry2 | Industry II | 200 | 240 | industry1 | {"produced":{"planks":50,"metalParts":30}} | {"resources":[],"buildings":["toolsmithy"],"categories":[]} | - | research.js:RESEARCH[6] |
| woodworking2 | Woodworking II | 110 | 180 | woodworking1, industry2 | - | {"resources":[],"buildings":[],"categories":[]} | [{"category":"WOOD","percent":0.05,"type":"output"}] | research.js:RESEARCH[7] |
| salvaging2 | Salvaging II | 110 | 180 | salvaging1, industry2 | - | {"resources":[],"buildings":[],"categories":[]} | [{"category":"SCRAP","percent":0.05,"type":"output"}] | research.js:RESEARCH[8] |
| logistics2 | Logistics II | 120 | 210 | logistics1, industry2 | - | {"resources":[],"buildings":[],"categories":[]} | [{"category":"RAW","percent":0.05,"type":"storage"},{"category":"CONSTRUCTION_MATERIALS","percent":0.05,"type":"storage"}] | research.js:RESEARCH[9] |

## 6) Roles
| id | name | skill | resource | building | source |
| - | - | - | - | - | - |
| farmer | Farmer | Farming | potatoes | potatoField | roles.js:ROLES.farmer |
| woodcutter | Woodcutter | Woodcutting | wood | loggingCamp | roles.js:ROLES.woodcutter |
| scavenger | Scavenger | Scavenging | scrap | scrapyard | roles.js:ROLES.scavenger |
| quarryWorker | Quarry Worker | Quarrying | stone | quarry | roles.js:ROLES.quarryWorker |
| scientist | Scientist | Scientist | science | school | roles.js:ROLES.scientist |

## 7) Starting State
Starting season: spring, Year: 1.

### Resources
| resource | amount | capacity | source |
| - | - | - | - |
| potatoes | 0 | 300 | resources.js:RESOURCES.potatoes.startingAmount/startingCapacity |
| wood | 0 | 100 | resources.js:RESOURCES.wood.startingAmount/startingCapacity |
| stone | 0 | 100 | resources.js:RESOURCES.stone.startingAmount/startingCapacity |
| scrap | 0 | 100 | resources.js:RESOURCES.scrap.startingAmount/startingCapacity |
| planks | 0 | 50 | resources.js:RESOURCES.planks.startingAmount/startingCapacity |
| metalParts | 0 | 20 | resources.js:RESOURCES.metalParts.startingAmount/startingCapacity |
| science | 0 | 400 | resources.js:RESOURCES.science.startingAmount/startingCapacity |
| power | 0 | 2 | resources.js:RESOURCES.power.startingAmount/startingCapacity |

### Buildings
| building | count | source |
| - | - | - |
| potatoField | 2 | defaultState.js:initBuildings().potatoField.count |
| loggingCamp | 1 | defaultState.js:initBuildings().loggingCamp.count |

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
- RADIO_BASE_SECONDS = 60 (source: settlement.js:RADIO_BASE_SECONDS)
