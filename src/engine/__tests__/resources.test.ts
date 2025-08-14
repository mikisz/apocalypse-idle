import { describe, it, expect } from 'vitest';
import { clampResource } from '../resources.ts';

describe('clampResource', () => {
  it('clamps values to [0, capacity]', () => {
    expect(clampResource(5, 3)).toBe(3);
    expect(clampResource(-2, 5)).toBe(0);
  });

  it('handles non-finite numbers', () => {
    expect(clampResource(NaN, 2)).toBe(0);
  });
});
