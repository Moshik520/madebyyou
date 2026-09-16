-- AlterTable
ALTER TABLE "design_projects" ADD COLUMN     "sourceAssetId" TEXT;

-- AddForeignKey
ALTER TABLE "design_projects" ADD CONSTRAINT "design_projects_sourceAssetId_fkey" FOREIGN KEY ("sourceAssetId") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
