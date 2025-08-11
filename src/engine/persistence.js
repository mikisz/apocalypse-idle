import { createLogEntry } from '../utils/log.js';

const STORAGE_KEY = 'apocalypse-idle-save';

export const CURRENT_SAVE_VERSION = 4;

export const migrations = [
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
        save.population = { settlers: [] };
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
            const id =
              typeof entry.id === 'string' ? entry.id : createLogEntry('').id;
            const text =
              typeof entry.text === 'string'
                ? entry.text
                : String(entry.text ?? '');
            return { id, text };
          }
          return createLogEntry(String(entry));
        });
      }
      return save;
    },
  },
];

export function applyMigrations(save) {
  while (save.version < CURRENT_SAVE_VERSION) {
    const migration = migrations.find((m) => m.from === save.version);
    if (!migration) throw new Error(`Missing migration from v${save.version}`);
    save = migration.up(save) || save;
    save.version = migration.to;
  }
  return save;
}

export function validateSave(obj) {
  if (!obj || typeof obj !== 'object')
    throw new Error('Invalid save: not an object');
  if (!('resources' in obj)) throw new Error('Invalid save: missing resources');
  if (
    typeof obj.resources !== 'object' ||
    obj.resources === null ||
    Array.isArray(obj.resources)
  )
    throw new Error('Invalid save: resources must be object');
  if (!('buildings' in obj)) throw new Error('Invalid save: missing buildings');
  if (
    typeof obj.buildings !== 'object' ||
    obj.buildings === null ||
    Array.isArray(obj.buildings)
  )
    throw new Error('Invalid save: buildings must be object');
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
      !obj.log.every(
        (e) =>
          e &&
          typeof e === 'object' &&
          typeof e.id === 'string' &&
          typeof e.text === 'string',
      )
    )
      throw new Error(
        'Invalid save: log entries must be objects with id and text',
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
  }
  return true;
}

export function save(state) {
  return { ...state, version: CURRENT_SAVE_VERSION, lastSaved: Date.now() };
}

export function load(raw) {
  const save =
    typeof raw === 'string' ? JSON.parse(raw) : JSON.parse(JSON.stringify(raw));
  save.version = save.version ?? save.schemaVersion ?? 1;
  validateSave(save);
  const start = save.version;
  applyMigrations(save);
  validateSave(save);
  return { state: save, migratedFrom: start < save.version ? start : null };
}

export function saveGame(state) {
  try {
    const data = save(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  } catch (err) {
    console.error('Save failed', err);
    return state;
  }
}

export function loadGame() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { state: null, error: null };
  try {
    const { state } = load(raw);
    return { state, error: null };
  } catch (err) {
    console.error('Load failed', err);
    return { state: null, error: err };
  }
}

export function deleteSave() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Delete failed', err);
  }
}

export function exportSaveFile(state) {
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
