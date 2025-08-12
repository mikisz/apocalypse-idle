# Economy Report

## Summary
Analyzed **15** buildings. Season mode: **all**.
Weights: {"wood":1,"stone":1.3,"scrap":2.2,"planks":4,"metalParts":6,"power":1,"potatoes":0.9,"meat":1.4,"science":2.5}. Targets: 1, 10, 50.
Outliers – too fast: 0, too slow: 0.

## Buildings
| id | category | type | growth | PBT@1[spring] | PBT@1[summer] | PBT@1[autumn] | PBT@1[winter] | PBT@10[spring] | PBT@10[summer] | PBT@10[autumn] | PBT@10[winter] | PBT@50[spring] | PBT@50[summer] | PBT@50[autumn] | PBT@50[winter] | out/s (base) | in/s (base) |
| - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - |
| potatoField | Food | production | 1.15 | 35.56 | 44.44 | 52.29 | — | 125.63 | 157.04 | 184.75 | — | 33,505.19 | 41,881.48 | 49,272.33 | — | potatoes:0.375 | - |
| huntersHut | Food | production | 1.15 | 231.6 | 254.76 | 283.07 | 318.45 | 825.11 | 907.62 | 1,008.47 | 1,134.52 | 218,252.81 | 240,078.1 | 266,753.44 | 300,097.62 | meat:0.15 | - |
| loggingCamp | Raw Materials | production | 1.15 | 120 | 132 | 146.67 | 165 | 424 | 466.4 | 518.22 | 583 | 113,080 | 124,388 | 138,208.89 | 155,485 | wood:0.25 | - |
| scrapyard | Raw Materials | production | 1.15 | 61.98 | 68.18 | 75.76 | 85.23 | 222.11 | 244.32 | 271.46 | 305.4 | 58,409.09 | 64,250 | 71,388.89 | 80,312.5 | scrap:0.08 | - |
| quarry | Raw Materials | production | 1.15 | 270.98 | 298.08 | 331.2 | 372.6 | 966.78 | 1,063.46 | 1,181.62 | 1,329.33 | 255,361.89 | 280,898.08 | 312,108.97 | 351,122.6 | stone:0.08 | - |
| sawmill | Construction Materials | processing | 1.15 | 71.67 | 71.67 | 71.67 | 71.67 | 253.67 | 253.67 | 253.67 | 253.67 | 67,534.33 | 67,534.33 | 67,534.33 | 67,534.33 | planks:0.5 | wood:0.8 |
| metalWorkshop | Construction Materials | processing | 1.15 | 98.03 | 98.03 | 98.03 | 98.03 | 348.68 | 348.68 | 348.68 | 348.68 | 92,375.79 | 92,375.79 | 92,375.79 | 92,375.79 | metalParts:0.4 | scrap:0.4 |
| school | Science | production | 1.15 | 48 | 48 | 48 | 48 | 171.2 | 171.2 | 171.2 | 171.2 | 45,233.6 | 45,233.6 | 45,233.6 | 45,233.6 | science:0.5 | - |
| woodGenerator | Energy | production | 1.15 | 84 | 84 | 84 | 84 | 297.07 | 297.07 | 297.07 | 297.07 | 79,156.27 | 79,156.27 | 79,156.27 | 79,156.27 | power:1 | wood:0.25 |
| shelter | Settlement | production | 1.8 | — | — | — | — | — | — | — | — | — | — | — | — | - | - |
| radio | Utilities | production | 1 | — | — | — | — | — | — | — | — | — | — | — | — | - | power:0.1 |
| foodStorage |  | storage | 1.15 | — | — | — | — | — | — | — | — | — | — | — | — | - | - |
| rawStorage |  | storage | 1.15 | — | — | — | — | — | — | — | — | — | — | — | — | - | - |
| materialsDepot |  | storage | 1.15 | — | — | — | — | — | — | — | — | — | — | — | — | - | - |
| battery |  | storage | 1.15 | — | — | — | — | — | — | — | — | — | — | — | — | - | - |

## Converters
| id | growth | in/s | out/s | ratio(out/in) | PBT@1 | PBT@10 | PBT@50 | mode |
| - | - | - | - | - | - | - | - | - |
| sawmill | 1.15 | wood:0.8 | planks:0.5 | 2.5 | — | — | — | all-or-nothing |
| metalWorkshop | 1.15 | scrap:0.4 | metalParts:0.4 | 2.73 | — | — | — | all-or-nothing |

## Storage
| id | growth | +capacity |
| - | - | - |
| foodStorage | 1.15 | potatoes:300,meat:150 |
| rawStorage | 1.15 | wood:200,stone:80,scrap:120 |
| materialsDepot | 1.15 | planks:150,metalParts:60 |
| battery | 1.15 | power:40 |

