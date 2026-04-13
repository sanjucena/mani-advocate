// ============================================================
// 📁 routes/caseRoutes.ts — Case Routes
// ============================================================

import { Router } from 'express';
import {
  getCases,
  getCase,
  createCase,
  updateCase,
  deleteCase,
  addNote,
} from '../controllers/caseController';
import { protect } from '../middleware/auth';

const router = Router();

// All case routes require authentication
router.use(protect);

router.route('/')
  .get(getCases)       // GET    /api/v1/cases
  .post(createCase);   // POST   /api/v1/cases

router.route('/:id')
  .get(getCase)        // GET    /api/v1/cases/:id
  .put(updateCase)     // PUT    /api/v1/cases/:id
  .delete(deleteCase); // DELETE /api/v1/cases/:id

// Nested route for adding notes to a case
// INTERVIEW TIP: "Nested routes represent sub-resources.
// POST /api/v1/cases/abc123/notes means 'add a note to case abc123'.
// This is RESTful because the URL clearly shows the relationship."
router.post('/:id/notes', addNote);

export default router;
