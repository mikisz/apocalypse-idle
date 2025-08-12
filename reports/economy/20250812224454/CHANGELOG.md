# Changelog

## Buildings
- buildings.potatoField.costBase.wood 15→17 – PBT@1 too fast
- buildings.potatoField.costGrowth 1.15→1.13 – PBT@50 too high
- buildings.huntersHut.outputsPerSecBase.meat 0.15→0.19 – PBT@1 too slow
- buildings.huntersHut.seasonProfile.winter 0.8→0.6 – winter pressure
- buildings.loggingCamp.outputsPerSecBase.wood 0.25→0.3 – PBT@1 too slow
- buildings.loggingCamp.costGrowth 1.15→1.13 – PBT@50 too high
- buildings.scrapyard.costGrowth 1.15→1.13 – PBT@50 too high
- buildings.quarry.outputsPerSecBase.stone 0.08→0.104 – PBT@1 too slow
- buildings.quarry.costGrowth 1.15→1.13 – PBT@50 too high
- buildings.sawmill.costBase {wood:40, scrap:15, stone:10}→{48,18,12} – PBT@1 too fast
- buildings.sawmill.costGrowth 1.15→1.13 – PBT@50 too high
- buildings.metalWorkshop.costGrowth 1.15→1.13 – PBT@50 too high
- buildings.school.outputsPerSecBase.science 0.5→0.45 and costBase {25,10,10}→{30,12,12} – PBT@1 too fast
- buildings.school.costGrowth 1.15→1.13 – PBT@50 too high
- buildings.woodGenerator.costGrowth 1.15→1.13 – PBT@50 too high
- buildings.radio.costBase +planks:20 – tie to industry
- buildings.foodStorage.costGrowth 1.15→1.2 – storage growth
- buildings.rawStorage.costGrowth 1.15→1.2 – storage growth
- buildings.rawStorage.capacityAdd.scrap 120→90 – storage buffer
- buildings.materialsDepot.costGrowth 1.15→1.2 – storage growth
- buildings.materialsDepot.capacityAdd.planks 150→300, metalParts 60→240 – storage buffer
- buildings.battery.costGrowth 1.15→1.2 – storage growth
- buildings.battery.capacityAdd.power 40→600 – storage buffer

## Resources
- resources.potatoes.startingCapacity 300→450 – 10m buffer
- resources.meat.startingCapacity 300→150 – storage tightening
- resources.wood.startingCapacity 100→150 – 10m buffer
- resources.stone.startingCapacity 100→80 – storage tightening
- resources.scrap.startingCapacity 100→80 – storage tightening

## Research
- research.hunting1 cost 35→50, time 45→90 – timing
- research.radio cost 120→150, time 180→240 – mid-tier timing
- research.woodworking1 cost 50→60, time 70→90 – timing
- research.salvaging1 cost 50→60, time 70→90 – timing
- research.woodworking2 cost 110→140, time 180→240 – mid-tier timing
- research.salvaging2 cost 110→140, time 180→240 – mid-tier timing
- research.logistics2 cost 120→150, time 210→270 – mid-tier timing
- Added research.hunting2 (+10% FOOD output) – food boost
- Added research.industryProduction (+10% construction materials output) – industry boost

## Balance
- ROLE_BONUS_PER_SETTLER now 0.02*level up to 0.2 +0.01*(level-10) – normalize role bonuses

## Settlement
- RADIO_BASE_SECONDS 60→120 – slower settler inflow

## Tests
- Updated tests for new hunter output and research timing

