# Economy Report

## Summary
Analyzed **15** buildings. Season mode: **winter**.
Weights: {"wood":1,"stone":1.3,"scrap":2.2,"planks":4,"metalParts":6,"power":1,"potatoes":0.9,"meat":1.4,"science":2.5}. Targets: 1, 10, 50.
Outliers – too fast: 3, too slow: 14.

## Buildings
| id | category | type | growth | PBT@1 | PBT@10 | PBT@50 | out/s (base) | in/s (base) |
| - | - | - | - | - | - | - | - | - |
| potatoField | Food | production | 1.15 | — | — | — | potatoes:0.375 | - |
| huntersHut | Food | production | 1.15 | 318.45 | 1,134.52 | 300,097.62 | meat:0.15 | - |
| loggingCamp | Raw Materials | production | 1.15 | 165 | 583 | 155,485 | wood:0.25 | - |
| scrapyard | Raw Materials | production | 1.15 | 85.23 | 305.4 | 80,312.5 | scrap:0.08 | - |
| quarry | Raw Materials | production | 1.15 | 372.6 | 1,329.33 | 351,122.6 | stone:0.08 | - |
| sawmill | Construction Materials | processing | 1.15 | 71.67 | 253.67 | 67,534.33 | planks:0.5 | wood:0.8 |
| metalWorkshop | Construction Materials | processing | 1.15 | 98.03 | 348.68 | 92,375.79 | metalParts:0.4 | scrap:0.4 |
| school | Science | production | 1.15 | 48 | 171.2 | 45,233.6 | science:0.5 | - |
| woodGenerator | Energy | production | 1.15 | 84 | 297.07 | 79,156.27 | power:1 | wood:0.25 |
| shelter | Settlement | production | 1.8 | — | — | — | - | - |
| radio | Utilities | production | 1 | — | — | — | - | power:0.1 |
| foodStorage |  | storage | 1.15 | — | — | — | - | - |
| rawStorage |  | storage | 1.15 | — | — | — | - | - |
| materialsDepot |  | storage | 1.15 | — | — | — | - | - |
| battery |  | storage | 1.15 | — | — | — | - | - |

## Converters
| id | growth | in/s | out/s | ratio(out/in) | PBT@1 | PBT@10 | PBT@50 | mode |
| - | - | - | - | - | - | - | - | - |
| sawmill | 1.15 | wood:0.8 | planks:0.5 | 2.5 | 71.67 | 253.67 | 67,534.33 | all-or-nothing |
| metalWorkshop | 1.15 | scrap:0.4 | metalParts:0.4 | 2.73 | 98.03 | 348.68 | 92,375.79 | all-or-nothing |

## Storage
| id | growth | +capacity |
| - | - | - |
| foodStorage | 1.15 | potatoes:300,meat:150 |
| rawStorage | 1.15 | wood:200,stone:80,scrap:120 |
| materialsDepot | 1.15 | planks:150,metalParts:60 |
| battery | 1.15 | power:40 |

## Outliers
### Too Fast
- sawmill @1: 71.67 sec
- school @1: 48 sec
- school @10: 171.2 sec
### Too Slow
- huntersHut @1: 318.45 sec
- huntersHut @10: 1,134.52 sec
- huntersHut @50: 300,097.62 sec
- loggingCamp @1: 165 sec
- loggingCamp @10: 583 sec
- loggingCamp @50: 155,485 sec
- scrapyard @50: 80,312.5 sec
- quarry @1: 372.6 sec
- quarry @10: 1,329.33 sec
- quarry @50: 351,122.6 sec
- sawmill @50: 67,534.33 sec
- metalWorkshop @50: 92,375.79 sec
- school @50: 45,233.6 sec
- woodGenerator @50: 79,156.27 sec

