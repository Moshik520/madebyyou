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

/**
 * Place artwork inside the product's print area.
 *
 * The artwork is scaled to *fit* (contain), never cropped — a logo that gets
 * its edges cut off is worse than one that is slightly small.
 */
export async function renderMockup(input: {
  productImage: Buffer;
  artwork: Buffer;
  printArea: PrintArea;
}): Promise<Buffer> {
  const { productImage, artwork, printArea } = input;

  const fitted = await sharp(artwork)
    .resize(printArea.width, printArea.height, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  return sharp(productImage)
    .composite([{ input: fitted, left: printArea.x, top: printArea.y }])
    .png()
    .toBuffer();
}
