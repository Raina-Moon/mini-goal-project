import express, { Request, Response, RequestHandler } from "express";
import pool from "../db";
import multer from "multer";
import cloudinary from "../utils/cloudinary";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

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

// ✅ Upload post image to Cloudinary
router.post("/upload-image", upload.single("image"), (async (
  req: Request,
  res: Response
) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const base64 = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64"
    )}`;

    const uploadRes = await cloudinary.uploader.upload(base64, {
      folder: "post_images",
    });

    res.json({ imageUrl: uploadRes.secure_url });
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    res.status(500).json({ error: "Image upload failed" });
  }
}) as RequestHandler);

// ✅ Get all "nailed it" posts (for homepage feed)
router.get("/", async (req: Request, res: Response) => {
  const { excludeUserId, viewerId } = req.query;
  try {
    const result = await pool.query(
      `
      SELECT 
        posts.id AS post_id,
        posts.goal_id,
        goals.title,
        goals.duration,
        posts.image_url,
        posts.description,
        users.username,
        users.profile_image,
        CAST(COUNT(likes.id) AS INTEGER) AS like_count,
        EXISTS (
          SELECT 1 FROM likes WHERE post_id = posts.id AND user_id = $2
        ) AS liked_by_me,
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
      FROM posts
      JOIN goals ON posts.goal_id = goals.id
      JOIN users ON posts.user_id = users.id
      LEFT JOIN likes ON posts.id = likes.post_id
      WHERE goals.status = 'nailed it'
      ${excludeUserId ? "AND posts.user_id != $1" : ""}
      GROUP BY posts.id, goals.title, goals.duration, posts.image_url, posts.description, users.username, users.profile_image
      ORDER BY posts.id DESC
      `,
      excludeUserId ? [excludeUserId, viewerId || null] : [null, viewerId || null]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ✅ Get "nailed it" goals + post data for a user
router.get("/nailed/:userId", async (req: Request, res: Response) => {
  const profileUserId = req.params.userId;
  const viewerUserId = req.query.viewerId as string;
  try {
    const result = await pool.query(
      `
      SELECT 
        posts.id AS post_id,
        posts.goal_id AS goal_id,
        goals.title,
        goals.duration,
        posts.image_url,
        posts.description,
        CAST(COUNT(likes.id) AS INTEGER) AS like_count,
        EXISTS (
          SELECT 1 FROM likes WHERE post_id = posts.id AND user_id = $2
        ) AS liked_by_me,
        COALESCE(
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
          ),
          '[]'::json
        ) AS comments
      FROM posts
      JOIN goals ON posts.goal_id = goals.id
      LEFT JOIN likes ON posts.id = likes.post_id
      WHERE posts.user_id = $1 AND goals.status = 'nailed it'
      GROUP BY posts.id, posts.goal_id, goals.title, goals.duration, posts.image_url, posts.description, goals.created_at
      ORDER BY goals.created_at DESC`,
      [profileUserId, viewerUserId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
