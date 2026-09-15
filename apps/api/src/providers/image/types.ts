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
