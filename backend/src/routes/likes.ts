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
router.get("/nailed/:userId", async (req, res) => {
    const profileUserId = req.params.userId;
    const viewerUserId = req.query.viewerId;
  
    try {
      const result = await pool.query(`
        SELECT 
          posts.id AS post_id,
          posts.title,
          posts.description,
          posts.duration,
          posts.image_url,
          COUNT(likes.id) AS like_count,
          EXISTS (
            SELECT 1 FROM likes WHERE post_id = posts.id AND user_id = $2
          ) AS liked_by_me,
          (
            SELECT json_agg(json_build_object(
              'id', comments.id,
              'user_id', comments.user_id,
              'username', users.username,
              'content', comments.content,
              'created_at', comments.created_at
            ))
            FROM comments
            JOIN users ON users.id = comments.user_id
            WHERE comments.post_id = posts.id
          ) AS comments
        FROM posts
        LEFT JOIN likes ON posts.id = likes.post_id
        WHERE posts.user_id = $1
        GROUP BY posts.id
      `, [profileUserId, viewerUserId]);
  
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });
  

export default router;
