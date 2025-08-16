import { describe, it, expect } from 'vitest';
import { sanitize } from './sanitize.js';

describe('sanitize', () => {
  it('escapes HTML special characters', () => {
    const input = `<img src=x onerror="alert(1)">&"'`;
    const expected =
      '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;&amp;&quot;&#39;';
    expect(sanitize(input)).toBe(expected);
  });
});
