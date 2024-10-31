/*
  Warnings:

  - Made the column `foldersFolder_id` on table `Files` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `usersUser_id` to the `Folders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Files" DROP CONSTRAINT "Files_foldersFolder_id_fkey";

-- AlterTable
ALTER TABLE "Files" ALTER COLUMN "foldersFolder_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "Folders" ADD COLUMN     "usersUser_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Folders" ADD CONSTRAINT "Folders_usersUser_id_fkey" FOREIGN KEY ("usersUser_id") REFERENCES "Users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Files" ADD CONSTRAINT "Files_foldersFolder_id_fkey" FOREIGN KEY ("foldersFolder_id") REFERENCES "Folders"("folder_id") ON DELETE RESTRICT ON UPDATE CASCADE;
