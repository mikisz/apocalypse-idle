import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { execSync } from 'child_process';
import { register } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
register('ts-node/esm', pathToFileURL(repoRoot + '/'));

const { BUILDINGS, getBuildingCost } = await import('../src/data/buildings.js');
const { RESOURCES } = await import('../src/data/resources.js');
const { RESEARCH } = await import('../src/data/research.js');
const { ROLE_LIST } = await import('../src/data/roles.js');
const {
  initSeasons,
  getSeasonMultiplier,
  SEASON_DURATION,
} = await import('../src/engine/time.js');
const { CURRENT_SAVE_VERSION } = await import('../src/engine/persistence.js');
const { BALANCE, ROLE_BONUS_PER_SETTLER } = await import('../src/data/balance.js');
const {
  RADIO_BASE_SECONDS,
  SHELTER_COST_GROWTH,
  SHELTER_MAX,
} = await import('../src/data/settlement.js');
const { defaultState } = await import('../src/state/defaultState.js');

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
seasons.forEach((s, idx) => {
  const multipliers = {};
  resourceKeys.forEach((r) => {
    multipliers[r] = computeResourceMultiplier(r, s);
  });
  seasonData[s.id] = {
    durationSec: SEASON_DURATION,
    multipliers,
    origin: { file: 'time.js', path: `SEASONS[${idx}]` },
  };
});

const resources = resourceKeys.map((id) => {
  const r = RESOURCES[id];
  return {
    key: id,
    displayName: r.name,
    category: r.category,
    startingAmount: r.startingAmount ?? 0,
    startingCapacity: r.startingCapacity ?? 0,
    unit: r.unit ?? null,
    origin: { file: 'resources.js', path: `RESOURCES.${id}` },
  };
});

function buildingType(b) {
  return b.type || (b.capacityAdd ? 'storage' : 'other');
}

function clean(obj) {
  return Object.fromEntries(
    Object.entries(obj || {}).map(([k, v]) => [k, typeof v === 'number' ? Number(v.toFixed(3)) : v]),
  );
}

function buildingSeasonMultipliers(b) {
  const result = {};
  seasons.forEach((s) => {
    if (b.seasonProfile === 'constant') result[s.id] = 1;
    else if (typeof b.seasonProfile === 'object')
      result[s.id] = b.seasonProfile[s.id] ?? 1;
    else {
      const resKey = Object.keys(b.outputsPerSecBase || {})[0];
      const cat = resKey ? RESOURCES[resKey]?.category : null;
      result[s.id] = cat ? getSeasonMultiplier(s, cat) : 1;
    }
  });
  return result;
}

const buildings = BUILDINGS.map((b, idx) => ({
  id: b.id,
  name: b.name,
  type: buildingType(b),
  cost: clean(b.costBase || {}),
  costGrowth: b.costGrowth,
  refund: b.refund ?? 0,
  storage: clean(b.capacityAdd || {}),
  outputsPerSec: clean(b.outputsPerSecBase || {}),
  inputsPerSec: clean(b.inputsPerSecBase || {}),
  requiresResearch: b.requiresResearch || '',
  seasonMults: buildingSeasonMultipliers(b),
  origin: { file: 'buildings.js', path: `BUILDINGS[${idx}]` },
}));

const roles = ROLE_LIST.map((r) => ({
  id: r.id,
  name: r.name,
  skill: r.skill,
  resource: r.resource,
  building: r.building,
  origin: { file: 'roles.js', path: `ROLES.${r.id}` },
}));

const research = RESEARCH.map((r, idx) => ({
  id: r.id,
  name: r.name,
  scienceCost: r.cost?.science ?? 0,
  timeSec: r.timeSec,
  prereqs: r.prereqs || [],
  milestones: r.milestones || null,
  unlocks: {
    resources: r.unlocks?.resources || [],
    buildings: r.unlocks?.buildings || [],
    categories: r.unlocks?.categories || [],
  },
  effects: r.effects || [],
  origin: { file: 'research.js', path: `RESEARCH[${idx}]` },
}));

const startingResources = Object.fromEntries(
  resources.map((r) => [r.key, { amount: r.startingAmount, capacity: r.startingCapacity }]),
);

const startingBuildings = Object.fromEntries(
  Object.entries(defaultState.buildings).map(([id, info]) => [id, info.count || 0]),
);

const rulesOrigins = {
  getBuildingCost: { file: 'buildings.js', path: 'getBuildingCost()' },
  refund: { file: 'buildings.js', path: 'BUILDINGS[].refund' },
  clamp: { file: 'production.js', path: 'clampResource()' },
  tickSeconds: { file: 'balance.js', path: 'BALANCE.TICK_SECONDS' },
  foodConsumption: {
    file: 'balance.js',
    path: 'BALANCE.FOOD_CONSUMPTION_PER_SETTLER',
  },
  starvationTimer: {
    file: 'balance.js',
    path: 'BALANCE.STARVATION_DEATH_TIMER_SECONDS',
  },
  roleBonusFn: { file: 'balance.js', path: 'ROLE_BONUS_PER_SETTLER' },
  shelterMax: { file: 'settlement.js', path: 'SHELTER_MAX' },
  shelterCostGrowth: { file: 'settlement.js', path: 'SHELTER_COST_GROWTH' },
  radioBaseSeconds: { file: 'settlement.js', path: 'RADIO_BASE_SECONDS' },
};

const snapshot = {
  version: commitHash,
  saveVersion: CURRENT_SAVE_VERSION,
  tickSeconds: BALANCE.TICK_SECONDS,
  seasons: seasonData,
  resources,
  buildings,
  research,
  roles,
  formula: {
    order: ['base', 'season', 'roles', 'sum', 'clamp'],
    rulesOrigins,
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

const formatJSON = (obj) =>
  obj && Object.keys(obj).length ? JSON.stringify(obj) : '-';
const formatArr = (arr) => (arr && arr.length ? arr.join(', ') : '-');

let md = '';
md += '# Economy Report\n\n';
md += '## 1) Overview\n';
md += `Economy generated from commit **${commitHash}** on ${commitDate}. Save version: **${CURRENT_SAVE_VERSION}**.\n`;
md +=
  'Each tick represents 1 second. For each building: base production is modified by season multipliers, summed, then clamped to capacity. Offline progress processes in 60-second chunks.\n\n';

md += '## 2) Resources\n';
md +=
  '| key | displayName | category | startingAmount | startingCapacity | unit | source |\n';
md += '| - | - | - | - | - | - | - |\n';
resources.forEach((r) => {
  md += `| ${r.key} | ${r.displayName} | ${r.category} | ${r.startingAmount} | ${r.startingCapacity} | ${r.unit ?? ''} | resources.js:RESOURCES.${r.key} |\n`;
});
md += '\n';

md += '## 3) Seasons\n';
md += '| season | duration (sec) |';
resourceKeys.forEach((r) => (md += ` ${r} |`));
md += ' source |\n| - | - |';
resourceKeys.forEach(() => (md += ' - |'));
md += ' - |\n';
seasons.forEach((s, idx) => {
  md += `| ${s.id} | ${seasonData[s.id].durationSec} |`;
  resourceKeys.forEach((r) => {
    md += ` ${seasonData[s.id].multipliers[r].toFixed(3)} |`;
  });
  md += ` time.js:SEASONS[${idx}] |\n`;
});
md += '\n';

md += '## 4) Buildings\n';
md +=
  '| id | name | type | cost | costGrowth | refund | storage | base prod/s | inputs per sec | requiresResearch | season mults | source |\n';
md +=
  '| - | - | - | - | - | - | - | - | - | - | - | - |\n';
buildings.forEach((row, idx) => {
  md += `| ${row.id} | ${row.name} | ${row.type} | ${formatJSON(row.cost)} | ${row.costGrowth} | ${row.refund} | ${formatJSON(row.storage)} | ${formatJSON(row.outputsPerSec)} | ${formatJSON(row.inputsPerSec)} | ${row.requiresResearch || '-'} | ${formatJSON(row.seasonMults)} | buildings.js:BUILDINGS[${idx}] |\n`;
});
md += '\n';

md += '## 5) Research\n';
md +=
  '| id | name | science cost | time (sec) | prereqs | milestones | unlocks | effects | source |\n';
md += '| - | - | - | - | - | - | - | - | - |\n';
research.forEach((r, idx) => {
  md += `| ${r.id} | ${r.name} | ${r.scienceCost} | ${r.timeSec} | ${formatArr(r.prereqs)} | ${formatJSON(r.milestones)} | ${formatJSON(r.unlocks)} | ${formatJSON(r.effects)} | research.js:RESEARCH[${idx}] |\n`;
});
md += '\n';

md += '## 6) Roles\n';
md += '| id | name | skill | resource | building | source |\n';
md += '| - | - | - | - | - | - |\n';
roles.forEach((r) => {
  md += `| ${r.id} | ${r.name} | ${r.skill} | ${r.resource} | ${r.building} | roles.js:ROLES.${r.id} |\n`;
});
md += '\n';

md += '## 7) Starting State\n';
md += `Starting season: ${snapshot.startingState.season}, Year: ${snapshot.startingState.year}.\n\n`;
md += '### Resources\n';
md += '| resource | amount | capacity | source |\n| - | - | - | - |\n';
Object.entries(startingResources).forEach(([key, val]) => {
  md += `| ${key} | ${val.amount} | ${val.capacity} | resources.js:RESOURCES.${key}.startingAmount/startingCapacity |\n`;
});
md += '\n### Buildings\n';
md += '| building | count | source |\n| - | - | - |\n';
Object.entries(startingBuildings)
  .filter(([, count]) => count > 0)
  .forEach(([id, count]) => {
    md += `| ${id} | ${count} | defaultState.js:initBuildings().${id}.count |\n`;
  });
md += '\n';

md += '## 8) Rules & Formulas\n';
md += `- Building cost: costBase * costGrowth^count, rounded up (source: buildings.js:getBuildingCost())\n`;
md += `- Demolition refund: refund * last cost (source: buildings.js:BUILDINGS[].refund)\n`;
md += `- Clamp: clampResource(value, capacity) (source: production.js:clampResource())\n`;
md += `- TICK_SECONDS = ${BALANCE.TICK_SECONDS} (source: balance.js:BALANCE.TICK_SECONDS)\n`;
md += `- FOOD_CONSUMPTION_PER_SETTLER = ${BALANCE.FOOD_CONSUMPTION_PER_SETTLER} (source: balance.js:BALANCE.FOOD_CONSUMPTION_PER_SETTLER)\n`;
md += `- STARVATION_DEATH_TIMER_SECONDS = ${BALANCE.STARVATION_DEATH_TIMER_SECONDS} (source: balance.js:BALANCE.STARVATION_DEATH_TIMER_SECONDS)\n`;
md += `- ROLE_BONUS_PER_SETTLER(level): level<=10 -> 0.1*level; else 1 + 0.05*(level-10) (source: balance.js:ROLE_BONUS_PER_SETTLER)\n`;
md += `- SHELTER_MAX = ${SHELTER_MAX} (source: settlement.js:SHELTER_MAX)\n`;
md += `- SHELTER_COST_GROWTH = ${SHELTER_COST_GROWTH} (source: settlement.js:SHELTER_COST_GROWTH)\n`;
md += `- RADIO_BASE_SECONDS = ${RADIO_BASE_SECONDS} (source: settlement.js:RADIO_BASE_SECONDS)\n`;

fs.writeFileSync(path.join(repoRoot, 'docs/ECONOMY_REPORT.md'), md);

