import { describe, it, expect } from 'vitest';
import { addResource, consumeResource } from '../resourceOps.ts';
import { defaultState } from '../../state/defaultState.js';
import { deepClone } from '../../utils/clone.ts';

describe('resourceOps helpers', () => {
  it('handles non-food resources with clamping', () => {
    const state = deepClone(defaultState);
    const resources: any = { ...state.resources };
    const foodPool = { ...state.foodPool };
    addResource(state, resources, 'wood', 100, foodPool);
    expect(resources.wood.amount).toBe(80); // wood capacity 80
    expect(resources.wood.produced).toBe(80);
    const consumed = consumeResource(state, resources, 'wood', 50, foodPool);
    expect(consumed).toBe(50);
    expect(resources.wood.amount).toBe(30);
    expect(resources.wood.produced).toBe(80); // consumption doesn't change produced
  });

  it('updates food pool when adding and consuming food', () => {
    const state = deepClone(defaultState);
    const resources: any = { ...state.resources };
    const foodPool = { ...state.foodPool };
    addResource(state, resources, 'potatoes', 500, foodPool);
    expect(foodPool.amount).toBe(foodPool.capacity);
    expect(resources.potatoes.amount).toBe(foodPool.capacity);
    const consumed = consumeResource(
      state,
      resources,
      'potatoes',
      50,
      foodPool,
    );
    expect(consumed).toBe(50);
    expect(resources.potatoes.amount).toBe(foodPool.capacity - 50);
    expect(foodPool.amount).toBe(foodPool.capacity - 50);
  });
});
