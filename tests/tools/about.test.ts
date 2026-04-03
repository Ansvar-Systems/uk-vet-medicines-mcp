import { describe, test, expect } from 'vitest';
import { handleAbout } from '../../src/tools/about.js';

describe('about tool', () => {
  test('returns server metadata', () => {
    const result = handleAbout();
    expect(result.name).toBe('UK Vet Medicines MCP');
    expect(result.description).toContain('veterinary');
    expect(result.jurisdiction).toEqual(['GB']);
    expect(result.tools_count).toBe(10);
    expect(result.links).toHaveProperty('homepage');
    expect(result._meta).toHaveProperty('disclaimer');
  });

  test('disclaimer warns about withdrawal periods', () => {
    const result = handleAbout();
    expect(result._meta.disclaimer).toContain('withdrawal');
    expect(result._meta.disclaimer).toContain('SPC');
  });
});
