import { Router } from 'express';
import { createPostHandler, getAllPostsHandler } from '../controllers/postController';

const router = Router();

router.post('/posts', createPostHandler);
router.get('/posts', getAllPostsHandler);

export default router;