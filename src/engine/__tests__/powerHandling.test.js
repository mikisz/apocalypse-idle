import { describe, it, expect } from 'vitest';
import { setPowerStatus } from '../powerHandling.js';

describe('setPowerStatus', () => {
  it('marks building offline on power shortage', () => {
    const buildings = {};
    setPowerStatus(buildings, 'radio', 1, true);
    expect(buildings.radio.offlineReason).toBe('power');
  });

  it('clears offline flag when power is restored', () => {
    const buildings = { radio: { count: 1, offlineReason: 'power' } };
    setPowerStatus(buildings, 'radio', 1, false);
    expect(buildings.radio.offlineReason).toBeUndefined();
  });
});
