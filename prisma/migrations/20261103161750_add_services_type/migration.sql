/*
  Warnings:

  - The `vehiclePhoto` column on the `mechanic_profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "mechanic_profiles" DROP COLUMN "vehiclePhoto",
ADD COLUMN     "vehiclePhoto" TEXT[];
