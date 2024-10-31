-- CreateTable
CREATE TABLE "Folders" (
    "folder_id" SERIAL NOT NULL,
    "folder_name" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Folders_pkey" PRIMARY KEY ("folder_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Folders_folder_id_key" ON "Folders"("folder_id");

-- CreateIndex
CREATE UNIQUE INDEX "Folders_folder_name_key" ON "Folders"("folder_name");

-- CreateIndex
CREATE UNIQUE INDEX "Folders_user_id_key" ON "Folders"("user_id");

-- AddForeignKey
ALTER TABLE "Folders" ADD CONSTRAINT "Folders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
