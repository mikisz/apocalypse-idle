import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../../../engine/persistence.ts', () => ({
  loadGame: vi.fn(),
  deleteSave: vi.fn(),
  saveGame: vi.fn(),
  CURRENT_SAVE_VERSION: 7,
}));
vi.mock('../../prepareLoadedState.ts', () => ({
  prepareLoadedState: vi.fn((s: any) => ({ ...s, prepared: true })),
}));

import { loadGame, deleteSave, saveGame } from '../../../engine/persistence.ts';
import { prepareLoadedState } from '../../prepareLoadedState.ts';
import { defaultState } from '../../defaultState.js';
import usePersistenceActions from '../usePersistenceActions';

describe('usePersistenceActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retries load and sets state', () => {
    (loadGame as any).mockReturnValue({ state: { a: 1 }, error: null });
    let state: any = {};
    const setState = vi.fn((updater) => {
      state = typeof updater === 'function' ? updater(state) : updater;
    });
    const setLoadError = vi.fn();
    const { result } = renderHook(() =>
      usePersistenceActions(setState, setLoadError),
    );
    act(() => result.current.retryLoad());
    expect(setLoadError).toHaveBeenCalledWith(false);
    expect(setState).toHaveBeenCalledWith({ a: 1, prepared: true });
  });

  it('handles load error', () => {
    (loadGame as any).mockReturnValue({ state: null, error: 'err' });
    const setState = vi.fn();
    const setLoadError = vi.fn();
    const { result } = renderHook(() =>
      usePersistenceActions(setState, setLoadError),
    );
    act(() => result.current.retryLoad());
    expect(setLoadError).toHaveBeenCalledWith(true);
    expect(setState).not.toHaveBeenCalled();
  });

  it('resets game after confirmation', () => {
    (loadGame as any).mockReturnValue({ state: null, error: null });
    (window as any).confirm = vi.fn(() => true);
    vi.spyOn(Date, 'now').mockReturnValue(123);
    const setState = vi.fn();
    const setLoadError = vi.fn();
    const { result } = renderHook(() =>
      usePersistenceActions(setState, setLoadError),
    );
    act(() => result.current.resetGame());
    const expected = { ...defaultState, lastSaved: 123 } as any;
    expect(deleteSave).toHaveBeenCalled();
    expect(saveGame).toHaveBeenCalledWith(expected);
    expect(setState).toHaveBeenCalledWith(expected);
    expect(setLoadError).toHaveBeenCalledWith(false);
  });
});
