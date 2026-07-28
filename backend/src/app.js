import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import errorHandler from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js"
import categoryRoutes from "./routes/category.routes.js"
import cookieParser from "cookie-parser";
const app = express();

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
app.use(errorHandler);
export default app;