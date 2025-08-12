# Economy Report

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

