/*
  Warnings:

  - A unique constraint covering the columns `[cartId,lineKey]` on the table `cart_items` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `lineKey` to the `cart_items` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "cart_items_cartId_productId_key";

-- AlterTable
ALTER TABLE "cart_items" ADD COLUMN     "lineKey" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cartId_lineKey_key" ON "cart_items"("cartId", "lineKey");

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_designVersionId_fkey" FOREIGN KEY ("designVersionId") REFERENCES "design_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
