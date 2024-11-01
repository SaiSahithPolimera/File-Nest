/*
  Warnings:

  - You are about to drop the column `date_created` on the `Files` table. All the data in the column will be lost.
  - You are about to drop the column `file_type` on the `Files` table. All the data in the column will be lost.
  - You are about to drop the column `date_created` on the `Folders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Files" DROP COLUMN "date_created",
DROP COLUMN "file_type";

-- AlterTable
ALTER TABLE "Folders" DROP COLUMN "date_created";
