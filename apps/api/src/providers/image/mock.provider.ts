import sharp from 'sharp';
import type { GenerateInput, ImageGenProvider } from './types.js';

/** Deterministic hue from the prompt, so the same brief always looks the same. */
function hueFromPrompt(prompt: string): number {
  let hash = 0;

  for (const char of prompt) {
    hash = (hash * 31 + char.codePointAt(0)!) % 360;
  }

  return hash;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Wrap long prompts so they fit inside the placeholder. */
function wrap(text: string, perLine: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).trim().length > perLine) {
      lines.push(current.trim());
      current = word;
      if (lines.length === maxLines) break;
    } else {
      current = `${current} ${word}`;
    }
  }

  if (lines.length < maxLines && current.trim()) lines.push(current.trim());

  return lines;
}

function buildSvg(input: GenerateInput): string {
  const { width, height, prompt } = input;
  const hue = hueFromPrompt(prompt);
  const lines = wrap(prompt, 34, 4);
  const startY = height / 2 - (lines.length - 1) * 26;

  const textRows = lines
    .map(
      (line, i) =>
        `<text x="50%" y="${startY + i * 52}" text-anchor="middle" font-family="Segoe UI, sans-serif" font-size="34" fill="#12212e" opacity="0.85">${escapeXml(line)}</text>`,
    )
    .join('');

  // A transparent PNG with a soft coloured blob — stands in for real artwork.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <radialGradient id="g" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="hsl(${hue} 85% 68%)" stop-opacity="0.95"/>
      <stop offset="70%" stop-color="hsl(${(hue + 40) % 360} 70% 55%)" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="hsl(${(hue + 40) % 360} 70% 55%)" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="${width / 2}" cy="${height * 0.45}" r="${Math.min(width, height) * 0.42}" fill="url(#g)"/>
  ${textRows}
  <text x="50%" y="${height - 48}" text-anchor="middle" font-family="Segoe UI, sans-serif" font-size="26" font-weight="700" fill="#12212e" opacity="0.4">MOCK ARTWORK</text>
</svg>`;
}

/**
 * Stand-in for a real text-to-image model. Produces a transparent PNG of the
 * requested size so the rest of the pipeline is exercised end to end at $0.
 */
export const mockImageProvider: ImageGenProvider = {
  name: 'mock',

  async generate(input: GenerateInput): Promise<Buffer> {
    // Simulate latency so loading states are real during development.
    await new Promise((resolve) => setTimeout(resolve, 700));

    return sharp(Buffer.from(buildSvg(input))).png().toBuffer();
  },
};
