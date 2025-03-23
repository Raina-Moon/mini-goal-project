import express from "express";
import pool from "../db";

const router = express.Router();

// ✅ Like a post
router.post("/", async (req, res) => {
  const { user_id, post_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO likes (user_id, post_id) VALUES ($1, $2) RETURNING *`,
      [user_id, post_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ✅ Unlike a post
router.delete("/", async (req, res) => {
  const { user_id, post_id } = req.body;
  try {
    await pool.query(
      `DELETE FROM likes WHERE user_id = $1 AND post_id = $2`,
      [user_id, post_id]
    );
    res.json({ message: "Unliked successfully" });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ✅ Get like count & check if user liked
router.get("/status/:postId/:userId", async (req, res) => {
  const { postId, userId } = req.params;
  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM likes WHERE post_id = $1`,
      [postId]
    );
    const likedResult = await pool.query(
      `SELECT * FROM likes WHERE post_id = $1 AND user_id = $2`,
      [postId, userId]
    );
    res.json({
      count: parseInt(countResult.rows[0].count),
      liked: likedResult.rows.length > 0,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
