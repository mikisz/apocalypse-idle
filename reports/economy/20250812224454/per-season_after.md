# Economy Report

## Summary
Analyzed **15** buildings. Season mode: **all**.
Weights: {"wood":1,"stone":1.3,"scrap":2.2,"planks":4,"metalParts":6,"power":1,"potatoes":0.9,"meat":1.4,"science":2.5}. Targets: 1, 10, 50.
Outliers – too fast: 0, too slow: 0.

## Buildings
| id | category | type | growth | PBT@1[spring] | PBT@1[summer] | PBT@1[autumn] | PBT@1[winter] | PBT@10[spring] | PBT@10[summer] | PBT@10[autumn] | PBT@10[winter] | PBT@50[spring] | PBT@50[summer] | PBT@50[autumn] | PBT@50[winter] | out/s (base) | in/s (base) |
| - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - |
| potatoField | Food | production | 1.13 | 40.3 | 50.37 | 59.26 | — | 123.26 | 154.07 | 181.26 | — | 16,073.48 | 20,091.85 | 23,637.47 | — | potatoes:0.375 | - |
| huntersHut | Food | production | 1.15 | 182.84 | 201.13 | 223.48 | 335.21 | 651.4 | 716.54 | 796.16 | 1,194.24 | 172,304.85 | 189,535.34 | 210,594.82 | 315,892.23 | meat:0.19 | - |
| loggingCamp | Raw Materials | production | 1.13 | 100 | 110 | 122.22 | 137.5 | 306.67 | 337.33 | 374.81 | 421.67 | 39,893.33 | 43,882.67 | 48,758.52 | 54,853.33 | wood:0.3 | - |
| scrapyard | Raw Materials | production | 1.13 | 61.98 | 68.18 | 75.76 | 85.23 | 191.12 | 210.23 | 233.59 | 262.78 | 24,726.24 | 27,198.86 | 30,220.96 | 33,998.58 | scrap:0.08 | - |
| quarry | Raw Materials | production | 1.13 | 208.45 | 229.29 | 254.77 | 286.61 | 646.85 | 711.54 | 790.6 | 889.42 | 83,156.27 | 91,471.89 | 101,635.44 | 114,339.87 | stone:0.104 | - |
| sawmill | Construction Materials | processing | 1.13 | 86 | 86 | 86 | 86 | 261.75 | 261.75 | 261.75 | 261.75 | 34,305.08 | 34,305.08 | 34,305.08 | 34,305.08 | planks:0.5 | wood:0.8 |
| metalWorkshop | Construction Materials | processing | 1.13 | 98.03 | 98.03 | 98.03 | 98.03 | 299.67 | 299.67 | 299.67 | 299.67 | 39,102.7 | 39,102.7 | 39,102.7 | 39,102.7 | metalParts:0.4 | scrap:0.4 |
| school | Science | production | 1.13 | 64 | 64 | 64 | 64 | 196 | 196 | 196 | 196 | 25,530.22 | 25,530.22 | 25,530.22 | 25,530.22 | science:0.45 | - |
| woodGenerator | Energy | production | 1.13 | 84 | 84 | 84 | 84 | 255.07 | 255.07 | 255.07 | 255.07 | 33,507.6 | 33,507.6 | 33,507.6 | 33,507.6 | power:1 | wood:0.25 |
| shelter | Settlement | production | 1.8 | — | — | — | — | — | — | — | — | — | — | — | — | - | - |
| radio | Utilities | production | 1 | — | — | — | — | — | — | — | — | — | — | — | — | - | power:0.1 |
| foodStorage |  | storage | 1.2 | — | — | — | — | — | — | — | — | — | — | — | — | - | - |
| rawStorage |  | storage | 1.2 | — | — | — | — | — | — | — | — | — | — | — | — | - | - |
| materialsDepot |  | storage | 1.2 | — | — | — | — | — | — | — | — | — | — | — | — | - | - |
| battery |  | storage | 1.2 | — | — | — | — | — | — | — | — | — | — | — | — | - | - |

## Converters
| id | growth | in/s | out/s | ratio(out/in) | PBT@1 | PBT@10 | PBT@50 | mode |
| - | - | - | - | - | - | - | - | - |
| sawmill | 1.13 | wood:0.8 | planks:0.5 | 2.5 | — | — | — | all-or-nothing |
| metalWorkshop | 1.13 | scrap:0.4 | metalParts:0.4 | 2.73 | — | — | — | all-or-nothing |

## Storage
| id | growth | +capacity |
| - | - | - |
| foodStorage | 1.2 | potatoes:300,meat:150 |
| rawStorage | 1.2 | wood:200,stone:80,scrap:90 |
| materialsDepot | 1.2 | planks:300,metalParts:240 |
| battery | 1.2 | power:600 |

