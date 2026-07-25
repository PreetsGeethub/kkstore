
import { ZodError } from "zod";
import { env } from "../config/env.js";

const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const statusCode = err.statusCode || 500;

  const message =
    statusCode === 500 && env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message || "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
  });
};

export default errorHandler;
// const errorHandler = (err, req, res, next) => {
//   console.error(err);

//   const statusCode = err.statusCode || 500;

//   const message =
//     statusCode === 500 && env.NODE_ENV === "production"
//       ? "Internal Server Error"
//       : err.message || "Internal Server Error";

//   const errors = err.errors || [];

//   return res.status(statusCode).json({
//     success: false,
//     message,
//     errors,
//   });
// };

// export default errorHandler;