# Economy Report

## 1) Overview
Economy generated from commit **c11326f359c9175a01416a829276595fd60e647e** on 2025-08-14 03:05:50 +0200. Save version: **7**.
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
| brickKiln | Brick Kiln | processing | {"wood":35,"stone":25,"scrap":10} | 1.13 | 0.5 | - | {"bricks":0.4} | {"stone":0.4,"wood":0.3} | masonry1 | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[5] |
| sawmill | Sawmill | processing | {"wood":53,"scrap":20,"stone":13} | 1.13 | 0.5 | - | {"planks":0.5} | {"wood":0.8} | industry1 | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[6] |
| metalWorkshop | Metal Workshop | processing | {"wood":30,"scrap":30,"stone":10,"planks":10} | 1.13 | 0.5 | - | {"metalParts":0.4} | {"scrap":0.4} | industry1 | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[7] |
| toolsmithy | Toolsmithy | processing | {"wood":50,"scrap":30,"stone":20,"planks":25,"metalParts":15} | 1.13 | 0.5 | - | {"tools":0.18} | {"planks":0.25,"metalParts":0.15,"power":0.4} | industry2 | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[8] |
| school | School | production | {"wood":30,"scrap":12,"stone":12} | 1.13 | 0.5 | - | {"science":0.45} | - | - | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[9] |
| woodGenerator | Wood Generator | production | {"wood":50,"stone":10,"planks":20,"metalParts":10} | 1.13 | 0.5 | - | {"power":1} | {"wood":0.25} | basicEnergy | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[10] |
| shelter | Shelter | production | {"wood":30,"scrap":10} | 1.8 | 0.5 | - | - | - | - | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[11] |
| radio | Radio | production | {"wood":80,"scrap":40,"stone":20,"planks":20,"metalParts":10} | 1 | 0.5 | - | - | {"power":0.1} | radio | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[12] |
| foodStorage | Granary | storage | {"wood":20,"scrap":5,"stone":5} | 1.22 | 0.5 | {"FOOD":225} | - | - | - | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[13] |
| largeGranary | Large Granary | storage | {"wood":35,"stone":20,"bricks":20} | 1.15 | 0.5 | {"FOOD":600} | - | - | masonry2 | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[14] |
| rawStorage | Warehouse | storage | {"wood":25,"scrap":10,"stone":10} | 1.22 | 0.5 | {"wood":120,"scrap":80,"stone":60} | - | - | - | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[15] |
| largeWarehouse | Large Warehouse | storage | {"wood":40,"stone":30,"bricks":20} | 1.15 | 0.5 | {"wood":400,"stone":160,"scrap":240} | - | - | masonry2 | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[16] |
| materialsDepot | Materials Depot | storage | {"wood":25,"scrap":10,"stone":5} | 1.22 | 0.5 | {"planks":100,"metalParts":40} | - | - | industry1 | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[17] |
| largeMaterialsDepot | Large Materials Depot | storage | {"wood":35,"bricks":25,"scrap":15} | 1.15 | 0.5 | {"planks":180,"metalParts":90,"bricks":180} | - | - | masonry2 | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[18] |
| battery | Battery | storage | {"wood":40,"stone":20,"planks":20,"metalParts":10} | 1.22 | 0.5 | {"power":40} | - | - | basicEnergy | {"spring":1,"summer":1,"autumn":1,"winter":1} | buildings.js:BUILDINGS[19] |

## 5) Research
| id | name | science cost | time (sec) | prereqs | milestones | unlocks | effects | source |
| - | - | - | - | - | - | - | - | - |
| industry1 | Industry I | 60 | 120 | - | - | {"resources":["planks","metalParts"],"buildings":["sawmill","metalWorkshop","materialsDepot"],"categories":["CONSTRUCTION_MATERIALS"]} | - | research.js:RESEARCH[0] |
| woodworking1 | Woodworking I | 60 | 90 | industry1 | - | {"resources":[],"buildings":[],"categories":[]} | [{"category":"WOOD","percent":0.05,"type":"output"}] | research.js:RESEARCH[1] |
| salvaging1 | Salvaging I | 60 | 90 | industry1 | - | {"resources":[],"buildings":[],"categories":[]} | [{"category":"SCRAP","percent":0.05,"type":"output"}] | research.js:RESEARCH[2] |
| logistics1 | Logistics I | 60 | 90 | industry1 | - | {"resources":[],"buildings":[],"categories":[]} | [{"category":"RAW","percent":0.05,"type":"storage"},{"category":"CONSTRUCTION_MATERIALS","percent":0.05,"type":"storage"}] | research.js:RESEARCH[3] |
| masonry1 | Masonry I | 90 | 150 | industry1 | - | {"resources":["bricks"],"buildings":["brickKiln"],"categories":[]} | - | research.js:RESEARCH[4] |
| industry2 | Industry II | 200 | 240 | woodworking1, salvaging1, logistics1 | {"produced":{"planks":50,"metalParts":30}} | {"resources":[],"buildings":["toolsmithy"],"categories":[]} | - | research.js:RESEARCH[5] |
| industryProduction | Industry Production | 170 | 270 | woodworking1, salvaging1, logistics1 | - | {"resources":[],"buildings":[],"categories":[]} | [{"category":"CONSTRUCTION_MATERIALS","percent":0.05,"type":"output"}] | research.js:RESEARCH[6] |
| masonry2 | Masonry II | 140 | 210 | masonry1, logistics1 | - | {"resources":[],"buildings":["largeWarehouse","largeGranary","largeMaterialsDepot"],"categories":[]} | - | research.js:RESEARCH[7] |
| woodworking2 | Woodworking II | 220 | 360 | industry2, industryProduction, woodworking1, salvaging1, logistics1 | - | {"resources":[],"buildings":[],"categories":[]} | [{"category":"WOOD","percent":0.05,"type":"output"}] | research.js:RESEARCH[8] |
| salvaging2 | Salvaging II | 220 | 360 | industry2, industryProduction, woodworking1, salvaging1, logistics1 | - | {"resources":[],"buildings":[],"categories":[]} | [{"category":"SCRAP","percent":0.05,"type":"output"}] | research.js:RESEARCH[9] |
| logistics2 | Logistics II | 230 | 360 | industry2, industryProduction, woodworking1, salvaging1, logistics1 | - | {"resources":[],"buildings":[],"categories":[]} | [{"category":"RAW","percent":0.05,"type":"storage"},{"category":"CONSTRUCTION_MATERIALS","percent":0.05,"type":"storage"}] | research.js:RESEARCH[10] |
| basicEnergy | Basic Energy | 150 | 210 | industry2 | - | {"resources":["power"],"buildings":["woodGenerator","battery"],"categories":["Energy"]} | - | research.js:RESEARCH[11] |
| radio | Radio | 150 | 240 | basicEnergy | - | {"resources":[],"buildings":["radio"],"categories":[]} | - | research.js:RESEARCH[12] |
| food1 | Food I | 50 | 90 | - | - | {"resources":[],"buildings":[],"categories":[]} | - | research.js:RESEARCH[13] |
| huntingHut | Hunting Hut | 60 | 90 | food1 | - | {"resources":["meat"],"buildings":["huntersHut"],"categories":[]} | - | research.js:RESEARCH[14] |
| food2 | Food II | 150 | 240 | huntingHut | - | {"resources":[],"buildings":[],"categories":[]} | [{"resource":"meat","percent":0.04,"type":"output"}] | research.js:RESEARCH[15] |

## 6) Roles
| id | name | skill | resources | buildings | source |
| - | - | - | - | - | - |
| farmer | Farmer | Farming | potatoes | potatoField | roles.js:ROLES.farmer |
| hunter | Hunter | Hunting | meat | huntersHut | roles.js:ROLES.hunter |
| gatherer | Gatherer | Gathering | wood, scrap, stone | loggingCamp, scrapyard, quarry | roles.js:ROLES.gatherer |
| carpenter | Carpenter | Carpentry | planks | sawmill | roles.js:ROLES.carpenter |
| metalworker | Metalworker | Metalworking | metalParts | metalWorkshop | roles.js:ROLES.metalworker |
| mason | Mason | Masonry | bricks | brickKiln | roles.js:ROLES.mason |
| toolsmith | Toolsmith | Toolsmithing | tools | toolsmithy | roles.js:ROLES.toolsmith |
| engineer | Engineer | Engineering | power | woodGenerator | roles.js:ROLES.engineer |
| scientist | Scientist | Scientist | science | school | roles.js:ROLES.scientist |

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
