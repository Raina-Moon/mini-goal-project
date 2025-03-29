import express, { Request, Response, RequestHandler } from "express";
import pool from "../db";

const router = express.Router();

// ✅ Get all likes for a post
router.get("/:postId", async (req: Request, res: Response) => {
  const { postId } = req.params;
  try {
    const result = await pool.query(`SELECT * FROM likes WHERE post_id = $1`, [
      postId,
    ]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ✅ Get like status for a post by a specific user
router.get("/status/:postId/:userId", async (req: Request, res: Response) => {
  const { postId, userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT EXISTS (SELECT 1 FROM likes WHERE post_id = $1 AND user_id = $2) AS liked`,
      [postId, userId]
    );
    res.json({ liked: result.rows[0].liked });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ✅ Get like count for a post
router.get("/count/:postId", async (req: Request, res: Response) => {
  const { postId } = req.params;
  try {
    const result = await pool.query(
      `SELECT COUNT(*)::INTEGER AS like_count FROM likes WHERE post_id = $1`,
      [postId]
    );
    res.json({ like_count: result.rows[0].like_count });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ✅ Like a post
router.post("/", (async (req: Request, res: Response) => {
  const { user_id, post_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO likes (user_id, post_id) VALUES ($1, $2) RETURNING *`,
      [user_id, post_id]
    );
    if (result.rowCount === 0) {
      return res.status(400).json({ message: "Already liked" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}) as RequestHandler);

// ✅ Unlike a post
router.delete("/", (async (req: Request, res: Response) => {
  const { user_id, post_id } = req.body;
  try {
    const result = await pool.query(
      `DELETE FROM likes WHERE user_id = $1 AND post_id = $2 RETURNING *`,
      [user_id, post_id]
    );
    if (result.rowCount === 0) {
      return res.status(400).json({ message: "Not liked yet" });
    }
    res.json({ message: "Unliked successfully" });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}) as RequestHandler);

export default router;
