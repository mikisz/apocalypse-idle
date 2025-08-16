# Economy Report

## Summary
Analyzed **20** buildings. Season mode: **winter**.
Weights: {"wood":1,"stone":1.3,"scrap":2.2,"planks":4,"metalParts":6,"power":1,"potatoes":0.9,"meat":1.4,"science":2.5}. Targets: 1, 10, 50.
Outliers – too fast: 0, too slow: 15.

## Buildings
| id | category | type | growth | PBT@1 | PBT@10 | PBT@50 | out/s (base) | in/s (base) |
| - | - | - | - | - | - | - | - | - |
| potatoField | Food | production | 1.12 | — | — | — | potatoes:0.375 | - |
| huntersHut | Food | production | 1.15 | 289.5 | 1,031.39 | 272,816.02 | meat:0.22 | - |
| loggingCamp | Raw Materials | production | 1.12 | 137.5 | 385 | 35,484.17 | wood:0.3 | - |
| scrapyard | Raw Materials | production | 1.12 | 85.23 | 241.48 | 21,995.74 | scrap:0.08 | - |
| quarry | Raw Materials | production | 1.12 | 248.4 | 695.51 | 64,112.18 | stone:0.12 | - |
| brickKiln | Construction Materials | processing | 1.13 | — | — | — | bricks:0.4 | stone:0.4,wood:0.3 |
| sawmill | Construction Materials | processing | 1.13 | 94.92 | 288.5 | 37,862 | planks:0.5 | wood:0.8 |
| metalWorkshop | Construction Materials | processing | 1.13 | 98.03 | 299.67 | 39,102.7 | metalParts:0.4 | scrap:0.4 |
| toolsmithy | Construction Materials | processing | 1.13 | — | — | — | tools:0.18 | planks:0.25,metalParts:0.15,power:0.4 |
| school | Science | production | 1.13 | 64 | 196 | 25,530.22 | science:0.45 | - |
| woodGenerator | Energy | production | 1.13 | 270.67 | 828.4 | 107,968.93 | power:1 | wood:0.25 |
| shelter | Settlement | production | 1.8 | — | — | — | - | - |
| radio | Utilities | production | 1 | — | — | — | - | power:0.1 |
| foodStorage |  | storage | 1.22 | — | — | — | - | - |
| largeGranary |  | storage | 1.15 | — | — | — | - | - |
| rawStorage |  | storage | 1.22 | — | — | — | - | - |
| largeWarehouse |  | storage | 1.15 | — | — | — | - | - |
| materialsDepot |  | storage | 1.22 | — | — | — | - | - |
| largeMaterialsDepot |  | storage | 1.15 | — | — | — | - | - |
| battery |  | storage | 1.22 | — | — | — | - | - |

## Converters
| id | growth | in/s | out/s | ratio(out/in) | PBT@1 | PBT@10 | PBT@50 | mode |
| - | - | - | - | - | - | - | - | - |
| brickKiln | 1.13 | stone:0.4,wood:0.3 | bricks:0.4 | 0 | — | — | — | all-or-nothing |
| sawmill | 1.13 | wood:0.8 | planks:0.5 | 2.5 | 94.92 | 288.5 | 37,862 | all-or-nothing |
| metalWorkshop | 1.13 | scrap:0.4 | metalParts:0.4 | 2.73 | 98.03 | 299.67 | 39,102.7 | all-or-nothing |
| toolsmithy | 1.13 | planks:0.25,metalParts:0.15,power:0.4 | tools:0.18 | 0 | — | — | — | all-or-nothing |

## Storage
| id | growth | +capacity |
| - | - | - |
| foodStorage | 1.22 | FOOD:225 |
| largeGranary | 1.15 | FOOD:600 |
| rawStorage | 1.22 | wood:120,scrap:80,stone:60 |
| largeWarehouse | 1.15 | wood:400,stone:160,scrap:240 |
| materialsDepot | 1.22 | planks:100,metalParts:40 |
| largeMaterialsDepot | 1.15 | planks:180,metalParts:90,bricks:180 |
| battery | 1.22 | power:40 |

## Outliers
### Too Slow
- huntersHut @1: 289.5 sec
- huntersHut @10: 1,031.39 sec
- huntersHut @50: 272,816.02 sec
- loggingCamp @1: 137.5 sec
- loggingCamp @50: 35,484.17 sec
- scrapyard @50: 21,995.74 sec
- quarry @1: 248.4 sec
- quarry @10: 695.51 sec
- quarry @50: 64,112.18 sec
- sawmill @50: 37,862 sec
- metalWorkshop @50: 39,102.7 sec
- school @50: 25,530.22 sec
- woodGenerator @1: 270.67 sec
- woodGenerator @10: 828.4 sec
- woodGenerator @50: 107,968.93 sec

