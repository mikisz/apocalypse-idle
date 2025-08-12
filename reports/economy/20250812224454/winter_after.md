# Economy Report

## Summary
Analyzed **15** buildings. Season mode: **winter**.
Weights: {"wood":1,"stone":1.3,"scrap":2.2,"planks":4,"metalParts":6,"power":1,"potatoes":0.9,"meat":1.4,"science":2.5}. Targets: 1, 10, 50.
Outliers – too fast: 1, too slow: 13.

## Buildings
| id | category | type | growth | PBT@1 | PBT@10 | PBT@50 | out/s (base) | in/s (base) |
| - | - | - | - | - | - | - | - | - |
| potatoField | Food | production | 1.13 | — | — | — | potatoes:0.375 | - |
| huntersHut | Food | production | 1.15 | 335.21 | 1,194.24 | 315,892.23 | meat:0.19 | - |
| loggingCamp | Raw Materials | production | 1.13 | 137.5 | 421.67 | 54,853.33 | wood:0.3 | - |
| scrapyard | Raw Materials | production | 1.13 | 85.23 | 262.78 | 33,998.58 | scrap:0.08 | - |
| quarry | Raw Materials | production | 1.13 | 286.61 | 889.42 | 114,339.87 | stone:0.104 | - |
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
- huntersHut @1: 335.21 sec
- huntersHut @10: 1,194.24 sec
- huntersHut @50: 315,892.23 sec
- loggingCamp @1: 137.5 sec
- loggingCamp @50: 54,853.33 sec
- scrapyard @50: 33,998.58 sec
- quarry @1: 286.61 sec
- quarry @10: 889.42 sec
- quarry @50: 114,339.87 sec
- sawmill @50: 34,305.08 sec
- metalWorkshop @50: 39,102.7 sec
- school @50: 25,530.22 sec
- woodGenerator @50: 33,507.6 sec

