import path from "path";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/note.routes.js";
import { server, app } from "./socket/socket.js";
import { connectDB } from "./db/connectDb.js";

dotenv.config(); // Load environment variables

// Middleware setup
app.use(bodyParser.json());
app.use(cors());

// API routes
app.use("/api/notes", router);

// Serve uploaded files
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve frontend
app.use(express.static(path.join(__dirname, "/frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

// Server startup
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  connectDB();
  console.log(`Port is running at ${PORT}`);
});
