import pool from '../database';

export interface Goal {
  id?: number;
  user_id: number;
  title: string;
  duration: number;
  completed: boolean;
  created_at?: Date;
}

export const createGoal = async (goal: Goal) => {
  const { user_id, title, duration, completed } = goal;
  const result = await pool.query(
    'INSERT INTO goals (user_id, title, duration, completed, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
    [user_id, title, duration, completed]
  );
  return result.rows[0];
};

export const updateGoal = async (id: number, completed: boolean) => {
  const result = await pool.query(
    'UPDATE goals SET completed = $1 WHERE id = $2 RETURNING *',
    [completed, id]
  );
  return result.rows[0];
};