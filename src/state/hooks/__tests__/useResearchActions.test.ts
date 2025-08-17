import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../../../engine/research.ts', () => ({
  startResearch: vi.fn((state: any, id: string) => ({
    ...state,
    research: id,
  })),
  cancelResearch: vi.fn((state: any) => ({ ...state, research: null })),
}));

import { startResearch, cancelResearch } from '../../../engine/research.ts';
import useResearchActions from '../useResearchActions';

describe('useResearchActions', () => {
  it('begins and aborts research', () => {
    let state: any = { research: null };
    const setState = vi.fn((updater) => {
      state = typeof updater === 'function' ? updater(state) : updater;
    });
    const { result } = renderHook(() => useResearchActions(setState));
    act(() => result.current.beginResearch('tech'));
    expect(startResearch).toHaveBeenCalled();
    act(() => result.current.abortResearch());
    expect(cancelResearch).toHaveBeenCalled();
  });
});
