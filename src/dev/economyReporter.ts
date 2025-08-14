import * as fs from 'fs';
import { pathToFileURL } from 'url';
import { BUILDINGS } from '../data/buildings.js';
import { SEASONS } from '../engine/time.ts';
import type { BuildingData, ResourceMap, SeasonsRecord } from './economyTypes.ts';
import {
  marginalWeightedCost,
  marginalWeightedDeltaProdPerSec,
  pbtAtN,
  valueWeightedStream,
} from './economyMath.ts';

export interface Options {
  season: 'average' | 'winter' | 'spring' | 'summer' | 'autumn' | 'all';
  weights: ResourceMap;
  targets: number[];
  format: 'md' | 'json' | 'csv';
  out?: string;
  thresholds: any;
  include: string;
  locale: string;
}

const DEFAULT_WEIGHTS: ResourceMap = {
  wood: 1.0,
  stone: 1.3,
  scrap: 2.2,
  planks: 4.0,
  metalParts: 6.0,
  power: 1.0,
  potatoes: 0.9,
  meat: 1.4,
  science: 2.5,
};

const DEFAULT_THRESHOLDS = {
  generators: {
    pbt1: [60, 120],
    pbt10: [180, 480],
    pbt50: [900, 2700],
  },
  converters: {
    pbt1: [90, 150],
    pbt10: [240, 600],
    pbt50: [1200, 3600],
  },
};

export function parseArgs(args = process.argv.slice(2)): Options {
  const opts: Options = {
    season: 'average',
    weights: { ...DEFAULT_WEIGHTS },
    targets: [1, 10, 50],
    format: 'md',
    thresholds: DEFAULT_THRESHOLDS,
    include: 'all',
    locale: 'en-US',
  };
  for (const arg of args) {
    const [key, value] = arg.split('=');
    switch (key) {
      case '--season':
        opts.season = value as any;
        break;
      case '--weights':
        if (value.endsWith('.json') && fs.existsSync(value)) {
          const txt = fs.readFileSync(value, 'utf8');
          opts.weights = JSON.parse(txt);
        } else {
          value.split(',').forEach((pair) => {
            const [r, v] = pair.split(':').length === 2 ? pair.split(':') : pair.split('=');
            if (r && v) opts.weights[r] = Number(v);
          });
        }
        break;
      case '--targets':
        opts.targets = value
          .split(',')
          .map((v) => Number(v.trim()))
          .filter((n) => !isNaN(n));
        break;
      case '--format':
        opts.format = value as any;
        break;
      case '--out':
        opts.out = value;
        break;
      case '--thresholds':
        if (value.endsWith('.json') && fs.existsSync(value)) {
          const txt = fs.readFileSync(value, 'utf8');
          opts.thresholds = JSON.parse(txt);
        } else {
          opts.thresholds = JSON.parse(value);
        }
        break;
      case '--include':
        opts.include = value;
        break;
      case '--locale':
        opts.locale = value;
        break;
      default:
        break;
    }
  }
  return opts;
}

function buildSeasonRecord(): SeasonsRecord {
  const record: SeasonsRecord = {};
  for (const s of SEASONS) {
    record[s.id] = { multipliers: { ...s.multipliers } };
  }
  return record;
}

function formatNumber(n: number, locale: string): string {
  if (!isFinite(n)) return '—';
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(n);
}

export function generateReport(opts: Options): string {
  const seasons = buildSeasonRecord();
  const buildings: BuildingData[] = BUILDINGS as any;

  const includeAll = opts.include === 'all';

  const buildingRows: any[] = [];
  const converterRows: any[] = [];
  const storageRows: any[] = [];

  const outliers = { tooFast: [] as any[], tooSlow: [] as any[] };

  for (const b of buildings) {
    const type = b.type || (b.capacityAdd ? 'storage' : 'other');
    if (!includeAll && !opts.include.split(',').includes(type + 's')) continue;

    const pbt: Record<string, number | Record<string, number>> = {};
    const seasonsToCompute = opts.season === 'all' ? Object.keys(seasons) : [opts.season];
    for (const target of opts.targets) {
      if (opts.season === 'all') {
        const perSeason: Record<string, number> = {};
        for (const s of seasonsToCompute) {
          perSeason[s] = pbtAtN(b, target - 1, s as any, opts.weights, seasons);
        }
        pbt[target] = perSeason;
      } else {
        pbt[target] = pbtAtN(b, target - 1, opts.season as any, opts.weights, seasons);
      }
    }

    const outputs = b.outputsPerSecBase || {};
    const inputs = b.inputsPerSecBase || {};
    const row = {
      id: b.id,
      category: b.category || '',
      type: b.type || '',
      growth: b.costGrowth,
      pbt,
      outputs,
      inputs,
    };
    buildingRows.push(row);

    if (b.type === 'processing') {
      const outVal = valueWeightedStream(outputs, {}, opts.weights);
      const inVal = valueWeightedStream({}, inputs, opts.weights) * -1;
      const ratio = inVal > 0 ? outVal / inVal : Infinity;
      converterRows.push({
        id: b.id,
        growth: b.costGrowth,
        inputs,
        outputs,
        ratio,
        pbt,
        mode: 'all-or-nothing',
      });
    }

    if (b.capacityAdd) {
      storageRows.push({
        id: b.id,
        growth: b.costGrowth,
        capacity: b.capacityAdd,
      });
    }

    // outlier detection
    if (b.type === 'production' || b.type === 'processing') {
      const th = b.type === 'processing' ? opts.thresholds.converters : opts.thresholds.generators;
      for (const target of opts.targets) {
        const value =
          opts.season === 'all'
            ? (pbt[target] as Record<string, number>)[opts.season === 'all' ? 'average' : opts.season]
            : (pbt[target] as number);
        if (!isFinite(value)) continue;
        const window = th[`pbt${target}`];
        if (!window) continue;
        if (value < window[0]) outliers.tooFast.push({ id: b.id, target, value });
        else if (value > window[1]) outliers.tooSlow.push({ id: b.id, target, value });
      }
    }
  }

  // SUMMARY
  const summary = {
    analyzed: buildingRows.length,
    season: opts.season,
    weights: opts.weights,
    targets: opts.targets,
    thresholds: opts.thresholds,
    outliers: {
      tooFast: outliers.tooFast.length,
      tooSlow: outliers.tooSlow.length,
    },
  };

  if (opts.format === 'json') {
    const json = {
      meta: summary,
      buildings: buildingRows,
      converters: converterRows,
      storage: storageRows,
      outliers,
    };
    return JSON.stringify(json, null, 2);
  }

  // Markdown or CSV
  let outStr = '';
  if (opts.format === 'md') {
    outStr += '# Economy Report\n\n';
    outStr += '## Summary\n';
    outStr += `Analyzed **${summary.analyzed}** buildings. Season mode: **${summary.season}**.\n`;
    outStr += `Weights: ${JSON.stringify(summary.weights)}. Targets: ${summary.targets.join(', ')}.\n`;
    outStr += `Outliers – too fast: ${summary.outliers.tooFast}, too slow: ${summary.outliers.tooSlow}.\n\n`;

    // Buildings table
    outStr += '## Buildings\n';
    const pbtHeaders: string[] = [];
    if (opts.season === 'all') {
      for (const t of opts.targets) {
        for (const s of Object.keys(seasons)) {
          pbtHeaders.push(`PBT@${t}[${s}]`);
        }
      }
    } else {
      for (const t of opts.targets) pbtHeaders.push(`PBT@${t}`);
    }
    outStr += `| id | category | type | growth | ${pbtHeaders.join(' | ')} | out/s (base) | in/s (base) |\n`;
    outStr += `| - | - | - | - | ${pbtHeaders.map(() => '-').join(' | ')} | - | - |\n`;
    for (const row of buildingRows) {
      const pbtVals: string[] = [];
      if (opts.season === 'all') {
        for (const t of opts.targets) {
          const obj = row.pbt[t];
          for (const s of Object.keys(seasons)) {
            const val = (obj as Record<string, number>)[s];
            pbtVals.push(formatNumber(val, opts.locale));
          }
        }
      } else {
        for (const t of opts.targets) {
          const val = row.pbt[t];
          pbtVals.push(formatNumber(val as number, opts.locale));
        }
      }
      outStr += `| ${row.id} | ${row.category} | ${row.type} | ${row.growth} | ${pbtVals.join(' | ')} | ${formatJSON(row.outputs)} | ${formatJSON(row.inputs)} |\n`;
    }
    outStr += '\n';

    // Converters table
    if (converterRows.length) {
      outStr += '## Converters\n';
      outStr += '| id | growth | in/s | out/s | ratio(out/in) |';
      for (const t of opts.targets) outStr += ` PBT@${t} |`;
      outStr += ' mode |\n| - | - | - | - | - |';
      for (const t of opts.targets) outStr += ' - |';
      outStr += ' - |\n';
      for (const row of converterRows) {
        const pbtVals: string[] = [];
        for (const t of opts.targets) {
          const v = row.pbt[t];
          if (typeof v === 'object') {
            const val = (v as Record<string, number>)[
              opts.season === 'all' ? 'average' : opts.season
            ];
            pbtVals.push(formatNumber(val, opts.locale));
          } else {
            pbtVals.push(formatNumber(v as number, opts.locale));
          }
        }
        outStr += `| ${row.id} | ${row.growth} | ${formatJSON(row.inputs)} | ${formatJSON(row.outputs)} | ${formatNumber(row.ratio, opts.locale)} | ${pbtVals.join(' | ')} | ${row.mode} |\n`;
      }
      outStr += '\n';
    }

    // Storage table
    if (storageRows.length) {
      outStr += '## Storage\n';
      outStr += '| id | growth | +capacity |\n| - | - | - |\n';
      for (const row of storageRows) {
        outStr += `| ${row.id} | ${row.growth} | ${formatJSON(row.capacity)} |\n`;
      }
      outStr += '\n';
    }

    // Outliers section
    if (outliers.tooFast.length || outliers.tooSlow.length) {
      outStr += '## Outliers\n';
      if (outliers.tooFast.length) {
        outStr += '### Too Fast\n';
        outliers.tooFast.forEach((o) => {
          outStr += `- ${o.id} @${o.target}: ${formatNumber(o.value, opts.locale)} sec\n`;
        });
      }
      if (outliers.tooSlow.length) {
        outStr += '### Too Slow\n';
        outliers.tooSlow.forEach((o) => {
          outStr += `- ${o.id} @${o.target}: ${formatNumber(o.value, opts.locale)} sec\n`;
        });
      }
      outStr += '\n';
    }
  } else {
    // CSV
    const header = ['id', 'category', 'type', 'growth'];
    for (const t of opts.targets) header.push(`PBT@${t}`);
    header.push('outBase', 'inBase');
    outStr += header.join(',') + '\n';
    for (const row of buildingRows) {
      const pbtVals: string[] = [];
      for (const t of opts.targets) {
        const v = row.pbt[t];
        const val =
          typeof v === 'object'
            ? (v as Record<string, number>)[opts.season === 'all' ? 'average' : opts.season]
            : (v as number);
        pbtVals.push(String(val));
      }
      outStr += [
        row.id,
        row.category,
        row.type,
        row.growth,
        ...pbtVals,
        JSON.stringify(row.outputs),
        JSON.stringify(row.inputs),
      ].join(',') + '\n';
    }
  }

  return outStr;
}

function formatJSON(obj: any): string {
  const keys = Object.keys(obj);
  if (!keys.length) return '-';
  return keys.map((k) => `${k}:${obj[k]}`).join(',');
}

export function main(args = process.argv.slice(2)) {
  const opts = parseArgs(args);
  const outStr = generateReport(opts);
  if (opts.out) fs.writeFileSync(opts.out, outStr);
  else console.log(outStr);
}

if (pathToFileURL(process.argv[1] ?? '').href === import.meta.url) {
  main();
}
