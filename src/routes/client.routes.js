import express from 'express';
import { clientController } from '../controllers/client.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', clientController.createClient);
router.get('/', authenticate, clientController.getAllClients);
router.get('/:id', authenticate, clientController.getClientById);
router.put('/:id', authenticate, clientController.updateClient);
router.delete('/:id', authenticate, clientController.deleteClient);

export default router;