// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { setOfflineReason } from '../powerHandling.ts';

describe('setOfflineReason', () => {
  it('marks building offline on power shortage', () => {
    const buildings = {};
    setOfflineReason(buildings, 'radio', 1, 'power');
    expect(buildings.radio.offlineReason).toBe('power');
  });

  it('marks building offline on resource shortage', () => {
    const buildings = {};
    setOfflineReason(buildings, 'sawmill', 1, 'resources');
    expect(buildings.sawmill.offlineReason).toBe('resources');
  });

  it('clears offline flag when shortage is resolved', () => {
    const buildings = { radio: { count: 1, offlineReason: 'power' } };
    setOfflineReason(buildings, 'radio', 1, null);
    expect(buildings.radio.offlineReason).toBeUndefined();
  });

  it('ignores unrecognised reasons', () => {
    const buildings = { radio: { count: 1 } };
    setOfflineReason(buildings, 'radio', 1, 'foo');
    expect(buildings.radio.offlineReason).toBeUndefined();
  });
});
