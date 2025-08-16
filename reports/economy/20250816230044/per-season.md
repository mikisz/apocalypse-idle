# Economy Report

## Summary
Analyzed **20** buildings. Season mode: **all**.
Weights: {"wood":1,"stone":1.3,"scrap":2.2,"planks":4,"metalParts":6,"power":1,"potatoes":0.9,"meat":1.4,"science":2.5}. Targets: 1, 10, 50.
Outliers – too fast: 0, too slow: 0.

## Buildings
| id | category | type | growth | PBT@1[spring] | PBT@1[summer] | PBT@1[autumn] | PBT@1[winter] | PBT@10[spring] | PBT@10[summer] | PBT@10[autumn] | PBT@10[winter] | PBT@50[spring] | PBT@50[summer] | PBT@50[autumn] | PBT@50[winter] | out/s (base) | in/s (base) |
| - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - |
| potatoField | Food | production | 1.12 | 40.3 | 50.37 | 59.26 | — | 113.78 | 142.22 | 167.32 | — | 10,398.81 | 12,998.52 | 15,292.37 | — | potatoes:0.375 | - |
| huntersHut | Food | production | 1.15 | 157.91 | 173.7 | 193 | 289.5 | 562.57 | 618.83 | 687.59 | 1,031.39 | 148,808.74 | 163,689.61 | 181,877.34 | 272,816.02 | meat:0.22 | - |
| loggingCamp | Raw Materials | production | 1.12 | 100 | 110 | 122.22 | 137.5 | 280 | 308 | 342.22 | 385 | 25,806.67 | 28,387.33 | 31,541.48 | 35,484.17 | wood:0.3 | - |
| scrapyard | Raw Materials | production | 1.12 | 61.98 | 68.18 | 75.76 | 85.23 | 175.62 | 193.18 | 214.65 | 241.48 | 15,996.9 | 17,596.59 | 19,551.77 | 21,995.74 | scrap:0.08 | - |
| quarry | Raw Materials | production | 1.12 | 180.65 | 198.72 | 220.8 | 248.4 | 505.83 | 556.41 | 618.23 | 695.51 | 46,627.04 | 51,289.74 | 56,988.6 | 64,112.18 | stone:0.12 | - |
| brickKiln | Construction Materials | processing | 1.13 | — | — | — | — | — | — | — | — | — | — | — | — | bricks:0.4 | stone:0.4,wood:0.3 |
| sawmill | Construction Materials | processing | 1.13 | 94.92 | 94.92 | 94.92 | 94.92 | 288.5 | 288.5 | 288.5 | 288.5 | 37,862 | 37,862 | 37,862 | 37,862 | planks:0.5 | wood:0.8 |
| metalWorkshop | Construction Materials | processing | 1.13 | 98.03 | 98.03 | 98.03 | 98.03 | 299.67 | 299.67 | 299.67 | 299.67 | 39,102.7 | 39,102.7 | 39,102.7 | 39,102.7 | metalParts:0.4 | scrap:0.4 |
| toolsmithy | Construction Materials | processing | 1.13 | — | — | — | — | — | — | — | — | — | — | — | — | tools:0.18 | planks:0.25,metalParts:0.15,power:0.4 |
| school | Science | production | 1.13 | 64 | 64 | 64 | 64 | 196 | 196 | 196 | 196 | 25,530.22 | 25,530.22 | 25,530.22 | 25,530.22 | science:0.45 | - |
| woodGenerator | Energy | production | 1.13 | 270.67 | 270.67 | 270.67 | 270.67 | 828.4 | 828.4 | 828.4 | 828.4 | 107,968.93 | 107,968.93 | 107,968.93 | 107,968.93 | power:1 | wood:0.25 |
| shelter | Settlement | production | 1.8 | — | — | — | — | — | — | — | — | — | — | — | — | - | - |
| radio | Utilities | production | 1 | — | — | — | — | — | — | — | — | — | — | — | — | - | power:0.1 |
| foodStorage |  | storage | 1.22 | — | — | — | — | — | — | — | — | — | — | — | — | - | - |
| largeGranary |  | storage | 1.15 | — | — | — | — | — | — | — | — | — | — | — | — | - | - |
| rawStorage |  | storage | 1.22 | — | — | — | — | — | — | — | — | — | — | — | — | - | - |
| largeWarehouse |  | storage | 1.15 | — | — | — | — | — | — | — | — | — | — | — | — | - | - |
| materialsDepot |  | storage | 1.22 | — | — | — | — | — | — | — | — | — | — | — | — | - | - |
| largeMaterialsDepot |  | storage | 1.15 | — | — | — | — | — | — | — | — | — | — | — | — | - | - |
| battery |  | storage | 1.22 | — | — | — | — | — | — | — | — | — | — | — | — | - | - |

## Converters
| id | growth | in/s | out/s | ratio(out/in) | PBT@1 | PBT@10 | PBT@50 | mode |
| - | - | - | - | - | - | - | - | - |
| brickKiln | 1.13 | stone:0.4,wood:0.3 | bricks:0.4 | 0 | — | — | — | all-or-nothing |
| sawmill | 1.13 | wood:0.8 | planks:0.5 | 2.5 | — | — | — | all-or-nothing |
| metalWorkshop | 1.13 | scrap:0.4 | metalParts:0.4 | 2.73 | — | — | — | all-or-nothing |
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

