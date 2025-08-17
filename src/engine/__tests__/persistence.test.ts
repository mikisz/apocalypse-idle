import { describe, it, expect, vi } from 'vitest';
import {
  load,
  validateSave,
  CURRENT_SAVE_VERSION,
  saveGame,
  restoreBackup,
  type SaveFile,
} from '../persistence.ts';
import type { GameState } from '../../state/useGame.tsx';
import { defaultState } from '../../state/defaultState.js';

describe('persistence migrations and validation', () => {
  it('migrates v2 saves to include new fields', () => {
    const oldSave: SaveFile = {
      version: 2,
      resources: {} as unknown as GameState['resources'],
      buildings: {} as unknown as GameState['buildings'],
      population: {} as unknown as GameState['population'],
    };

    const { state, migratedFrom } = load(JSON.stringify(oldSave));
    expect(migratedFrom).toBe(2);
    expect(state.version).toBe(CURRENT_SAVE_VERSION);
    expect(state.ui).toEqual({
      activeTab: 'base',
      drawerOpen: false,
      offlineProgress: null,
    });
    expect(Array.isArray(state.log)).toBe(true);
    expect(Array.isArray(state.population.settlers)).toBe(true);
    expect(state.research).toMatchObject({
      current: null,
      completed: [],
      progress: {},
    });
  });

  it('fails validation when essential data is missing', () => {
    const base: SaveFile = {
      version: CURRENT_SAVE_VERSION,
      resources: {} as unknown as GameState['resources'],
      buildings: {} as unknown as GameState['buildings'],
      ui: { activeTab: 'base', drawerOpen: false, offlineProgress: null },
      log: [] as unknown as GameState['log'],
      research: { current: null, completed: [], progress: {} },
      population: { settlers: [] } as unknown as GameState['population'],
    };

    const missingUi: SaveFile = { ...base };
    delete missingUi.ui;
    expect(() => validateSave(missingUi)).toThrow();

    const missingLog: SaveFile = { ...base, log: undefined };
    expect(() => validateSave(missingLog)).toThrow();

    const missingResearch: SaveFile = { ...base };
    delete missingResearch.research;
    expect(() => validateSave(missingResearch)).toThrow();

    const missingSettlers: SaveFile = {
      ...base,
      population: {} as unknown as GameState['population'],
    };
    expect(() => validateSave(missingSettlers)).toThrow();
  });

  it('rejects malformed resource data', () => {
    const base: SaveFile = {
      version: CURRENT_SAVE_VERSION,
      resources: {
        wood: { amount: 1, discovered: true, produced: 0 },
      } as unknown as GameState['resources'],
      buildings: {
        loggingCamp: { count: 1, isDesiredOn: true },
      } as unknown as GameState['buildings'],
      ui: { activeTab: 'base', drawerOpen: false, offlineProgress: null },
      log: [] as unknown as GameState['log'],
      research: { current: null, completed: [], progress: {} },
      population: { settlers: [], candidate: null } as unknown as GameState['population'],
      colony: { radioTimer: 0 } as unknown as GameState['colony'],
    };

    const bad: SaveFile = JSON.parse(JSON.stringify(base));
    (bad.resources as any).wood.amount = 'oops';
    expect(() => validateSave(bad)).toThrow();

    const missing: SaveFile = JSON.parse(JSON.stringify(base));
    delete (missing.resources as any).wood.amount;
    expect(() => validateSave(missing)).toThrow();
  });

  it('rejects malformed building data', () => {
    const base: SaveFile = {
      version: CURRENT_SAVE_VERSION,
      resources: {
        wood: { amount: 1, discovered: true, produced: 0 },
      } as unknown as GameState['resources'],
      buildings: {
        loggingCamp: { count: 1, isDesiredOn: true },
      } as unknown as GameState['buildings'],
      ui: { activeTab: 'base', drawerOpen: false, offlineProgress: null },
      log: [] as unknown as GameState['log'],
      research: { current: null, completed: [], progress: {} },
      population: { settlers: [], candidate: null } as unknown as GameState['population'],
      colony: { radioTimer: 0 } as unknown as GameState['colony'],
    };

    const bad: SaveFile = JSON.parse(JSON.stringify(base));
    (bad.buildings as any).loggingCamp.count = 'two';
    expect(() => validateSave(bad)).toThrow();

    const missing: SaveFile = JSON.parse(JSON.stringify(base));
    delete (missing.buildings as any).loggingCamp.count;
    expect(() => validateSave(missing)).toThrow();
  });

  it('converts string log entries to objects', () => {
    const oldSave: SaveFile = {
      version: 3,
      resources: {},
      buildings: {} as unknown as GameState['buildings'],
      ui: { activeTab: 'base', drawerOpen: false, offlineProgress: null },
      log: ['hello world'] as unknown as GameState['log'],
      research: { current: null, completed: [], progress: {} },
      population: { settlers: [] } as unknown as GameState['population'],
    };

    const { state, migratedFrom } = load(JSON.stringify(oldSave));
    const log = state.log as unknown as { id: string; text: string; time?: number }[];
    expect(migratedFrom).toBe(3);
    expect(state.version).toBe(CURRENT_SAVE_VERSION);
    expect(log).toHaveLength(1);
    expect(log[0].text).toBe('hello world');
    expect(typeof log[0].id).toBe('string');
    expect(typeof log[0].time).toBe('number');
  });

  it('migrates v4 saves to current version', () => {
    const oldSave: SaveFile = {
      version: 4,
      resources: { wood: { amount: 0, discovered: true } },
      buildings: { loggingCamp: { count: 1 } } as unknown as GameState['buildings'],
      ui: { activeTab: 'base', drawerOpen: false, offlineProgress: null },
      log: [{ id: '1', text: 'hi' }] as unknown as GameState['log'],
      research: { current: null, completed: [], progress: {} },
      population: { settlers: [] } as unknown as GameState['population'],
    };

    const { state, migratedFrom } = load(JSON.stringify(oldSave));
    const log = state.log as unknown as { id: string; text: string; time?: number }[];
    expect(migratedFrom).toBe(4);
    expect(state.version).toBe(CURRENT_SAVE_VERSION);
    expect(state.population).toHaveProperty('candidate', null);
    expect(state.colony).toBeDefined();
    expect(state.buildings.loggingCamp).toHaveProperty('isDesiredOn', true);
    expect(typeof log[0].time).toBe('number');
  });

  it('migrates v5 saves to current version', () => {
    const oldSave: SaveFile = {
      version: 5,
      resources: { wood: { amount: 0, discovered: true } },
      buildings: { loggingCamp: { count: 1 } } as unknown as GameState['buildings'],
      ui: { activeTab: 'base', drawerOpen: false, offlineProgress: null },
      log: [{ id: '1', text: 'hi' }] as unknown as GameState['log'],
      research: { current: null, completed: [], progress: {} },
      population: { settlers: [], candidate: null } as unknown as GameState['population'],
      colony: { radioTimer: 0 } as unknown as GameState['colony'],
    };

    const { state, migratedFrom } = load(JSON.stringify(oldSave));
    const log = state.log as unknown as { id: string; text: string; time?: number }[];
    expect(migratedFrom).toBe(5);
    expect(state.version).toBe(CURRENT_SAVE_VERSION);
    expect(state.population).toHaveProperty('candidate');
    expect(state.colony).toBeDefined();
    expect(typeof log[0].time).toBe('number');
    expect(state.buildings.loggingCamp).toHaveProperty('isDesiredOn', true);
  });

  it('migrates v6 saves to current version', () => {
    const oldSave: SaveFile = {
      version: 6,
      resources: { wood: { amount: 0, discovered: true } },
      buildings: { loggingCamp: { count: 1 } } as unknown as GameState['buildings'],
      ui: { activeTab: 'base', drawerOpen: false, offlineProgress: null },
      log: [{ id: '1', text: 'hi', time: 123 }] as unknown as GameState['log'],
      research: { current: null, completed: [], progress: {} },
      population: { settlers: [], candidate: null } as unknown as GameState['population'],
      colony: { radioTimer: 0 } as unknown as GameState['colony'],
    };

    const { state, migratedFrom } = load(JSON.stringify(oldSave));
    const log = state.log as unknown as { id: string; text: string; time?: number }[];
    expect(migratedFrom).toBe(6);
    expect(state.version).toBe(CURRENT_SAVE_VERSION);
    expect(state.population).toHaveProperty('candidate');
    expect(state.colony).toBeDefined();
    expect(state.buildings.loggingCamp).toHaveProperty('isDesiredOn', true);
    expect(log[0].time).toBe(123);
  });

  it('loads v7 saves without migrating', () => {
    const oldSave: SaveFile = {
      version: 7,
      resources: { wood: { amount: 0, discovered: true } },
      buildings: {
        loggingCamp: { count: 1, isDesiredOn: false },
      } as unknown as GameState['buildings'],
      ui: { activeTab: 'base', drawerOpen: false, offlineProgress: null },
      log: [{ id: '1', text: 'hi', time: 123 }] as unknown as GameState['log'],
      research: { current: null, completed: [], progress: {} },
      population: { settlers: [], candidate: null } as unknown as GameState['population'],
      colony: { radioTimer: 0 } as unknown as GameState['colony'],
    };

    const { state, migratedFrom } = load(JSON.stringify(oldSave));
    expect(migratedFrom).toBe(null);
    expect(state.version).toBe(CURRENT_SAVE_VERSION);
    expect(state.population).toHaveProperty('candidate');
    expect(state.colony).toBeDefined();
    expect(state.buildings.loggingCamp).toHaveProperty('isDesiredOn', false);
  });

  it('parses string version numbers', () => {
    const oldSave = {
      version: '2',
      resources: {},
      buildings: {},
      population: {},
    } as unknown as SaveFile;

    const { state, migratedFrom } = load(JSON.stringify(oldSave));
    expect(migratedFrom).toBe(2);
    expect(state.version).toBe(CURRENT_SAVE_VERSION);
  });

  it('throws on future save versions', () => {
    const futureVersion = CURRENT_SAVE_VERSION + 1;
    const futureSave = { version: String(futureVersion) } as unknown as SaveFile;
    expect(() => load(JSON.stringify(futureSave))).toThrow(
      `Save version ${futureVersion} is newer than supported version ${CURRENT_SAVE_VERSION}`,
    );
  });
});

describe('save backups', () => {
  const STORAGE_KEY = 'apocalypse-idle-save';
  const BACKUP_KEY = `${STORAGE_KEY}-backup`;

  it('restores backup when saving fails', () => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ old: true }));

    const originalSetItem = Storage.prototype.setItem;
    let shouldFail = true;
    const spy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(function (this: Storage, key: string, value: string) {
        if (shouldFail && key === STORAGE_KEY) {
          shouldFail = false;
          throw new Error('fail');
        }
        return originalSetItem.call(this, key, value);
      });

    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    saveGame(defaultState as unknown as GameState);

    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify({ old: true }));
    expect(localStorage.getItem(BACKUP_KEY)).toBeNull();

    spy.mockRestore();
    errSpy.mockRestore();
  });

  it('can manually restore backup', () => {
    localStorage.clear();
    localStorage.setItem(BACKUP_KEY, JSON.stringify({ old: true }));
    localStorage.setItem(STORAGE_KEY, 'bad');
    expect(restoreBackup()).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify({ old: true }));
    expect(localStorage.getItem(BACKUP_KEY)).toBeNull();
  });
});
