import prisma from "./src/config/prisma.js";

const coupon = await prisma.coupon.create({
    data: {
        code: "SAVE10",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minimumOrderAmount: 999,
        usageLimit: 100,
        usedCount: 0,
        startsAt: new Date("2026-08-28T00:00:00+05:30"),
        expiresAt: new Date("2026-09-01T23:59:59+05:30"),
        isActive: true,
    },
});

console.log(coupon);

await prisma.$disconnect();