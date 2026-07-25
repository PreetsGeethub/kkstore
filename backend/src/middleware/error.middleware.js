import {env} from "../config/env.js";

const errorHandler = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;

  const message =
    statusCode === 500 && env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message || "Internal Server Error";

  const errors = err.errors || [];

  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export default errorHandler;