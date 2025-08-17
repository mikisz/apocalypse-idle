import { describe, it, expect } from 'vitest';
import BaseView from '../BaseView.jsx';

describe('BaseView', () => {
  it('renders without crashing', () => {
    expect(typeof BaseView).toBe('function');
  });
});
