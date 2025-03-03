import { Router } from 'express';
import { GoalController } from '../controllers/goalController';

const goalController = new GoalController();
const router = Router();

export function setGoalRoutes(app: Router) {
    app.post('/goals', goalController.createGoal);
    app.get('/goals', goalController.getGoals);
    app.put('/goals/:id', goalController.updateGoal);
}