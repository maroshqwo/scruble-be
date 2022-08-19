-- CreateTable
CREATE TABLE "Friend" (
    "id" SERIAL NOT NULL,
    "userId_1" INTEGER NOT NULL,
    "userId_2" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Friend_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_userId_1_fkey" FOREIGN KEY ("userId_1") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_userId_2_fkey" FOREIGN KEY ("userId_2") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
