# Economy Report

## 1) Overview
Economy generated from commit **8c7304eda7c13985bd2fbb4bf829d7118c52c925** on 2025-08-12 03:40:40 +0200. Save version: **5**.
Each tick represents 1 second. For each building: base production is modified by season multipliers, summed, then clamped to capacity. Offline progress processes in 60-second chunks.

## 2) Resources
| key | displayName | category | startingAmount | startingCapacity | unit |
| - | - | - | - | - | - |
| potatoes | Potatoes | FOOD | 0 | 300 |  |
| wood | Wood | RAW | 0 | 100 |  |
| stone | Stone | RAW | 0 | 100 |  |
| scrap | Scrap | RAW | 0 | 100 |  |
| planks | Planks | CONSTRUCTION_MATERIALS | 0 | 50 |  |
| metalParts | Metal Parts | CONSTRUCTION_MATERIALS | 0 | 20 |  |
| science | Science | SOCIETY | 0 | 400 |  |
| power | Power | ENERGY | 0 | 2 |  |

## 3) Seasons
| season | duration (sec) | potatoes | wood | stone | scrap | planks | metalParts | science | power |
| - | - | - | - | - | - | - | - | - | - |
| spring | 270 | 1.250 | 1.100 | 1.100 | 1.100 | 1.000 | 1.000 | 1.000 | 1.000 |
| summer | 270 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 |
| autumn | 270 | 0.850 | 0.900 | 0.900 | 0.900 | 1.000 | 1.000 | 1.000 | 1.000 |
| winter | 270 | 0.000 | 0.800 | 0.800 | 0.800 | 1.000 | 1.000 | 1.000 | 1.000 |

## 4) Buildings
| id | name | type | cost | refund | storage | base prod/s | inputs per sec | season mults |
| - | - | - | - | - | - | - | - | - |
| potatoField | Potato Field | production | wood: 15 | 0.5 | - | potatoes: 0.375 | - | spring: 1.25, summer: 1, autumn: 0.85, winter: 0 |
| loggingCamp | Logging Camp | production | scrap: 15 | 0.5 | - | wood: 0.25 | - | spring: 1.1, summer: 1, autumn: 0.9, winter: 0.8 |
| scrapyard | Scrap Yard | production | wood: 12 | 0.5 | - | scrap: 0.08 | - | spring: 1.1, summer: 1, autumn: 0.9, winter: 0.8 |
| quarry | Quarry | production | wood: 20, scrap: 5 | 0.5 | - | stone: 0.08 | - | spring: 1.1, summer: 1, autumn: 0.9, winter: 0.8 |
| sawmill | Sawmill | processing | wood: 40, scrap: 15, stone: 10 | 0.5 | - | planks: 0.5 | wood: 0.8 | spring: 1, summer: 1, autumn: 1, winter: 1 |
| metalWorkshop | Metal Workshop | processing | wood: 30, scrap: 30, stone: 10, planks: 10 | 0.5 | - | metalParts: 0.4 | scrap: 0.4 | spring: 1, summer: 1, autumn: 1, winter: 1 |
| school | School | production | wood: 25, scrap: 10, stone: 10 | 0.5 | - | science: 0.5 | - | spring: 1, summer: 1, autumn: 1, winter: 1 |
| woodGenerator | Wood Generator | production | wood: 50, stone: 10 | 0.5 | - | power: 1 | wood: 0.25 | spring: 1, summer: 1, autumn: 1, winter: 1 |
| shelter | Shelter | production | wood: 30, scrap: 10 | 0.5 | - | - | - | - |
| radio | Radio | production | wood: 80, scrap: 40, stone: 20 | 0.5 | - | - | power: 0.1 | - |
| foodStorage | Granary | storage | wood: 20, scrap: 5, stone: 5 | 0.5 | potatoes: 300 | - | - | - |
| rawStorage | Warehouse | storage | wood: 25, scrap: 10, stone: 10 | 0.5 | wood: 200, stone: 80, scrap: 120 | - | - | - |
| materialsDepot | Materials Depot | storage | wood: 25, scrap: 10, stone: 5 | 0.5 | planks: 150, metalParts: 60 | - | - | - |
| battery | Battery | storage | wood: 40, stone: 20 | 0.5 | power: 40 | - | - | - |

## 5) Research
| id | name | science cost | time (sec) | prereqs | unlocks |
| - | - | - | - | - | - |
| basicEnergy | Basic Energy | 80 | 120 | industry1 | resources: power; buildings: woodGenerator, battery; categories: Energy |
| industry1 | Industry I | 60 | 90 | - | resources: planks, metalParts; buildings: sawmill, metalWorkshop, materialsDepot; categories: CONSTRUCTION_MATERIALS |
| radio | Radio | 120 | 180 | industry1, basicEnergy | buildings: radio |
| woodworking1 | Woodworking I | 50 | 70 | industry1 | effects: { category=WOOD, percent=5.0%, type=output } |
| salvaging1 | Salvaging I | 50 | 70 | industry1 | effects: { category=SCRAP, percent=5.0%, type=output } |
| logistics1 | Logistics I | 60 | 90 | industry1 | effects: { category=RAW, percent=5.0%, type=storage }, { category=CONSTRUCTION_MATERIALS, percent=5.0%, type=storage } |
| industry2 | Industry II | 200 | 240 | industry1 | buildings: toolsmithy |
| woodworking2 | Woodworking II | 110 | 180 | woodworking1, industry2 | effects: { category=WOOD, percent=5.0%, type=output } |
| salvaging2 | Salvaging II | 110 | 180 | salvaging1, industry2 | effects: { category=SCRAP, percent=5.0%, type=output } |
| logistics2 | Logistics II | 120 | 210 | logistics1, industry2 | effects: { category=RAW, percent=5.0%, type=storage }, { category=CONSTRUCTION_MATERIALS, percent=5.0%, type=storage } |

## 6) Roles
| id | name | resource | building |
| - | - | - | - |
| farmer | Farmer | potatoes | potatoField |
| woodcutter | Woodcutter | wood | loggingCamp |
| scavenger | Scavenger | scrap | scrapyard |
| quarryWorker | Quarry Worker | stone | quarry |
| scientist | Scientist | science | school |

## 7) Starting State
Starting season: spring, Year: 1.

### Resources
| resource | amount | capacity |
| - | - | - |
| potatoes | 0 | 300 |
| wood | 0 | 100 |
| stone | 0 | 100 |
| scrap | 0 | 100 |
| planks | 0 | 50 |
| metalParts | 0 | 20 |
| science | 0 | 400 |
| power | 0 | 2 |

### Buildings
| building | count |
| - | - |
| potatoField | 2 |
| loggingCamp | 1 |

