export type GenerateInput = {
  /** The final text prompt, already built from the brief. */
  prompt: string;
  width: number;
  height: number;
};

export interface ImageGenProvider {
  readonly name: string;

  /** Returns PNG bytes with a transparent background. */
  generate(input: GenerateInput): Promise<Buffer>;
}

export type EditInput = {
  /** The user's image, already normalised to PNG. */
  image: Buffer;
  /** What to do with it, already built from the brief. */
  prompt: string;
  width: number;
  height: number;
};

export interface ImageEditProvider {
  readonly name: string;

  /** Returns PNG bytes with a transparent background. */
  edit(input: EditInput): Promise<Buffer>;
}
