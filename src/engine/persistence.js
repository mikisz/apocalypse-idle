const STORAGE_KEY = 'apocalypse-idle-save';

export const CURRENT_SAVE_VERSION = 2;

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
