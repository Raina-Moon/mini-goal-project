import express from 'express';
import { setGoalRoutes } from './routes/goalRoutes';
import { setPostRoutes } from './routes/postRoutes';
import { connectToDatabase } from './database';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to the database
connectToDatabase();

// Set up routes
setGoalRoutes(app);
setPostRoutes(app);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});