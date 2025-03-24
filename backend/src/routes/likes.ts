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
    await pool.query(`DELETE FROM likes WHERE user_id = $1 AND post_id = $2`, [
      user_id,
      post_id,
    ]);
    res.json({ message: "Unliked successfully" });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
