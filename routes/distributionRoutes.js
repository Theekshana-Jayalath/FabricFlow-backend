import express from 'express';
import { assignDelivery } from '../controllers/distributionController.js';

const router = express.Router();

router.post('/assign', assignDelivery);


export default router;