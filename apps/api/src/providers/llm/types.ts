import { z } from 'zod';

/**
 * Where the artwork comes from. This single field decides which provider
 * runs — or whether any model runs at all.
 */
export const artworkSourceSchema = z.enum([
  'GENERATE',         // no image yet — a model draws it
  'UPLOAD',           // the user's own image, used as-is
  'UPLOAD_TRANSFORM', // the user's image, reworked by a model
]);

/**
 * Where the artwork sits inside the product's print area, as fractions rather
 * than pixels — so the same design lands correctly on a bottle and on a mug,
 * whose print areas have very different shapes.
 */
export const placementSchema = z.object({
  x: z.number().min(0).max(1).default(0.5),
  y: z.number().min(0).max(1).default(0.5),
  scale: z.number().min(0.1).max(1).default(1),
});

export type Placement = z.infer<typeof placementSchema>;

export const defaultPlacement: Placement = { x: 0.5, y: 0.5, scale: 1 };

export const textOverlaySchema = z.object({
  content: z.string().min(1).max(80).nullable(),
  placement: z.enum(['ABOVE', 'BELOW', 'CENTER']),
  color: z.string().nullable(),
});


/** What the user wants — described in product terms, not model terms. */
export const designBriefSchema = z.object({
  artworkSource: artworkSourceSchema.nullable(),
  subject: z.string().nullable(),
  style: z.string().nullable(),
  colorPalette: z.array(z.string()),
  mood: z.string().nullable(),
  negative: z.string().nullable(),
  textOverlay: textOverlaySchema.nullable(),
  placement: placementSchema.default(defaultPlacement),
});

export type DesignBrief = z.infer<typeof designBriefSchema>;

export const emptyBrief: DesignBrief = {
  artworkSource: null,
  subject: null,
  style: null,
  colorPalette: [],
  mood: null,
  negative: null,
  textOverlay: null,
  placement: defaultPlacement,
};

/** The contract the model must satisfy on every turn. */
export const agentTurnSchema = z.object({
  reply: z.string().min(1),
  brief: designBriefSchema,
  status: z.enum(['NEEDS_INPUT', 'READY']),
  quickReplies: z.array(z.string()),
  needsUpload: z.boolean(),
  capability: z.enum(['NONE', 'TEXT_TO_IMAGE', 'IMAGE_TO_IMAGE']),
});

export type AgentTurn = z.infer<typeof agentTurnSchema>;

export type AgentTurnInput = {
  systemPrompt: string;
  history: { role: 'USER' | 'ASSISTANT'; content: string }[];
  brief: DesignBrief | null;
  /** Whether the user has already attached an image to this project. */
  hasSourceImage: boolean;
  /** How many designs have been produced so far in this project. */
  versionCount: number;
  userMessage: string;
};

export interface LLMProvider {
  readonly name: string;
  runTurn(input: AgentTurnInput): Promise<AgentTurn>;
}
