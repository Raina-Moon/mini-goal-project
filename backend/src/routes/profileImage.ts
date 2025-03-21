import express, { RequestHandler } from "express";
import multer from "multer";
import cloudinary from "../utils/cloudinary";
import pool from "../db";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import streamifier from "streamifier";

const upload = multer();

const router = express.Router();

router.post(
  "/profile/:userId/image-upload",
  upload.single("profileImage"),
  (async (req: Request, res: Response) => {
    const { userId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      // Upload to Cloudinary using buffer stream
      const streamUpload = (buffer: Buffer): Promise<string> => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "profile_images",
              public_id: uuidv4(),
              resource_type: "image",
            },
            (error, result) => {
              if (result) {
                resolve(result.secure_url);
              } else {
                reject(error);
              }
            }
          );
          streamifier.createReadStream(buffer).pipe(stream);
        });
      };

      const imageUrl = await streamUpload(file.buffer);

      const result = await pool.query(
        "UPDATE users SET profile_image = $1 WHERE id = $2 RETURNING id, username, email, profile_image",
        [imageUrl, userId]
      );

      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }) as RequestHandler
);
