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

function Wrapper({ state }: { state: any }) {
  useNotifications(state);
  return null;
}

describe('useNotifications', () => {
  beforeEach(() => {
    toast.mockClear();
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
      resources: { wood: { amount: 79 } },
      population: { candidate: null, settlers: [] },
      buildings: {},
    };
    const next = {
      research: { current: null, completed: [] },
      resources: { wood: { amount: 80 } },
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
});
