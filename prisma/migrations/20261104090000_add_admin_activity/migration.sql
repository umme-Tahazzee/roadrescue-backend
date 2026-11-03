-- CreateEnum
CREATE TYPE "AdminAction" AS ENUM ('USER_BLOCKED', 'USER_UNBLOCKED', 'MECHANIC_APPROVED', 'MECHANIC_REJECTED', 'REFUND_APPROVED', 'REFUND_REJECTED', 'REFUND_PROCESSED');

-- CreateTable
CREATE TABLE "admin_activities" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" "AdminAction" NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_activities_adminId_idx" ON "admin_activities"("adminId");

-- CreateIndex
CREATE INDEX "admin_activities_action_idx" ON "admin_activities"("action");

-- CreateIndex
CREATE INDEX "admin_activities_createdAt_idx" ON "admin_activities"("createdAt");

-- AddForeignKey
ALTER TABLE "admin_activities" ADD CONSTRAINT "admin_activities_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
