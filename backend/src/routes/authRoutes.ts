// ============================================================
// 📁 routes/authRoutes.ts — Authentication Routes
// ============================================================
// INTERVIEW TIP: "Express Router creates modular route handlers.
// Instead of putting all routes in server.ts, we split them
// into separate files by feature. This follows the Single
// Responsibility Principle (SRP) from SOLID."
// ============================================================

import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

// Public routes (no auth needed)
router.post('/register', register);
router.post('/login', login);

// Protected routes (must be logged in)
router.get('/me', protect, getMe);

export default router;
