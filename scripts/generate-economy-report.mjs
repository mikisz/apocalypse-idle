import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

import { BUILDINGS, getBuildingCost } from '../src/data/buildings.js';
import { RESOURCES } from '../src/data/resources.js';
import { RESEARCH } from '../src/data/research.js';
import { ROLE_LIST } from '../src/data/roles.js';
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
    unit: r.unit ?? null,
  };
});

function buildingType(b) {
  return b.type || (b.capacityAdd ? 'storage' : 'other');
}

function baseProductionPerSec(b) {
  return { ...(b.outputsPerSecBase || {}) };
}

function baseInputsPerSec(b) {
  return { ...(b.inputsPerSecBase || {}) };
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
  constructionCost: getBuildingCost(b, 0),
  demolitionRefund: b.refund ?? 0,
  storageProvided: { ...(b.capacityAdd || {}) },
  baseProductionPerSec: baseProductionPerSec(b),
  baseInputsPerSec: baseInputsPerSec(b),
  seasonalMultipliers: buildingSeasonMultipliers(b),
}));
const roles = ROLE_LIST.map((r) => ({
  id: r.id,
  name: r.name,
  resource: r.resource,
  building: r.building,
}));

const research = RESEARCH.map((r) => ({
  id: r.id,
  name: r.name,
  scienceCost: r.cost?.science ?? 0,
  timeSec: r.timeSec,
  prereqs: r.prereqs,
  ...(r.unlocks ? { unlocks: r.unlocks } : {}),
  ...(r.effects ? { effects: r.effects } : {}),
}));

const startingResources = Object.fromEntries(
  resources.map((r) => [r.key, { amount: r.startingAmount, capacity: r.startingCapacity }]),
);

const startingBuildings = Object.fromEntries(
  Object.entries(defaultState.buildings).map(([id, info]) => [id, info.count || 0]),
);

const snapshot = {
  version: commitHash,
  saveVersion: CURRENT_SAVE_VERSION,
  tickSeconds: 1,
  seasons: seasonData,
  resources,
  buildings,
  research,
  roles,
  formula: {
    order: ['base', 'season', 'roles', 'sum', 'clamp'],
    demolitionRefund: 0.5,
    clampRule: 'min(value, capacity) and never negative',
  },
  startingState: {
    season: seasons[0].id,
    year: 1,
  },
  startingResources,
  startingBuildings,
};

fs.mkdirSync(path.join(repoRoot, 'docs'), { recursive: true });
fs.writeFileSync(
  path.join(repoRoot, 'docs/economy-snapshot.json'),
  JSON.stringify(snapshot, null, 2) + '\n',
);

function formatCost(obj) {
  const entries = Object.entries(obj || {}).filter(([, v]) => v != null);
  return entries.length
    ? entries.map(([k, v]) => `${k}: ${v}`).join(', ')
    : '-';
}

function formatObj(obj) {
  const entries = Object.entries(obj || {}).filter(([, v]) => v != null);
  return entries.length
    ? entries
        .map(([k, v]) => `${k}: ${Number(v.toFixed ? v.toFixed(3) : v)}`)
        .join(', ')
    : '-';
}

function formatArray(arr) {
  return arr && arr.length ? arr.join(', ') : '-';
}

function formatEffects(effects) {
  if (!effects || effects.length === 0) return '-';
  return effects
    .map((e) => {
      const parts = [];
      if (e.resource) parts.push(`resource=${e.resource}`);
      if (e.category) parts.push(`category=${e.category}`);
      if (e.percent != null) parts.push(`percent=${(e.percent * 100).toFixed(1)}%`);
      if (e.type) parts.push(`type=${e.type}`);
      return `{ ${parts.join(', ')} }`;
    })
    .join(', ');
}

function formatUnlocks(unlocks, effects) {
  const parts = [];
  if (unlocks?.resources?.length)
    parts.push(`resources: ${unlocks.resources.join(', ')}`);
  if (unlocks?.buildings?.length)
    parts.push(`buildings: ${unlocks.buildings.join(', ')}`);
  if (unlocks?.categories?.length)
    parts.push(`categories: ${unlocks.categories.join(', ')}`);
  if (effects?.length) parts.push(`effects: ${formatEffects(effects)}`);
  return parts.join('; ') || '-';
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
  '\n';

md += '## 3) Seasons\n';
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
  '| id | name | type | cost | refund | storage | base prod/s | inputs per sec | season mults |\n';
md += '| - | - | - | - | - | - | - | - | - |\n';
buildings.forEach((row) => {
  md += `| ${row.id} | ${row.name} | ${row.type} | ${formatCost(row.constructionCost)} | ${row.demolitionRefund} | ${formatObj(row.storageProvided)} | ${formatObj(row.baseProductionPerSec)} | ${formatObj(row.baseInputsPerSec)} | ${formatObj(row.seasonalMultipliers)} |\n`;
});
md += '\n';
md += '## 5) Research\n';
md += '| id | name | science cost | time (sec) | prereqs | unlocks |\n';
md += '| - | - | - | - | - | - |\n';
research.forEach((r) => {
  md += `| ${r.id} | ${r.name} | ${r.scienceCost} | ${r.timeSec} | ${formatArray(r.prereqs)} | ${formatUnlocks(r.unlocks, r.effects)} |\n`;
});
md += '\n';
md += '## 6) Roles\n';
if (roles.length) {
  md += '| id | name | resource | building |\n';
  md += '| - | - | - | - |\n';
  roles.forEach((r) => {
    md += `| ${r.id} | ${r.name} | ${r.resource} | ${r.building} |\n`;
  });
  md += '\n';
} else {
  md += 'No role-based modifiers defined.\n\n';
}

md += '## 7) Starting State\n';
md += `Starting season: ${snapshot.startingState.season}, Year: ${snapshot.startingState.year}.\n\n`;
md += '### Resources\n';
md += '| resource | amount | capacity |\n| - | - | - |\n';
Object.entries(startingResources).forEach(([key, val]) => {
  md += `| ${key} | ${val.amount} | ${val.capacity} |\n`;
});
md += '\n### Buildings\n';
md += '| building | count |\n| - | - |\n';
Object.entries(startingBuildings)
  .filter(([, count]) => count > 0)
  .forEach(([id, count]) => {
    md += `| ${id} | ${count} |\n`;
  });
md += '\n';

fs.writeFileSync(path.join(repoRoot, 'docs/ECONOMY_REPORT.md'), md);
