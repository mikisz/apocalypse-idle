// @ts-nocheck
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

const toast = vi.fn();
vi.mock('../../../components/ui/toast.tsx', () => ({
  useToast: () => ({ toast, dismiss: vi.fn() }),
}));

import useNotifications from '../useNotifications';
import { RESEARCH_MAP } from '../../../data/research.js';
import { RESOURCES } from '../../../data/resources.js';
import { BUILDING_MAP } from '../../../data/buildings.js';
import { SKILL_LABELS } from '../../../data/roles.js';

const setState = vi.fn();

function Wrapper({ state }: { state: any }) {
  useNotifications(state, setState);
  return null;
}

describe('useNotifications', () => {
  beforeEach(() => {
    toast.mockClear();
    setState.mockClear();
  });

  it('toasts when research completes', () => {
    const initial = {
      research: { current: { id: 'industry1' }, completed: [] },
      resources: {},
      population: { candidate: null, settlers: [] },
      buildings: {},
    };
    const done = {
      research: { current: null, completed: ['industry1'] },
      resources: {},
      population: { candidate: null, settlers: [] },
      buildings: {},
    };
    const { rerender } = render(<Wrapper state={initial} />);
    rerender(<Wrapper state={done} />);
    expect(toast).toHaveBeenCalledWith({
      description: `${RESEARCH_MAP.industry1.name} research complete`,
    });
  });

  it('does not toast when research is cancelled', () => {
    const initial = {
      research: { current: { id: 'industry1' }, completed: [] },
      resources: {},
      population: { candidate: null, settlers: [] },
      buildings: {},
    };
    const cancelled = {
      research: { current: null, completed: [] },
      resources: {},
      population: { candidate: null, settlers: [] },
      buildings: {},
    };
    const { rerender } = render(<Wrapper state={initial} />);
    rerender(<Wrapper state={cancelled} />);
    expect(toast).not.toHaveBeenCalled();
  });

  it('toasts when resource hits capacity', () => {
    const initial = {
      research: { current: null, completed: [] },
      resources: { wood: { amount: 49 } },
      population: { candidate: null, settlers: [] },
      buildings: {},
    };
    const next = {
      research: { current: null, completed: [] },
      resources: { wood: { amount: 50 } },
      population: { candidate: null, settlers: [] },
      buildings: {},
    };
    const { rerender } = render(<Wrapper state={initial} />);
    rerender(<Wrapper state={next} />);
    expect(toast).toHaveBeenCalledWith({
      description: `${RESOURCES.wood.name} storage full`,
    });
  });

  it('toasts when a candidate appears', () => {
    const initial = {
      research: { current: null, completed: [] },
      resources: {},
      population: { candidate: null, settlers: [] },
      buildings: {},
    };
    const next = {
      research: { current: null, completed: [] },
      resources: {},
      population: { candidate: { id: 'cand1' }, settlers: [] },
      buildings: {},
    };
    const { rerender } = render(<Wrapper state={initial} />);
    rerender(<Wrapper state={next} />);
    expect(toast).toHaveBeenCalledWith({
      description: 'New settler candidate available',
    });
    rerender(<Wrapper state={next} />);
    expect(toast).toHaveBeenCalledTimes(1);
  });

  it('announces settler deaths', () => {
    const alive = { id: 's1', name: 'Bob', isDead: false };
    const dead = { id: 's1', name: 'Bob', isDead: true };
    const initial = {
      research: { current: null, completed: [] },
      resources: {},
      population: { candidate: null, settlers: [alive] },
      buildings: {},
    };
    const next = {
      research: { current: null, completed: [] },
      resources: {},
      population: { candidate: null, settlers: [dead] },
      buildings: {},
    };
    const { rerender } = render(<Wrapper state={initial} />);
    rerender(<Wrapper state={next} />);
    expect(toast).toHaveBeenCalledWith({ description: 'Bob has died' });
    rerender(<Wrapper state={next} />);
    expect(toast).toHaveBeenCalledTimes(1);
  });

  it('toasts when building loses power and dedupes', () => {
    const initial = {
      research: { current: null, completed: [] },
      resources: {},
      population: { candidate: null, settlers: [] },
      buildings: { radio: {} },
    };
    const offline = {
      research: { current: null, completed: [] },
      resources: {},
      population: { candidate: null, settlers: [] },
      buildings: { radio: { offlineReason: 'power' } },
    };
    const { rerender } = render(<Wrapper state={initial} />);
    rerender(<Wrapper state={offline} />);
    expect(toast).toHaveBeenCalledWith({
      description: `Power shortage: ${BUILDING_MAP.radio.name} offline`,
    });
    rerender(<Wrapper state={offline} />);
    expect(toast).toHaveBeenCalledTimes(1);
  });

  it('does not toast power loss when building is off', () => {
    const initial = {
      research: { current: null, completed: [] },
      resources: {},
      population: { candidate: null, settlers: [] },
      buildings: { radio: { isDesiredOn: false } },
    };
    const offline = {
      research: { current: null, completed: [] },
      resources: {},
      population: { candidate: null, settlers: [] },
      buildings: { radio: { isDesiredOn: false, offlineReason: 'power' } },
    };
    const { rerender } = render(<Wrapper state={initial} />);
    rerender(<Wrapper state={offline} />);
    expect(toast).not.toHaveBeenCalled();
  });

  it('toasts when building lacks resources and dedupes', () => {
    const initial = {
      research: { current: null, completed: [] },
      resources: {},
      population: { candidate: null, settlers: [] },
      buildings: { sawmill: {} },
    };
    const offline = {
      research: { current: null, completed: [] },
      resources: {},
      population: { candidate: null, settlers: [] },
      buildings: { sawmill: { offlineReason: 'resources' } },
    };
    const { rerender } = render(<Wrapper state={initial} />);
    rerender(<Wrapper state={offline} />);
    expect(toast).toHaveBeenCalledWith({
      description: `Resource shortage: ${BUILDING_MAP.sawmill.name} offline`,
    });
    rerender(<Wrapper state={offline} />);
    expect(toast).toHaveBeenCalledTimes(1);
  });

  it('toasts when a settler levels up a skill', () => {
    const before = {
      research: { current: null, completed: [] },
      resources: {},
      population: {
        candidate: null,
        settlers: [
          {
            id: 's1',
            firstName: 'Ann',
            lastName: 'Lee',
            isDead: false,
            skills: { gatherer: { level: 3 } },
          },
        ],
      },
      buildings: {},
    };
    const after = {
      research: { current: null, completed: [] },
      resources: {},
      population: {
        candidate: null,
        settlers: [
          {
            id: 's1',
            firstName: 'Ann',
            lastName: 'Lee',
            isDead: false,
            skills: { gatherer: { level: 4 } },
          },
        ],
      },
      buildings: {},
    };
    const { rerender } = render(<Wrapper state={before} />);
    rerender(<Wrapper state={after} />);
    expect(toast).toHaveBeenCalledWith({
      description: `Ann Lee reached ${SKILL_LABELS.gatherer} level 4`,
    });
  });

  it('toasts when happiness crosses 50%', () => {
    const high = {
      research: { current: null, completed: [] },
      resources: {},
      population: { candidate: null, settlers: [] },
      buildings: {},
      colony: { happiness: { value: 60 } },
    };
    const low = {
      research: { current: null, completed: [] },
      resources: {},
      population: { candidate: null, settlers: [] },
      buildings: {},
      colony: { happiness: { value: 45 } },
    };
    const { rerender } = render(<Wrapper state={high} />);
    rerender(<Wrapper state={low} />);
    expect(toast).toHaveBeenCalledWith({
      description: 'Happiness dropped below 50%',
    });
    rerender(<Wrapper state={high} />);
    expect(toast).toHaveBeenCalledWith({
      description: 'Happiness increased above 50%',
    });
  });

  it('does not toast for minor happiness fluctuations', () => {
    const high = {
      research: { current: null, completed: [] },
      resources: {},
      population: { candidate: null, settlers: [] },
      buildings: {},
      colony: { happiness: { value: 50.0001 } },
    };
    const low = {
      research: { current: null, completed: [] },
      resources: {},
      population: { candidate: null, settlers: [] },
      buildings: {},
      colony: { happiness: { value: 49.9999 } },
    };
    const { rerender } = render(<Wrapper state={high} />);
    rerender(<Wrapper state={low} />);
    expect(toast).not.toHaveBeenCalled();
  });

  it('does not toast when happiness stays below 50%', () => {
    const lower = {
      research: { current: null, completed: [] },
      resources: {},
      population: { candidate: null, settlers: [] },
      buildings: {},
      colony: { happiness: { value: 49.4 } },
    };
    const slightlyHigher = {
      research: { current: null, completed: [] },
      resources: {},
      population: { candidate: null, settlers: [] },
      buildings: {},
      colony: { happiness: { value: 49.6 } },
    };
    const { rerender } = render(<Wrapper state={lower} />);
    rerender(<Wrapper state={slightlyHigher} />);
    expect(toast).not.toHaveBeenCalled();
  });
});
