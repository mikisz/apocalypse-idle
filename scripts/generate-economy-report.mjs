import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

import { BUILDINGS } from '../src/data/buildings.js';
import { RESOURCES } from '../src/data/resources.js';
import {
  initSeasons,
  getSeasonMultiplier,
  SEASON_DURATION,
} from '../src/engine/time.js';
import { CURRENT_SAVE_VERSION } from '../src/engine/persistence.js';
import { defaultState } from '../src/state/defaultState.js';
import { getCapacity } from '../src/state/selectors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function getCommitInfo() {
  try {
    const hash = execSync('git rev-parse HEAD').toString().trim();
    const date = execSync('git show -s --format=%ci HEAD').toString().trim();
    return { hash, date };
  } catch {
    return { hash: 'unknown', date: 'unknown' };
  }
}

const { hash: commitHash, date: commitDate } = getCommitInfo();

const seasons = initSeasons();
const resourceKeys = Object.keys(RESOURCES);

function computeResourceMultiplier(resId, season) {
  const category = RESOURCES[resId]?.category;
  return getSeasonMultiplier(season, category);
}

const seasonData = {};
seasons.forEach((s) => {
  const multipliers = {};
  resourceKeys.forEach((r) => {
    multipliers[r] = computeResourceMultiplier(r, s);
  });
  seasonData[s.id] = { durationSec: SEASON_DURATION, multipliers };
});

const resources = resourceKeys.map((id) => {
  const r = RESOURCES[id];
  return {
    key: id,
    displayName: r.name,
    category: r.category,
    startingAmount: defaultState.resources[id]?.amount ?? 0,
    startingCapacity: getCapacity(defaultState, id),
    unit: null,
  };
});

function buildingType(b) {
  return b.type || (b.capacityAdd ? 'storage' : 'other');
}

function baseProductionPerSec(b) {
  return { ...(b.outputsPerSecBase || {}) };
}

function getBuildingSeasonModifiers(building, season) {
  const outputs = Object.keys(building.outputsPerSecBase || {});
  const res = outputs[0];
  if (!res) return { speed: 1, yield: 1 };
  const category = RESOURCES[res]?.category;
  const mult = getSeasonMultiplier(season, category);
  return { speed: 1, yield: mult };
}

function buildingSeasonMultipliers(b) {
  if (!b.outputsPerSecBase) return {};
  const result = {};
  seasons.forEach((s) => {
    const mods = getBuildingSeasonModifiers(b, s);
    result[s.id] = (mods.yield ?? 1) / (mods.speed ?? 1);
  });
  return result;
}

const buildings = BUILDINGS.map((b) => ({
  id: b.id,
  name: b.name,
  type: buildingType(b),
  constructionCost: { ...b.cost },
  demolitionRefund: 0.5,
  storageProvided: { ...(b.addsCapacity || {}) },
  baseProductionPerSec: baseProductionPerSec(b),
  seasonalMode: b.cycleTimeSec ? 'default' : 'ignore',
  seasonalCustom: null,
  seasonalMultipliers: buildingSeasonMultipliers(b),
}));

const roles = [];

const snapshot = {
  version: commitHash,
  saveVersion: CURRENT_SAVE_VERSION,
  tickSeconds: 1,
  seasons: seasonData,
  resources,
  buildings,
  roles,
  formula: {
    order: ['base', 'season', 'roles', 'sum', 'clamp'],
    demolitionRefund: 0.5,
    clampRule: 'min(value, capacity) and never negative',
  },
  startingState: {
    season: seasons[0].id,
    year: 1,
    resources: Object.fromEntries(
      resources.map((r) => [r.key, r.startingAmount]),
    ),
    buildings: Object.fromEntries(
      BUILDINGS.filter((b) => b.startsWithCount > 0).map((b) => [
        b.id,
        b.startsWithCount,
      ]),
    ),
  },
};

fs.mkdirSync(path.join(repoRoot, 'docs'), { recursive: true });
fs.writeFileSync(
  path.join(repoRoot, 'docs/economy-snapshot.json'),
  JSON.stringify(snapshot, null, 2) + '\n',
);

function formatCost(obj) {
  const entries = Object.entries(obj || {}).filter(([, v]) => v);
  return entries.length
    ? entries.map(([k, v]) => `${k}: ${v}`).join(', ')
    : '-';
}

function formatObj(obj) {
  const entries = Object.entries(obj || {}).filter(([, v]) => v);
  return entries.length
    ? entries
        .map(([k, v]) => `${k}: ${Number(v.toFixed ? v.toFixed(3) : v)}`)
        .join(', ')
    : '-';
}

let md = '';
md += '# Economy Report\n\n';
md += '## 1) Overview\n';
md += `Economy generated from commit **${commitHash}** on ${commitDate}. Save version: **${CURRENT_SAVE_VERSION}**.\n`;
md +=
  'Each tick represents 1 second. For each building: base production is modified by season multipliers, summed, then clamped to capacity. Offline progress processes in 60-second chunks.\n\n';

md += '## 2) Resources\n';
md +=
  '| key | displayName | category | startingAmount | startingCapacity | unit |\n';
md += '| - | - | - | - | - | - |\n';
resources.forEach((r) => {
  md += `| ${r.key} | ${r.displayName} | ${r.category} | ${r.startingAmount} | ${r.startingCapacity} | ${r.unit ?? ''} |\n`;
});
md +=
  '\nGlobal rules: resources cannot go negative; amounts are clamped to capacity.\n\n';

md += '## 3) Seasons and Global Modifiers\n';
md += '| season | duration (sec) |';
resourceKeys.forEach((r) => (md += ` ${r} |`));
md += '\n| - | - |';
resourceKeys.forEach(() => (md += ' - |'));
md += '\n';
seasons.forEach((s) => {
  md += `| ${s.id} | ${seasonData[s.id].durationSec} |`;
  resourceKeys.forEach((r) => {
    md += ` ${seasonData[s.id].multipliers[r].toFixed(3)} |`;
  });
  md += '\n';
});
md += '\n';

md += '## 4) Buildings\n';
md +=
  '| id | name | type | cost | refund | storage | base prod/s | season mults |\n';
md += '| - | - | - | - | - | - | - | - |\n';
BUILDINGS.forEach((b, idx) => {
  const row = buildings[idx];
  md += `| ${row.id} | ${row.name} | ${row.type} | ${formatCost(row.constructionCost)} | ${row.demolitionRefund} | ${formatObj(row.storageProvided)} | ${formatObj(row.baseProductionPerSec)} | ${formatObj(row.seasonalMultipliers)} |\n`;
});
md += '\n';

md += '## 5) Population and Roles\n';
md += 'No role-based production modifiers in effect.\n\n';

md += '## 6) Production Math (Exact Formula)\n';
md += 'Per building per tick:\n\n';
md += '`effectiveCycle = cycleTimeSec * seasonSpeed`\n\n';
md += '`effectiveHarvest = harvestAmount * outputValue * seasonYield`\n\n';
md += '`cycles = floor((elapsed + timer) / effectiveCycle)`\n\n';
md += '`production = effectiveHarvest * count * cycles`\n\n';
md +=
  'Sum production for each resource across buildings, then `clampResource(value, capacity)` where values below 0 become 0 and above capacity become capacity.\n\n';
md += 'Offline progress is applied in 60-second chunks.\n\n';

md += '## 7) Costs, Refunds, and Edge Rules\n';
md +=
  'Building costs scale by `cost * 1.15^count`, rounded up. Demolition refunds 50% of the previous cost (floored) and adds back resources subject to capacity. Resource values are rounded to 6 decimals in clamping and cannot be negative.\n\n';

md += '## 8) Starting State\n';
md += `Starting season: ${seasons[0].id}, Year: 1.\n\n`;
md += '### Resources\n';
md += '| resource | amount | capacity |\n| - | - | - |\n';
resources.forEach((r) => {
  md += `| ${r.key} | ${r.startingAmount} | ${r.startingCapacity} |\n`;
});
md += '\n### Buildings\n';
md += '| building | count |\n| - | - |\n';
BUILDINGS.filter((b) => b.startsWithCount > 0).forEach((b) => {
  md += `| ${b.id} | ${b.startsWithCount} |\n`;
});
md += '\n';

fs.writeFileSync(path.join(repoRoot, 'docs/ECONOMY_REPORT.md'), md);
