import express, { Request, Response,RequestHandler } from "express";
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
router.post("/upload-image", upload.single("image"), (async (req: Request, res: Response) => {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ error: "No file uploaded" });
  
      const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  
      const uploadRes = await cloudinary.uploader.upload(base64, {
        folder: "post_images",
      });
  
      res.json({ imageUrl: uploadRes.secure_url });
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      res.status(500).json({ error: "Image upload failed" });
    }
  }) as RequestHandler);
  

// ✅ Get "nailed it" goals + post data for a user
router.get("/nailed/:userId", async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
      const result = await pool.query(`
        SELECT 
          g.id AS goal_id,
          g.title,
          g.duration,
          p.image_url,
          p.description
        FROM goals g
        JOIN posts p ON g.id = p.goal_id
        WHERE g.user_id = $1 AND g.status = 'nailed it'
        ORDER BY g.created_at DESC
      `, [userId]);
  
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });
  

export default router;
