/*
  Warnings:

  - The values [PENDING,PAID,PROCESSING] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'PAYMENT_FAILED', 'CANCELLED', 'REPLACEMENT_REQUESTED', 'REPLACEMENT_APPROVED', 'REPLACEMENT_REJECTED');
ALTER TABLE "public"."Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order"
ALTER COLUMN "status"
TYPE "OrderStatus_new"
USING (
    CASE "status"::text
        WHEN 'PENDING' THEN 'PENDING_PAYMENT'
        WHEN 'PAID' THEN 'CONFIRMED'
        WHEN 'PROCESSING' THEN 'PACKED'
        WHEN 'SHIPPED' THEN 'SHIPPED'
        WHEN 'DELIVERED' THEN 'DELIVERED'
        WHEN 'CANCELLED' THEN 'CANCELLED'
    END
)::"OrderStatus_new";
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING_PAYMENT';
COMMIT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "guestEmail" TEXT,
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING_PAYMENT';

-- CreateTable
CREATE TABLE "GuestCart" (
    "id" TEXT NOT NULL,
    "guestToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuestCart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestCartItem" (
    "id" TEXT NOT NULL,
    "guestCartId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuestCartItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuestCart_guestToken_key" ON "GuestCart"("guestToken");

-- CreateIndex
CREATE INDEX "GuestCartItem_guestCartId_idx" ON "GuestCartItem"("guestCartId");

-- CreateIndex
CREATE INDEX "GuestCartItem_variantId_idx" ON "GuestCartItem"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "GuestCartItem_guestCartId_variantId_key" ON "GuestCartItem"("guestCartId", "variantId");

-- AddForeignKey
ALTER TABLE "GuestCartItem" ADD CONSTRAINT "GuestCartItem_guestCartId_fkey" FOREIGN KEY ("guestCartId") REFERENCES "GuestCart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestCartItem" ADD CONSTRAINT "GuestCartItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
