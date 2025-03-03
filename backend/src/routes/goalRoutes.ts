import { Router } from 'express';
import { createGoalHandler, updateGoalHandler } from '../controllers/goalController';

const router = Router();

router.post('/goals', createGoalHandler);
router.put('/goals/:id', updateGoalHandler);

export default router;