import { Router } from 'express';
import PostController from '../controllers/postController';

const router = Router();
const postController = new PostController();

export default function setPostRoutes(app: Router) {
    app.post('/posts', postController.createPost.bind(postController));
    app.get('/posts', postController.getPosts.bind(postController));
}