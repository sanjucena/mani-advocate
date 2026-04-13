// ============================================================
// 📁 routes/clientRoutes.ts — Client Routes
// ============================================================

import { Router } from 'express';
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
} from '../controllers/clientController';
import { protect } from '../middleware/auth';

const router = Router();

// All client routes require authentication
// INTERVIEW TIP: "router.use(protect) applies the middleware
// to ALL routes defined after this line in this router."
router.use(protect);

router.route('/')
  .get(getClients)       // GET    /api/v1/clients
  .post(createClient);   // POST   /api/v1/clients

router.route('/:id')
  .get(getClient)        // GET    /api/v1/clients/:id
  .put(updateClient)     // PUT    /api/v1/clients/:id
  .delete(deleteClient); // DELETE /api/v1/clients/:id

export default router;
