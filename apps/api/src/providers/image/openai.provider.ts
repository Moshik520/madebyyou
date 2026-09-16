import OpenAI, { toFile } from 'openai';
import { config } from '../../platform/config.js';
import { logger } from '../../platform/logger.js';
import type {
  EditInput,
  GenerateInput,
  ImageEditProvider,
  ImageGenProvider,
} from './types.js';

const MODEL = 'gpt-image-2.5-flare';

// Created lazily so a project running on the mock provider never needs a key.
let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    if (!config.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    client = new OpenAI({ apiKey: config.OPENAI_API_KEY });
  }

  return client;
}

export const openAiImageProvider: ImageGenProvider = {
  name: 'openai:gpt-image-2.5-flare',

  async generate(input: GenerateInput): Promise<Buffer> {
    const started = Date.now();

    const response = await getClient().images.generate({
      model: MODEL,
      prompt: input.prompt,
      size: `${input.width}x${input.height}`,
      quality: config.IMAGE_QUALITY,
      background: 'transparent',
      output_format: 'png',
      n: 1,
    });

    const encoded = response.data?.[0]?.b64_json;

    if (!encoded) {
      throw new Error('Image provider returned no image data');
    }

    logger.info(
      {
        model: MODEL,
        quality: config.IMAGE_QUALITY,
        size: `${input.width}x${input.height}`,
        ms: Date.now() - started,
        usage: response.usage,
      },
      'image generated',
    );

    return Buffer.from(encoded, 'base64');
  },
};

export const openAiImageEditProvider: ImageEditProvider = {
  name: 'openai:gpt-image-2.5-flare:edit',

  async edit(input: EditInput): Promise<Buffer> {
    const started = Date.now();

    const response = await getClient().images.edit({
      model: MODEL,
      image: await toFile(input.image, 'source.png', { type: 'image/png' }),
      prompt: input.prompt,
      size: `${input.width}x${input.height}`,
      quality: config.IMAGE_QUALITY,
      background: 'transparent',
      output_format: 'png',
      n: 1,
    });

    const encoded = response.data?.[0]?.b64_json;

    if (!encoded) {
      throw new Error('Image provider returned no image data');
    }

    logger.info(
      {
        model: MODEL,
        mode: 'edit',
        quality: config.IMAGE_QUALITY,
        ms: Date.now() - started,
        usage: response.usage,
      },
      'image edited',
    );

    return Buffer.from(encoded, 'base64');
  },
};
