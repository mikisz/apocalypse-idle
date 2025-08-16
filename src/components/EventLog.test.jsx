import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import EventLog from './EventLog.jsx';

afterEach(cleanup);

describe('EventLog', () => {
  it('renders without log prop', () => {
    render(<EventLog />);
    expect(screen.getByRole('list')).toBeTruthy();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('renders and updates entries', () => {
    const initial = [
      { id: 'a', text: 'First entry', time: 0 },
      { id: 'b', text: 'Second entry', time: 1 },
    ];
    const { rerender } = render(<EventLog log={initial} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getAllByRole('listitem')[0].textContent).toMatch(
      /First entry/,
    );

    rerender(<EventLog log={[initial[1]]} />);
    expect(screen.getAllByRole('listitem')[0].textContent).toMatch(
      /Second entry/,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('sanitizes malicious text', () => {
    const malicious = '<img src=x onerror="alert(1)">';
    render(<EventLog log={[{ id: 'x', text: malicious, time: 0 }]} />);
    const item = screen.getByRole('listitem');
    expect(item.innerHTML).not.toContain('<img');
    expect(item.textContent).toContain(malicious);
  });
});
