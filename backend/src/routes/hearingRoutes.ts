// ============================================================
// 📁 routes/hearingRoutes.ts — Hearing Routes
// ============================================================

import { Router } from 'express';
import {
  getHearings,
  getHearing,
  createHearing,
  updateHearing,
  deleteHearing,
  getUpcomingHearings,
} from '../controllers/hearingController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

// IMPORTANT: Put specific routes BEFORE parameterized routes
// INTERVIEW TIP: "Express matches routes top-to-bottom. If
// /:id comes before /upcoming, then 'upcoming' would be treated
// as an :id parameter. Always put specific routes first."
router.get('/upcoming', getUpcomingHearings);

router.route('/')
  .get(getHearings)
  .post(createHearing);

router.route('/:id')
  .get(getHearing)
  .put(updateHearing)
  .delete(deleteHearing);

export default router;
