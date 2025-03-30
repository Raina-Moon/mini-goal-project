import express from "express";
import pool from "../db";

const router = express.Router();

// ✅ Get all bookmarks for a user
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      "SELECT p.* FROM posts p JOIN bookmarks b ON p.id = b.post_id WHERE b.user_id = $1",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ✅ Add a new bookmark
router.post("/", async (req, res) => {
  const { userId, postId } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO bookmarks (user_id, post_id)
       VALUES ($1, $2)`,
      [userId, postId]
    );
    res.status(201).json({ message: "Bookmark created" });
  } catch (error) {
    if ((error as { code: string }).code === "23505") {
      res.status(409).json({ message: "Bookmark already exists" });
    } else {
      res.status(500).json({ message: "Error creating bookmark" });
    }
  }
});

// ✅ Remove a bookmark
router.delete("/:userId/:postId", async (req, res) => {
  const { userId, postId } = req.params;
  try {
    await pool.query(
      "DELETE FROM bookmarks WHERE user_id = $1 AND post_id = $2",
      [userId, postId]
    );
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
