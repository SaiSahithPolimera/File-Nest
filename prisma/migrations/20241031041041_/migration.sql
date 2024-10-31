/*
  Warnings:

  - A unique constraint covering the columns `[folder_name]` on the table `Folders` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Folders_folder_name_key" ON "Folders"("folder_name");
