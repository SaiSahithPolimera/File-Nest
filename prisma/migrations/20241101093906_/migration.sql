/*
  Warnings:

  - The `parent_folder` column on the `Folders` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Folders" DROP COLUMN "parent_folder",
ADD COLUMN     "parent_folder" INTEGER;
