import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import goalRoutes from "./routes/goals";
import pool from "./db";
import authRoutes from "./routes/auth";
import profileImageRoutes from "./routes/profileImage";
import followersRoutes from "./routes/followers";
import postsRoutes from "./routes/posts";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.get("/test-db", async (req, res) => {
  try {
      const result = await pool.query("SELECT NOW()");
      res.json({ message: "Database connected!", time: result.rows[0].now });
  } catch (err) {
      res.status(500).json({ error: (err as Error).message });
  }
});

//API routes
app.use("/api/goals", goalRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/auth", profileImageRoutes);

app.use("/api/followers", followersRoutes);

app.use("/api/posts",postsRoutes);

app.get("/", (req, res) => {
    res.send("Backend is running!");
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
