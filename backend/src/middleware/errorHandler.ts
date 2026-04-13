// ============================================================
// 📁 middleware/errorHandler.ts — Global Error Handler
// ============================================================
// INTERVIEW TIP: "Express identifies error-handling middleware
// by its 4 parameters: (err, req, res, next). This MUST have
// all four, even if you don't use 'next'. It catches any error
// thrown or passed via next(error) in the entire app."
//
// WHY A GLOBAL ERROR HANDLER?
// Instead of writing try-catch in every controller, we can
// throw errors and let this middleware handle them consistently.
// ============================================================

import { Request, Response, NextFunction } from 'express';

// Custom error class with status code
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Distinguishes from programming errors

    // INTERVIEW TIP: "Error.captureStackTrace excludes the
    // constructor call from the stack trace, making it cleaner"
    Error.captureStackTrace(this, this.constructor);
  }
}

// The actual error handling middleware
const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  // If it's our custom AppError, use its status code
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Handle specific Mongoose errors
  // INTERVIEW TIP: "These are common MongoDB/Mongoose errors.
  // Handling them gives users meaningful error messages instead
  // of cryptic database errors."

  // Duplicate key error (e.g., duplicate email)
  if ((err as any).code === 11000) {
    statusCode = 400;
    const field = Object.keys((err as any).keyValue)[0];
    message = `A record with this ${field} already exists.`;
  }

  // Validation error (e.g., required field missing)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values((err as any).errors).map(
      (e: any) => e.message
    );
    message = errors.join('. ');
  }

  // Invalid ObjectId format
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format.';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired.';
  }

  // Send the error response
  res.status(statusCode).json({
    success: false,
    message,
    // Only show stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
