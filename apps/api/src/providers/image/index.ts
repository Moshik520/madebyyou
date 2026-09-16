import { config } from '../../platform/config.js';
import { mockImageProvider } from './mock.provider.js';
import {
  openAiImageEditProvider,
  openAiImageProvider,
} from './openai.provider.js';
import { mockImageEditProvider } from './mock.provider.js';
import type { ImageEditProvider, ImageGenProvider } from './types.js';

function createImageGenProvider(): ImageGenProvider {
  switch (config.IMAGE_PROVIDER) {
    case 'mock':
      return mockImageProvider;
    case 'openai':
      return openAiImageProvider;
    default:
      throw new Error(
        `Unknown image provider: ${config.IMAGE_PROVIDER as string}`,
      );
  }
}

function createImageEditProvider(): ImageEditProvider {
  switch (config.IMAGE_PROVIDER) {
    case 'mock':
      return mockImageEditProvider;
    case 'openai':
      return openAiImageEditProvider;
    default:
      throw new Error(
        `Unknown image provider: ${config.IMAGE_PROVIDER as string}`,
      );
  }
}

export const imageGenProvider: ImageGenProvider = createImageGenProvider();
export const imageEditProvider: ImageEditProvider = createImageEditProvider();

export type {
  EditInput,
  GenerateInput,
  ImageEditProvider,
  ImageGenProvider,
} from './types.js';
