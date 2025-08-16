import { createLogEntry } from '../utils/log.js';
import { RADIO_BASE_SECONDS } from '../data/settlement.js';
import { deepClone } from '../utils/clone.ts';
import type {
  GameState,
  BuildingEntry,
  ResourceState,
} from '../state/useGame.tsx';

const STORAGE_KEY = 'apocalypse-idle-save';
const STORAGE_BACKUP_KEY = `${STORAGE_KEY}-backup`;

export const CURRENT_SAVE_VERSION = 7;

export interface SaveFile extends Partial<GameState> {
  version: number;
  schemaVersion?: number;
}

export interface Migration {
  from: number;
  to: number;
  up: (save: SaveFile) => SaveFile | void;
}

export interface LoadResult {
  state: GameState;
  migratedFrom: number | null;
}

interface LogEntry {
  id: string;
  text: string;
  time?: number;
}

export const migrations: Migration[] = [
  {
    from: 1,
    to: 2,
    up(save) {
      if (typeof save.gameTime === 'number') {
        save.gameTime = { seconds: save.gameTime };
      } else if (!save.gameTime) {
        save.gameTime = { seconds: 0 };
      }
      if ('schemaVersion' in save) delete save.schemaVersion;
      return save;
    },
  },
  {
    from: 2,
    to: 3,
    up(save) {
      if (!save.ui || typeof save.ui !== 'object' || Array.isArray(save.ui)) {
        save.ui = {
          activeTab: 'base',
          drawerOpen: false,
          offlineProgress: null,
        };
      }
      if (!Array.isArray(save.log)) {
        save.log = [];
      }
      if (
        !save.research ||
        typeof save.research !== 'object' ||
        Array.isArray(save.research)
      ) {
        save.research = { current: null, completed: [], progress: {} };
      } else {
        save.research.current = save.research.current ?? null;
        save.research.completed = Array.isArray(save.research.completed)
          ? save.research.completed
          : [];
        save.research.progress =
          typeof save.research.progress === 'object' &&
          save.research.progress !== null &&
          !Array.isArray(save.research.progress)
            ? save.research.progress
            : {};
      }
      if (!save.population || typeof save.population !== 'object') {
        save.population = { settlers: [] } as GameState['population'];
      } else if (!Array.isArray(save.population.settlers)) {
        save.population.settlers = [];
      }
      return save;
    },
  },
  {
    from: 3,
    to: 4,
    up(save) {
      if (!Array.isArray(save.log)) {
        save.log = [];
      } else {
        save.log = save.log.map((entry) => {
          if (typeof entry === 'string') return createLogEntry(entry);
          if (entry && typeof entry === 'object') {
            const obj = entry as Partial<LogEntry>;
            const id =
              typeof obj.id === 'string' ? obj.id : createLogEntry('').id;
            const text =
              typeof obj.text === 'string'
                ? obj.text
                : String((obj as { text?: unknown }).text ?? '');
            return { id, text };
          }
          return createLogEntry(String(entry));
        });
      }
      return save;
    },
  },
  {
    from: 4,
    to: 5,
    up(save) {
      if (!save.population || typeof save.population !== 'object') {
        save.population = { settlers: [], candidate: null } as GameState['population'];
      } else {
        if (!Array.isArray(save.population.settlers))
          save.population.settlers = [];
        if (!('candidate' in save.population)) save.population.candidate = null;
      }
      if (!save.colony || typeof save.colony !== 'object') {
        save.colony = { radioTimer: RADIO_BASE_SECONDS } as GameState['colony'];
      } else if (typeof save.colony.radioTimer !== 'number') {
        save.colony.radioTimer = RADIO_BASE_SECONDS;
      }
      return save;
    },
  },
  {
    from: 5,
    to: 6,
    up(save) {
      if (!Array.isArray(save.log)) {
        save.log = [];
      } else {
        const now = Date.now();
        save.log = save.log.map((entry) => ({
          ...(entry as LogEntry),
          time:
            typeof (entry as LogEntry).time === 'number'
              ? (entry as LogEntry).time
              : now,
        }));
      }
      return save;
    },
  },
  {
    from: 6,
    to: 7,
    up(save) {
      if (save.buildings && typeof save.buildings === 'object') {
        Object.values(save.buildings).forEach((b) => {
          const building = b as BuildingEntry & Record<string, unknown>;
          if (building && typeof building === 'object' && !('isDesiredOn' in building)) {
            building.isDesiredOn = true;
          }
        });
      }
      return save;
    },
  },
];

export function applyMigrations(save: SaveFile): SaveFile {
  while (save.version < CURRENT_SAVE_VERSION) {
    const migration = migrations.find((m) => m.from === save.version);
    if (!migration) throw new Error(`Missing migration from v${save.version}`);
    save = migration.up(save) || save;
    save.version = migration.to;
  }
  return save;
}

export function validateSave(obj: SaveFile): void {
  if (!obj || typeof obj !== 'object')
    throw new Error('Invalid save: not an object');
  if (!('resources' in obj)) throw new Error('Invalid save: missing resources');
  if (
    typeof obj.resources !== 'object' ||
    obj.resources === null ||
    Array.isArray(obj.resources)
  )
    throw new Error('Invalid save: resources must be object');
  Object.entries(obj.resources as Record<string, ResourceState>).forEach(
    ([id, r]) => {
      if (!r || typeof r !== 'object')
        throw new Error(`Invalid save: resource "${id}" must be object`);
      if (typeof r.amount !== 'number')
        throw new Error(
          `Invalid save: resource "${id}" has non-numeric amount`,
        );
      if ('produced' in r && typeof r.produced !== 'number')
        throw new Error(
          `Invalid save: resource "${id}" has non-numeric produced`,
        );
      if ('discovered' in r && typeof r.discovered !== 'boolean')
        throw new Error(
          `Invalid save: resource "${id}" has invalid discovered flag`,
        );
    },
  );
  if (!('buildings' in obj)) throw new Error('Invalid save: missing buildings');
  if (
    typeof obj.buildings !== 'object' ||
    obj.buildings === null ||
    Array.isArray(obj.buildings)
  )
    throw new Error('Invalid save: buildings must be object');
  Object.entries(obj.buildings as Record<string, BuildingEntry>).forEach(
    ([id, b]) => {
      if (!b || typeof b !== 'object')
        throw new Error(`Invalid save: building "${id}" must be object`);
      if (typeof b.count !== 'number')
        throw new Error(
          `Invalid save: building "${id}" has non-numeric count`,
        );
      if ('isDesiredOn' in b) {
        if (typeof b.isDesiredOn !== 'boolean')
          throw new Error(
            `Invalid save: building "${id}" has invalid isDesiredOn flag`,
          );
      } else if (obj.version >= 7) {
        throw new Error(
          `Invalid save: building "${id}" missing isDesiredOn flag`,
        );
      }
      if ('offlineReason' in b && typeof b.offlineReason !== 'string')
        throw new Error(
          `Invalid save: building "${id}" has invalid offlineReason`,
        );
    },
  );
  if (!('population' in obj))
    throw new Error('Invalid save: missing population');
  if (
    typeof obj.population !== 'object' ||
    obj.population === null ||
    Array.isArray(obj.population)
  )
    throw new Error('Invalid save: population must be object');
  if (
    'gameTime' in obj &&
    typeof obj.gameTime !== 'number' &&
    typeof obj.gameTime !== 'object'
  )
    throw new Error('Invalid save: gameTime must be number or object');
  if (obj.version >= 3) {
    if (!('ui' in obj)) throw new Error('Invalid save: missing ui');
    if (typeof obj.ui !== 'object' || obj.ui === null || Array.isArray(obj.ui))
      throw new Error('Invalid save: ui must be object');
    if (!('log' in obj)) throw new Error('Invalid save: missing log');
    if (!Array.isArray(obj.log))
      throw new Error('Invalid save: log must be array');
    if (
      obj.version >= 4 &&
      !(obj.log as unknown[]).every(
        (e) =>
          e &&
          typeof e === 'object' &&
          typeof (e as LogEntry).id === 'string' &&
          typeof (e as LogEntry).text === 'string' &&
          (obj.version < 6 || typeof (e as LogEntry).time === 'number'),
      )
    )
      throw new Error(
        'Invalid save: log entries must be objects with id, text and time',
      );
    if (!('research' in obj)) throw new Error('Invalid save: missing research');
    if (
      typeof obj.research !== 'object' ||
      obj.research === null ||
      Array.isArray(obj.research)
    )
      throw new Error('Invalid save: research must be object');
    if (!('settlers' in obj.population))
      throw new Error('Invalid save: missing settlers');
    if (!Array.isArray(obj.population.settlers))
      throw new Error('Invalid save: settlers must be array');
    if (obj.version >= 5) {
      if (!('candidate' in obj.population))
        throw new Error('Invalid save: missing candidate');
      if (!('colony' in obj) || typeof obj.colony !== 'object')
        throw new Error('Invalid save: missing colony');
    }
  }
}

export function save(state: GameState): SaveFile {
  return { ...state, version: CURRENT_SAVE_VERSION, lastSaved: Date.now() };
}

export function load(raw: string | SaveFile): LoadResult {
  const save: SaveFile =
    typeof raw === 'string' ? JSON.parse(raw) : deepClone(raw);
  const parsedVersion = Number(save.version ?? save.schemaVersion);
  save.version = Number.isNaN(parsedVersion) ? 1 : parsedVersion;
  if (save.version > CURRENT_SAVE_VERSION) {
    throw new Error(
      `Save version ${save.version} is newer than supported version ${CURRENT_SAVE_VERSION}`,
    );
  }
  validateSave(save);
  const start = save.version;
  applyMigrations(save);
  validateSave(save);
  return {
    state: save as GameState,
    migratedFrom: start < save.version ? start : null,
  };
}

export function saveGame(state: GameState): SaveFile {
  let hadBackup = false;
  try {
    const data = save(state);

    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing !== null) {
      localStorage.setItem(STORAGE_BACKUP_KEY, existing);
      hadBackup = true;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    if (hadBackup) localStorage.removeItem(STORAGE_BACKUP_KEY);
    return data;
  } catch (err) {
    try {
      if (hadBackup) {
        const backup = localStorage.getItem(STORAGE_BACKUP_KEY);
        if (backup !== null) localStorage.setItem(STORAGE_KEY, backup);
        localStorage.removeItem(STORAGE_BACKUP_KEY);
      }
    } catch (restoreErr) {
      if (import.meta.env.DEV) console.error('Restore failed', restoreErr);
    }
    if (import.meta.env.DEV) console.error('Save failed', err);
    return state;
  }
}

export function loadGame(): { state: GameState | null; error: unknown } {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { state: null, error: null };
  try {
    const { state } = load(raw);
    return { state, error: null };
  } catch (err) {
    if (import.meta.env.DEV) console.error('Load failed', err);
    return { state: null, error: err };
  }
}

export function restoreBackup(): boolean {
  try {
    const backup = localStorage.getItem(STORAGE_BACKUP_KEY);
    if (backup === null) return false;
    localStorage.setItem(STORAGE_KEY, backup);
    localStorage.removeItem(STORAGE_BACKUP_KEY);
    return true;
  } catch (err) {
    if (import.meta.env.DEV) console.error('Restore backup failed', err);
    return false;
  }
}

export function deleteSave(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    if (import.meta.env.DEV) console.error('Delete failed', err);
    return false;
  }
}

export function exportSaveFile(state: GameState): SaveFile {
  const data = save(state);
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'apocalypse-idle-save.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return data;
}

