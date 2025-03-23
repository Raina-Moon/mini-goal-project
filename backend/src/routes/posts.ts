import express, { Request, Response } from "express";
import pool from "../db";

const router = express.Router();

// ✅ Create a post when a goal is completed
router.post("/", async (req: Request, res: Response) => {
  const { user_id, goal_id, image_url, description } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO posts (user_id, goal_id, image_url, description)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, goal_id, image_url, description]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ✅ Get all posts by user
router.get("/user/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
