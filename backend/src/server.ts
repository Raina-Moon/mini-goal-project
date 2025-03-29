import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import goalRoutes from "./routes/goals";
import pool from "./db";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import followersRoutes from "./routes/followers";
import postsRoutes from "./routes/posts";
import commentsRoutes from "./routes/comments";
import likesRoutes from "./routes/likes";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors());

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

app.use("/api/profile", profileRoutes);

app.use("/api/followers", followersRoutes);

app.use("/api/posts", postsRoutes);

app.use("/api/comments", commentsRoutes);

app.use("/api/likes", likesRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message });
  }
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
