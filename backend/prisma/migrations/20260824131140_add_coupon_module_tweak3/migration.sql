/*
  Warnings:

  - A unique constraint covering the columns `[couponId,orderId]` on the table `CouponUsage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CouponUsage_couponId_orderId_key" ON "CouponUsage"("couponId", "orderId");
