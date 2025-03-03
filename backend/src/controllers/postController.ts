import { Request, Response } from 'express';
import { createPost, getAllPosts } from '../models/postModel';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

export const createPostHandler = [
  upload.single('photo'),
  async (req: Request, res: Response) => {
    try {
      const { goal_id, badge, text } = req.body;
      const photo_url = req.file ? req.file.path : undefined;
      const post = await createPost({ goal_id, photo_url, badge, text });
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
];

export const getAllPostsHandler = async (req: Request, res: Response) => {
  try {
    const posts = await getAllPosts();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};