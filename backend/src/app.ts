import express from 'express';
import bodyParser from 'body-parser';
import goalRoutes from './routes/goalRoutes';
import postRoutes from './routes/postRoutes';

const app = express();

app.use(bodyParser.json());
app.use('/api', goalRoutes);
app.use('/api', postRoutes);

export default app;