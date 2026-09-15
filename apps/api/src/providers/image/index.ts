import { mockImageProvider } from './mock.provider.js';
import type { ImageGenProvider } from './types.js';

// One implementation for now. A registry with a config switch arrives when a
// real provider does — see ADR on picking an image model.
export const imageGenProvider: ImageGenProvider = mockImageProvider;

export type { GenerateInput, ImageGenProvider } from './types.js';
