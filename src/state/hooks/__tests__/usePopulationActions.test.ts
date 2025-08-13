import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import usePopulationActions from '../usePopulationActions';

describe('usePopulationActions', () => {
  it('sets settler role when building available', () => {
    let state: any = {
      population: { settlers: [{ id: 's1', firstName: 'A', lastName: 'B', role: null }] },
      buildings: { potatoField: { count: 1 } },
      log: [],
    };
    const setState = vi.fn((updater) => {
      state = typeof updater === 'function' ? updater(state) : updater;
    });
    const { result } = renderHook(() => usePopulationActions(setState));
    act(() => result.current.setSettlerRole('s1', 'farmer'));
    expect(state.population.settlers[0].role).toBe('farmer');
  });

  it('banishes settler', () => {
    let state: any = {
      population: { settlers: [{ id: 's1', firstName: 'A', lastName: 'B', role: null }] },
      buildings: {},
      log: [],
    };
    const setState = vi.fn((updater) => {
      state = typeof updater === 'function' ? updater(state) : updater;
    });
    const { result } = renderHook(() => usePopulationActions(setState));
    act(() => result.current.banishSettler('s1'));
    expect(state.population.settlers).toHaveLength(0);
  });
});
