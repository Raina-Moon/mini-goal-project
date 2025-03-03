import express from 'express';
import { json } from 'body-parser';
import { setGoalRoutes } from './routes/goalRoutes';
import { setPostRoutes } from './routes/postRoutes';

const app = express();

// Middleware
app.use(json());

// Routes
setGoalRoutes(app);
setPostRoutes(app);

export default app;