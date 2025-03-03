import { Request, Response } from 'express';
import { Pool } from 'pg';
import { Goal } from '../models/goalModel';
import { createGoal, updateGoal } from '../models/goalModel';

export class GoalController {
    private db: Pool;

    constructor(db: Pool) {
        this.db = db;
    }

    public async createGoal(req: Request, res: Response): Promise<void> {
        const { title, duration } = req.body;
        const { user_id } = req.body;
        const newGoal: Goal = { title, duration, completed: false, user_id };

        try {
            const result = await this.db.query(
                'INSERT INTO goals (title, duration, completed) VALUES ($1, $2, $3) RETURNING *',
                [newGoal.title, newGoal.duration, newGoal.completed]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message || 'Failed to create goal' });
        }
    }

    public async getGoals(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.db.query('SELECT * FROM goals');
            res.status(200).json(result.rows);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message || 'Failed to retrieve goals' });
        }
    }

    public async updateGoal(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const { completed } = req.body;

        try {
            const result = await this.db.query(
                'UPDATE goals SET completed = $1 WHERE id = $2 RETURNING *',
                [completed, id]
            );

            if (result.rows.length === 0) {
                res.status(404).json({ error: 'Goal not found' });
            } else {
                res.status(200).json(result.rows[0]);
            }
        } catch (error) {
            res.status(500).json({ error: (error as Error).message || 'Failed to update goal' });
        }
    }
}

export const createGoalHandler = async (req: Request, res: Response) => {
  try {
    const goal = await createGoal(req.body);
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateGoalHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    const goal = await updateGoal(parseInt(id), completed);
    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};