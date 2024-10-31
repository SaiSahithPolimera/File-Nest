/*
  Warnings:

  - You are about to drop the column `parent_folder_id` on the `Folders` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Folders_parent_folder_id_key";

-- AlterTable
ALTER TABLE "Folders" DROP COLUMN "parent_folder_id";
