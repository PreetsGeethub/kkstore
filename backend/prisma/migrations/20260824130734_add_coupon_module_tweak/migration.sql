/*
  Warnings:

  - A unique constraint covering the columns `[couponId,userId]` on the table `CouponUsage` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "CouponUsage_couponId_orderId_key";

-- CreateIndex
CREATE UNIQUE INDEX "CouponUsage_couponId_userId_key" ON "CouponUsage"("couponId", "userId");
