import express, { Request, Response, RequestHandler } from "express";
import pool from "../db";

const router = express.Router();

// ✅ Follow a user
router.post("/", (async (req: Request, res: Response) => {
  const { follower_id, following_id } = req.body;

  if (follower_id === following_id) {
    return res.status(400).json({ error: "Can't follow yourself" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) RETURNING *",
      [follower_id, following_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}) as RequestHandler);

// ✅ Unfollow a user
router.delete("/", async (req, res) => {
  const { follower_id, following_id } = req.body;
  try {
    await pool.query(
      "DELETE FROM follows WHERE follower_id = $1 AND following_id = $2",
      [follower_id, following_id]
    );
    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ✅ Get users I’m following
router.get("/following/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT users.id, users.username, users.profile_image
       FROM follows
       JOIN users ON follows.following_id = users.id
       WHERE follows.follower_id = $1`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ✅ Get followers of a user
router.get("/followers/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT users.id, users.username, users.profile_image
       FROM follows
       JOIN users ON follows.follower_id = users.id
       WHERE follows.following_id = $1`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
