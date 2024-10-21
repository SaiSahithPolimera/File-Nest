/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `Users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_name]` on the table `Users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Users_user_id_key" ON "Users"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Users_user_name_key" ON "Users"("user_name");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");
