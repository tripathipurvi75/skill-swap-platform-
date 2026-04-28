// middleware/errorMiddleware.js
// WHY: Global error handler catches ALL errors in one place.
// Instead of writing try/catch everywhere, we use next(error).

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose: Duplicate key (e.g., email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    statusCode = 400;
  }

  // Mongoose: Validation error
  if (err.name === "ValidationError") {
    message = Object.values(err.errors).map((e) => e.message)[0];
    statusCode = 400;
  }

  // Mongoose: Cast error (invalid ObjectId format)
  if (err.name === "CastError") {
    message = "Invalid ID format.";
    statusCode = 400;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    message = "Invalid token.";
    statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    message = "Token expired. Please login again.";
    statusCode = 401;
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Only show stack trace in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// Helper: Create an error with a status code
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { errorHandler, AppError };
