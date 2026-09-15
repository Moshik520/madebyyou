import type { DesignBrief } from '../llm/types.js';

/**
 * Brief -> prompt. Deterministic: the same brief always produces the same
 * string, so two versions can be compared and a result can be reproduced.
 */
export function buildImagePrompt(brief: DesignBrief): string {
  const parts: string[] = [];

  if (brief.subject) parts.push(brief.subject);
  if (brief.style) parts.push(brief.style);
  if (brief.colorPalette.length > 0) {
    parts.push(`${brief.colorPalette.join(' and ')} color palette`);
  }
  if (brief.mood) parts.push(`${brief.mood} mood`);

  parts.push('centered composition');
  parts.push('transparent background');
  parts.push('no text');

  const prompt = parts.join(', ');

  return brief.negative ? `${prompt}. Avoid: ${brief.negative}` : prompt;
}
