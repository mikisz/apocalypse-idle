import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EventLog from './EventLog.jsx';

describe('EventLog', () => {
  it('renders without log prop', () => {
    render(<EventLog />);
    expect(screen.getByRole('list')).toBeTruthy();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('renders and updates entries', () => {
    const initial = [
      { id: 'a', text: 'First entry' },
      { id: 'b', text: 'Second entry' },
    ];
    const { rerender } = render(<EventLog log={initial} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('First entry')).toBeTruthy();

    rerender(<EventLog log={[initial[1]]} />);
    expect(screen.queryByText('First entry')).toBeNull();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('Second entry')).toBeTruthy();
  });
});
