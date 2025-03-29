import express from "express";
import pool from "../db";

const router = express.Router();

// ✅ Add a comment
router.post("/", async (req, res) => {
  const { user_id, post_id, content } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO comments (user_id, post_id, content) 
       VALUES ($1, $2, $3) 
       RETURNING *, (SELECT username FROM users WHERE users.id = $1) AS username`,
      [user_id, post_id, content]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ✅ Get comments by post
router.get("/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const result = await pool.query(
      `SELECT c.*, u.username, u.profile_image
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE post_id = $1 ORDER BY created_at DESC`,
      [postId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
