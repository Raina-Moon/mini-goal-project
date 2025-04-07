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

// ✅ Get detailed bookmarks for a user
router.get("/:userId/detailed", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT 
        posts.id AS post_id,
        posts.user_id,
        posts.goal_id,
        goals.title,
        goals.duration,
        posts.image_url,
        posts.description,
        posts.created_at,
        users.username,
        users.profile_image,
        CAST(COUNT(likes.id) AS INTEGER) AS like_count,
        EXISTS (
          SELECT 1 FROM likes WHERE post_id = posts.id AND user_id = $1
        ) AS liked_by_me,
        EXISTS (
          SELECT 1 FROM bookmarks WHERE post_id = posts.id AND user_id = $1
        ) AS bookmarked_by_me,
        COALESCE(
          (
            SELECT json_agg(json_build_object(
              'id', comments.id,
              'user_id', comments.user_id,
              'username', users_c.username,
              'content', comments.content,
              'created_at', comments.created_at
            ))
            FROM comments
            JOIN users AS users_c ON users_c.id = comments.user_id
            WHERE comments.post_id = posts.id
          ),
          '[]'::json
        ) AS comments
      FROM bookmarks
      JOIN posts ON bookmarks.post_id = posts.id
      JOIN goals ON posts.goal_id = goals.id
      JOIN users ON posts.user_id = users.id
      LEFT JOIN likes ON posts.id = likes.post_id
      WHERE bookmarks.user_id = $1
      GROUP BY posts.id, posts.user_id, goals.title, goals.duration, posts.image_url, posts.description, posts.created_at, users.username, users.profile_image
      ORDER BY posts.id DESC
      `,
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
