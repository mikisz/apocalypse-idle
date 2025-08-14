import { describe, it, expect } from 'vitest';
import { ROLES, ROLE_BY_RESOURCE } from '../roles.js';

describe('roles data', () => {
  it('defines mason role producing bricks at brick kiln', () => {
    expect(ROLES.mason).toBeDefined();
    expect(ROLES.mason.resources).toContain('bricks');
    expect(ROLES.mason.buildings).toContain('brickKiln');
    expect(ROLE_BY_RESOURCE.bricks).toBe('mason');
  });
});
