import logger from "../utils/logger.js";
import { AppError } from "../utils/AppError.js";

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  // Log the error
  if (err.isOperational) {
    logger.warn({ err, url: req.originalUrl, method: req.method }, err.message);
  } else {
    logger.error(
      { err, url: req.originalUrl, method: req.method },
      "Unhandled error",
    );
  }

  // Mongoose validation error
  if (err.name === "ValidationError" && err.errors) {
    return res.status(400).json({
      error: "Validation failed",
      code: "VALIDATION_ERROR",
      details: Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      error: `Duplicate value for ${field}`,
      code: "CONFLICT",
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res
      .status(401)
      .json({ error: "Invalid token", code: "INVALID_TOKEN" });
  }
  if (err.name === "TokenExpiredError") {
    return res
      .status(401)
      .json({ error: "Token expired", code: "TOKEN_EXPIRED" });
  }

  // Operational errors (our custom AppError)
  if (err instanceof AppError) {
    const response = { error: err.message, code: err.code };
    if (err.details) response.details = err.details;
    return res.status(err.statusCode).json(response);
  }

  // Unknown errors — don't leak internals
  res.status(500).json({
    error: "Internal server error",
    code: "INTERNAL_ERROR",
  });
};

export default errorHandler;
