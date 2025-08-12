import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import useGameLoop from '../useGameLoop.ts';

function TestComponent({ cb }) {
  useGameLoop(cb, 1000);
  return null;
}

describe('useGameLoop', () => {
  it('keeps interval running across renders and uses latest callback', () => {
    vi.useFakeTimers();
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');

    const first = vi.fn();
    const second = vi.fn();

    const { rerender, unmount } = render(<TestComponent cb={first} />);
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    expect(clearIntervalSpy).toHaveBeenCalledTimes(0);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(0);

    rerender(<TestComponent cb={second} />);
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    expect(clearIntervalSpy).toHaveBeenCalledTimes(0);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);

    unmount();
    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);

    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
    vi.useRealTimers();
  });
});
