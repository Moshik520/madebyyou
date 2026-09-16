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

/**
 * Prompt for the image-to-image path.
 *
 * Editing models default to the safest reading of an instruction, which for
 * "a wolf with this person's face" is pasting the photo onto an animal. Getting
 * a single blended creature takes explicit instructions to reinterpret rather
 * than composite — hence a separate builder from the text-to-image one.
 */
export function buildEditPrompt(brief: DesignBrief): string {
  const subject = brief.subject ?? 'a character';

  const parts: string[] = [
    `Reimagine the person in the attached photograph as ${subject}.`,
    'This is a single, unified character — not a collage.',
    "Keep the person's recognisable likeness: face shape, features, expression" +
      ' and hair, reinterpreted in the new form.',
    'Blend skin, fur and anatomy seamlessly, with consistent lighting and one' +
      ' coherent art style across the whole image.',
  ];

  if (brief.style) parts.push(`Art style: ${brief.style}.`);

  if (brief.colorPalette.length > 0) {
    parts.push(`Colour palette: ${brief.colorPalette.join(' and ')}.`);
  }

  if (brief.mood) parts.push(`Mood: ${brief.mood}.`);

  parts.push('Centered composition, transparent background, no text.');

  parts.push(
    'Avoid: a photo pasted onto a body, visible seams or cut-out edges,' +
      ' mismatched lighting, two separate subjects.',
  );

  if (brief.negative) parts.push(`Also avoid: ${brief.negative}.`);

  return parts.join(' ');
}
