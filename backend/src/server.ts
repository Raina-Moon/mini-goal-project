import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import goalRoutes from "./routes/goals";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

//API routes
app.use("/goals", goalRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
