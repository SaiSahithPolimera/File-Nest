-- CreateTable
CREATE TABLE "Users" (
    "user_id" SERIAL NOT NULL,
    "user_name" TEXT,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("user_id")
);
