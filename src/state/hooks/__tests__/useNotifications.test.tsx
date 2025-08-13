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
    };
    const done = {
      research: { current: null, completed: ['industry1'] },
      resources: {},
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
    };
    const cancelled = {
      research: { current: null, completed: [] },
      resources: {},
    };
    const { rerender } = render(<Wrapper state={initial} />);
    rerender(<Wrapper state={cancelled} />);
    expect(toast).not.toHaveBeenCalled();
  });

  it('toasts when resource hits capacity', () => {
    const initial = {
      research: { current: null, completed: [] },
      resources: { wood: { amount: 79 } },
    };
    const next = {
      research: { current: null, completed: [] },
      resources: { wood: { amount: 80 } },
    };
    const { rerender } = render(<Wrapper state={initial} />);
    rerender(<Wrapper state={next} />);
    expect(toast).toHaveBeenCalledWith({
      description: `${RESOURCES.wood.name} storage full`,
    });
  });
});
