import path from "path";
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
// import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import router from "./routes/note.routes.js";
import { server,app } from './socket/socket.js';  // Correct way to import Socket.IO
import { connectDB } from "./db/connectDb.js";

dotenv.config(); // Load environment variables

app.use(bodyParser.json());
app.use(cors());

app.use("/api/notes", router);


const __dirname= path.resolve();
app.use(express.static(path.join(__dirname, "/frontend/dist")));
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  connectDB();
  console.log(`Port is running at ${PORT}`);
});
