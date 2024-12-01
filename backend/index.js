// import express from 'express';
// import mongoose from 'mongoose';
// import bodyParser from 'body-parser';
// import cors from 'cors';
// import { v4 as uuidv4 } from 'uuid';
// import dotenv from 'dotenv';

// dotenv.config(); // Load environment variables

// const app = express();

// // Middleware
// app.use(bodyParser.json());
// app.use(cors());

// // MongoDB Connection
// const { MONGO_URI, PORT } = process.env;

// mongoose.connect(MONGO_URI)
//   .then(() => console.log('Connected to MongoDB'))
//   .catch((error) => console.error('MongoDB connection error:', error));


// // Schema and Model
// const noteSchema = new mongoose.Schema({
//   content: { type: String, default: '' },
//   uniqueUrl: { type: String, unique: true },
//   isProtected: { type: Boolean, default: false },
//   password: { type: String, default: '' },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
// });

// const Note = mongoose.model('Note', noteSchema);

// // API Endpoints
// // Create a new note
// app.post('/api/notes', async (req, res) => {
//   try {
//     const { content, isProtected, password,uniqueUrl } = req.body;
//     // const uniqueUrl = uuidv4();

//     const note = new Note({
//       content,
//       uniqueUrl,
//       isProtected,
//       password: isProtected ? password : '',
//     });

//     await note.save();
//     res.json({ uniqueUrl });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to create note' });
//   }
// });

// // Get a note by unique URL
// app.get('/api/notes/:uniqueUrl', async (req, res) => {
//   try {
//     const { uniqueUrl } = req.params;
//     const note = await Note.findOne({ uniqueUrl });

//     if (!note) {
//       return res.status(404).json({ error: 'Note not found' });
//     }

//     res.json(note);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch note' });
//   }
// });

// // Update a note
// app.put('/api/notes/:uniqueUrl', async (req, res) => {
//   try {
//     const { uniqueUrl } = req.params;
//     const { content } = req.body;

//     const note = await Note.findOneAndUpdate(
//       { uniqueUrl },
//       { content, updatedAt: Date.now() },
//       { new: true }
//     );

//     if (!note) {
//       return res.status(404).json({ error: 'Note not found' });
//     }

//     res.json(note);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to update note' });
//   }
// });

// // Start the Server
// const port = PORT || 5000;

// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });
import path from "path";
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import http from 'http';  // For creating an HTTP server
import { Server } from 'socket.io';  // Correct way to import Socket.IO

dotenv.config(); // Load environment variables

const app = express();
const server = http.createServer(app); // Creating an HTTP server
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5000', // Allow requests from the frontend URL
    methods: ['GET', 'POST'], // Allowed methods
  },
});

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
const { MONGO_URI, PORT } = process.env;

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Schema and Model
const noteSchema = new mongoose.Schema({
  content: { type: String, default: '' },
  uniqueUrl: { type: String, unique: true },
  isProtected: { type: Boolean, default: false },
  password: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Note = mongoose.model('Note', noteSchema);

// API Endpoints
// Create a new note
app.post('/api/notes', async (req, res) => {
  try {
    const { content, isProtected, password, uniqueUrl } = req.body;

    const note = new Note({
      content,
      uniqueUrl,
      isProtected,
      password: isProtected ? password : '',
    });

    await note.save();
    io.emit('noteUpdated', { uniqueUrl, content }); // Emit event to all connected clients

    res.json({ uniqueUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Get a note by unique URL
app.get('/api/notes/:uniqueUrl', async (req, res) => {
  try {
    const { uniqueUrl } = req.params;
    const note = await Note.findOne({ uniqueUrl });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// Update a note
app.put('/api/notes/:uniqueUrl', async (req, res) => {
  try {
    const { uniqueUrl } = req.params;
    const { content } = req.body;

    const note = await Note.findOneAndUpdate(
      { uniqueUrl },
      { content, updatedAt: Date.now() },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Emit the updated note content to all connected clients
    io.emit('noteUpdated', { uniqueUrl, content: note.content });

    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});
const __dirname= path.resolve();

app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

// Start the Server
const port = PORT || 5000;

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
