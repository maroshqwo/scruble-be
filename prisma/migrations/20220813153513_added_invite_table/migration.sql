-- CreateEnum
CREATE TYPE "InviteType" AS ENUM ('FRIEND', 'GAME', 'CLAN');

-- CreateEnum
CREATE TYPE "StatusType" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Invite" (
    "id" SERIAL NOT NULL,
    "recipientId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "gameId" INTEGER,
    "type" "InviteType" NOT NULL,
    "status" "StatusType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
