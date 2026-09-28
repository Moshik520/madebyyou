import { describe, expect, it } from 'vitest';
import { STORAGE_ROOT, safePath } from './local.provider.js';

describe('safePath', () => {
  it('resolves a normal key inside the storage root', () => {
    expect(safePath('artwork/a/b.png').startsWith(STORAGE_ROOT)).toBe(true);
  });

  it('refuses to escape the storage root', () => {
    expect(() => safePath('../../.env')).toThrow(/storage root/);
  });

  it('refuses an absolute path', () => {
    expect(() => safePath('/etc/passwd')).toThrow(/storage root/);
  });
});
