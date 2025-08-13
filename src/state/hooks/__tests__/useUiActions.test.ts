import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useUiActions from '../useUiActions';

describe('useUiActions', () => {
  it('sets active tab', () => {
    let state: any = {
      ui: { activeTab: 'a', drawerOpen: false, offlineProgress: null },
    };
    const setState = vi.fn((updater) => {
      state = typeof updater === 'function' ? updater(state) : updater;
    });
    const { result } = renderHook(() => useUiActions(setState));
    act(() => result.current.setActiveTab('b'));
    expect(state.ui.activeTab).toBe('b');
  });

  it('toggles drawer', () => {
    let state: any = {
      ui: { activeTab: 'a', drawerOpen: false, offlineProgress: null },
    };
    const setState = vi.fn((updater) => {
      state = typeof updater === 'function' ? updater(state) : updater;
    });
    const { result } = renderHook(() => useUiActions(setState));
    act(() => result.current.toggleDrawer());
    expect(state.ui.drawerOpen).toBe(true);
  });

  it('dismisses offline modal', () => {
    let state: any = {
      ui: { activeTab: 'a', drawerOpen: false, offlineProgress: {} },
    };
    const setState = vi.fn((updater) => {
      state = typeof updater === 'function' ? updater(state) : updater;
    });
    const { result } = renderHook(() => useUiActions(setState));
    act(() => result.current.dismissOfflineModal());
    expect(state.ui.offlineProgress).toBeNull();
  });
});
