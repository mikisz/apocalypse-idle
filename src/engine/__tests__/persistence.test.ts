// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';
import { load, validateSave, CURRENT_SAVE_VERSION, saveGame, restoreBackup } from '../persistence.ts';

describe('persistence migrations and validation', () => {
  it('migrates v2 saves to include new fields', () => {
    const oldSave = {
      version: 2,
      resources: {},
      buildings: {},
      population: {},
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
    const base = {
      version: CURRENT_SAVE_VERSION,
      resources: {},
      buildings: {},
      ui: { activeTab: 'base', drawerOpen: false, offlineProgress: null },
      log: [],
      research: { current: null, completed: [], progress: {} },
      population: { settlers: [] },
    };

    const missingUi = { ...base };
    delete missingUi.ui;
    expect(() => validateSave(missingUi)).toThrow();

    const missingLog = { ...base, log: undefined };
    expect(() => validateSave(missingLog)).toThrow();

    const missingResearch = { ...base };
    delete missingResearch.research;
    expect(() => validateSave(missingResearch)).toThrow();

    const missingSettlers = { ...base, population: {} };
    expect(() => validateSave(missingSettlers)).toThrow();
  });

  it('rejects malformed resource data', () => {
    const base = {
      version: CURRENT_SAVE_VERSION,
      resources: { wood: { amount: 1, discovered: true, produced: 0 } },
      buildings: { loggingCamp: { count: 1, isDesiredOn: true } },
      ui: { activeTab: 'base', drawerOpen: false, offlineProgress: null },
      log: [],
      research: { current: null, completed: [], progress: {} },
      population: { settlers: [], candidate: null },
      colony: { radioTimer: 0 },
    };

    const bad = JSON.parse(JSON.stringify(base));
    bad.resources.wood.amount = 'oops';
    expect(() => validateSave(bad)).toThrow();

    const missing = JSON.parse(JSON.stringify(base));
    delete missing.resources.wood.amount;
    expect(() => validateSave(missing)).toThrow();
  });

  it('rejects malformed building data', () => {
    const base = {
      version: CURRENT_SAVE_VERSION,
      resources: { wood: { amount: 1, discovered: true, produced: 0 } },
      buildings: { loggingCamp: { count: 1, isDesiredOn: true } },
      ui: { activeTab: 'base', drawerOpen: false, offlineProgress: null },
      log: [],
      research: { current: null, completed: [], progress: {} },
      population: { settlers: [], candidate: null },
      colony: { radioTimer: 0 },
    };

    const bad = JSON.parse(JSON.stringify(base));
    bad.buildings.loggingCamp.count = 'two';
    expect(() => validateSave(bad)).toThrow();

    const missing = JSON.parse(JSON.stringify(base));
    delete missing.buildings.loggingCamp.count;
    expect(() => validateSave(missing)).toThrow();
  });

  it('converts string log entries to objects', () => {
    const oldSave = {
      version: 3,
      resources: {},
      buildings: {},
      ui: { activeTab: 'base', drawerOpen: false, offlineProgress: null },
      log: ['hello world'],
      research: { current: null, completed: [], progress: {} },
      population: { settlers: [] },
    };

    const { state, migratedFrom } = load(JSON.stringify(oldSave));
    expect(migratedFrom).toBe(3);
    expect(state.version).toBe(CURRENT_SAVE_VERSION);
    expect(state.log).toHaveLength(1);
    expect(state.log[0].text).toBe('hello world');
    expect(typeof state.log[0].id).toBe('string');
    expect(typeof state.log[0].time).toBe('number');
  });

  it('migrates v4 saves to current version', () => {
    const oldSave = {
      version: 4,
      resources: { wood: { amount: 0, discovered: true } },
      buildings: { loggingCamp: { count: 1 } },
      ui: { activeTab: 'base', drawerOpen: false, offlineProgress: null },
      log: [{ id: '1', text: 'hi' }],
      research: { current: null, completed: [], progress: {} },
      population: { settlers: [] },
    };

    const { state, migratedFrom } = load(JSON.stringify(oldSave));
    expect(migratedFrom).toBe(4);
    expect(state.version).toBe(CURRENT_SAVE_VERSION);
    expect(state.population).toHaveProperty('candidate', null);
    expect(state.colony).toBeDefined();
    expect(state.buildings.loggingCamp).toHaveProperty('isDesiredOn', true);
    expect(typeof state.log[0].time).toBe('number');
  });

  it('migrates v5 saves to current version', () => {
    const oldSave = {
      version: 5,
      resources: { wood: { amount: 0, discovered: true } },
      buildings: { loggingCamp: { count: 1 } },
      ui: { activeTab: 'base', drawerOpen: false, offlineProgress: null },
      log: [{ id: '1', text: 'hi' }],
      research: { current: null, completed: [], progress: {} },
      population: { settlers: [], candidate: null },
      colony: { radioTimer: 0 },
    };

    const { state, migratedFrom } = load(JSON.stringify(oldSave));
    expect(migratedFrom).toBe(5);
    expect(state.version).toBe(CURRENT_SAVE_VERSION);
    expect(state.population).toHaveProperty('candidate');
    expect(state.colony).toBeDefined();
    expect(typeof state.log[0].time).toBe('number');
    expect(state.buildings.loggingCamp).toHaveProperty('isDesiredOn', true);
  });

  it('migrates v6 saves to current version', () => {
    const oldSave = {
      version: 6,
      resources: { wood: { amount: 0, discovered: true } },
      buildings: { loggingCamp: { count: 1 } },
      ui: { activeTab: 'base', drawerOpen: false, offlineProgress: null },
      log: [{ id: '1', text: 'hi', time: 123 }],
      research: { current: null, completed: [], progress: {} },
      population: { settlers: [], candidate: null },
      colony: { radioTimer: 0 },
    };

    const { state, migratedFrom } = load(JSON.stringify(oldSave));
    expect(migratedFrom).toBe(6);
    expect(state.version).toBe(CURRENT_SAVE_VERSION);
    expect(state.population).toHaveProperty('candidate');
    expect(state.colony).toBeDefined();
    expect(state.buildings.loggingCamp).toHaveProperty('isDesiredOn', true);
    expect(state.log[0].time).toBe(123);
  });

  it('loads v7 saves without migrating', () => {
    const oldSave = {
      version: 7,
      resources: { wood: { amount: 0, discovered: true } },
      buildings: { loggingCamp: { count: 1, isDesiredOn: false } },
      ui: { activeTab: 'base', drawerOpen: false, offlineProgress: null },
      log: [{ id: '1', text: 'hi', time: 123 }],
      research: { current: null, completed: [], progress: {} },
      population: { settlers: [], candidate: null },
      colony: { radioTimer: 0 },
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
    };

    const { state, migratedFrom } = load(JSON.stringify(oldSave));
    expect(migratedFrom).toBe(2);
    expect(state.version).toBe(CURRENT_SAVE_VERSION);
  });

  it('throws on future save versions', () => {
    const futureVersion = CURRENT_SAVE_VERSION + 1;
    const futureSave = { version: String(futureVersion) };
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
      .mockImplementation(function (key, value) {
        if (shouldFail && key === STORAGE_KEY) {
          shouldFail = false;
          throw new Error('fail');
        }
        return originalSetItem.call(this, key, value);
      });

    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    saveGame({ fresh: true });

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
