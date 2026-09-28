import { describe, expect, it } from 'vitest';
import { extractJsonObject } from './json-extract.js';

describe('extractJsonObject', () => {
  it('parses a bare object', () => {
    expect(extractJsonObject('{"status":"READY"}')).toEqual({ status: 'READY' });
  });

  it('unwraps a fenced code block', () => {
    const raw = '```json\n{"status":"READY"}\n```';

    expect(extractJsonObject(raw)).toEqual({ status: 'READY' });
  });

  it('ignores prose around the object', () => {
    const raw = 'Sure! Here you go:\n{"status":"READY"}\nHope that helps.';

    expect(extractJsonObject(raw)).toEqual({ status: 'READY' });
  });

  it('keeps nested objects intact', () => {
    const raw = 'text {"brief":{"subject":"wolf"},"status":"READY"} more';

    expect(extractJsonObject(raw)).toEqual({
      brief: { subject: 'wolf' },
      status: 'READY',
    });
  });

  it('throws when there is no JSON at all', () => {
    expect(() => extractJsonObject('I cannot help with that.')).toThrow();
  });
});
