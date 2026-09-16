import sharp from 'sharp';
import { z } from 'zod';

/**
 * Where artwork may be placed on a product image. Stored per product as Json,
 * so it is validated here rather than by the database.
 */
export const printAreaSchema = z.object({
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  shape: z.string().optional(),
});

export type PrintArea = z.infer<typeof printAreaSchema>;

export function parsePrintArea(value: unknown): PrintArea {
  const result = printAreaSchema.safeParse(value);

  if (!result.success) {
    throw new Error('Product has an invalid printArea');
  }

  return result.data;
}

export type Placement = { x: number; y: number; scale: number };

export const defaultPlacement: Placement = { x: 0.5, y: 0.5, scale: 1 };

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Place artwork inside the product's print area.
 *
 * `placement` is expressed as fractions of the print area, so the same design
 * lands sensibly on products whose print areas differ in size and shape.
 *
 * The artwork is scaled to *fit* (contain), never cropped — a logo with its
 * edges cut off is worse than one that is slightly small.
 */
export async function renderMockup(input: {
  productImage: Buffer;
  artwork: Buffer;
  printArea: PrintArea;
  placement?: Placement;
}): Promise<Buffer> {
  const { productImage, artwork, printArea } = input;
  const placement = input.placement ?? defaultPlacement;

  const boxWidth = Math.max(1, Math.round(printArea.width * placement.scale));
  const boxHeight = Math.max(1, Math.round(printArea.height * placement.scale));

  const fitted = await sharp(artwork)
    .resize(boxWidth, boxHeight, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const product = sharp(productImage);
  const productMeta = await product.metadata();
  const canvasWidth = productMeta.width ?? 0;
  const canvasHeight = productMeta.height ?? 0;

  // Centre the box on the requested point inside the print area.
  const rawLeft =
    printArea.x + placement.x * printArea.width - boxWidth / 2;
  const rawTop =
    printArea.y + placement.y * printArea.height - boxHeight / 2;

  // sharp throws if a composite falls outside the canvas, so keep it inside.
  const left = Math.round(clamp(rawLeft, 0, Math.max(0, canvasWidth - boxWidth)));
  const top = Math.round(clamp(rawTop, 0, Math.max(0, canvasHeight - boxHeight)));

  return product
    .composite([{ input: fitted, left, top }])
    .png()
    .toBuffer();
}
