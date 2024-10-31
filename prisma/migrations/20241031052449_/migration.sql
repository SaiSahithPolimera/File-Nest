/*
  Warnings:

  - A unique constraint covering the columns `[parent_folder_id]` on the table `Folders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `parent_folder_id` to the `Folders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Folders" ADD COLUMN     "parent_folder_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Folders_parent_folder_id_key" ON "Folders"("parent_folder_id");
