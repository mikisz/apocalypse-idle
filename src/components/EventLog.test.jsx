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
});
