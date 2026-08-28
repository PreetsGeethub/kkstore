import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import errorHandler from "./middleware/error.middleware.js";
import passport from "./config/passport.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js"
import categoryRoutes from "./routes/category.routes.js"
import wishlistRoutes from "./routes/wishList.routes.js"
import cartRoutes from "./routes/cart.routes.js"
import orderRoutes from "./routes/order.routes.js"
import paymentRoutes from "./routes/payment.routes.js"
import reviewRoutes from "./routes/review.routes.js"
import addressRoutes from "./routes/address.routes.js"
import guestcartRoutes from "./routes/guestCart.routes.js"
import couponRoutes from "./routes/coupon.routes.js"
import adminOrderRoutes from "./routes/adminOrder.routes.js";
import adminCouponRoutes from "./routes/adminCoupon.routes.js";
import cookieParser from "cookie-parser";
const app = express();



app.use(passport.initialize());
// Webhook must come BEFORE express.json()
app.use(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" })
);



app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "KK Store API Running",
  });
});


app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/addresses", addressRoutes);
app.use("/api/v1/guest-cart", guestcartRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/admin/orders", adminOrderRoutes);
app.use("/api/v1/admin/coupons", adminCouponRoutes);
app.use(errorHandler);
export default app;