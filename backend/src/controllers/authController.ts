// ============================================================
// 📁 controllers/authController.ts — Authentication Logic
// ============================================================
// INTERVIEW TIP: "Controllers contain the business logic for
// each route. They receive the request, process it (validate,
// query DB, compute), and send a response. This separation
// keeps routes clean and logic testable."
//
// PATTERN: Each controller function is async and uses try-catch.
// Errors are passed to the global error handler.
// ============================================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AppError } from '../middleware/errorHandler';

// Helper: Generate JWT token
// INTERVIEW TIP: "jwt.sign() creates a token with:
//   - payload (user id + role)
//   - secret (for signing)
//   - options (expiration time)
// The token is stateless — the server doesn't store it."
const generateToken = (id: string, role: string): string => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ============================================================
// POST /api/v1/auth/register
// ============================================================
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    // Create user (password is hashed by the pre-save hook in the model)
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role,
    });

    // Generate token
    const token = generateToken(user._id as string, user.role);

    // INTERVIEW TIP: "Status 201 means 'Created' — use it when
    // a new resource is successfully created (POST requests)."
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
        token,
      },
    });
  } catch (error) {
    next(error); // Pass to global error handler
  }
};

// ============================================================
// POST /api/v1/auth/login
// ============================================================
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    // Find user and explicitly include password
    // (remember: we set select: false on the password field)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      // SECURITY TIP: Don't reveal whether email or password is wrong
      throw new AppError('Invalid email or password', 401);
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken(user._id as string, user.role);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET /api/v1/auth/me — Get Current Logged-in User
// ============================================================
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user?._id);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
