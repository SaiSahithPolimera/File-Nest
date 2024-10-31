/*
  Warnings:

  - You are about to drop the column `user_id` on the `Folders` table. All the data in the column will be lost.
  - Made the column `user_name` on table `Users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Folders" DROP CONSTRAINT "Folders_user_id_fkey";

-- DropIndex
DROP INDEX "Folders_folder_name_key";

-- DropIndex
DROP INDEX "Folders_user_id_key";

-- AlterTable
ALTER TABLE "Folders" DROP COLUMN "user_id",
ADD COLUMN     "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "user_name" SET NOT NULL;

-- CreateTable
CREATE TABLE "Files" (
    "file_id" SERIAL NOT NULL,
    "file_name" TEXT NOT NULL,
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "foldersFolder_id" INTEGER,

    CONSTRAINT "Files_pkey" PRIMARY KEY ("file_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Files_file_id_key" ON "Files"("file_id");

-- AddForeignKey
ALTER TABLE "Files" ADD CONSTRAINT "Files_foldersFolder_id_fkey" FOREIGN KEY ("foldersFolder_id") REFERENCES "Folders"("folder_id") ON DELETE SET NULL ON UPDATE CASCADE;
