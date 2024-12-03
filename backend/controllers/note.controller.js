import { Note } from "../models/note.model.js";
import { io } from "../socket/socket.js";
import fs from "fs";
import path from "path";
import multer from "multer";

const __dirname = path.resolve();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath); // Create the uploads directory if it doesn't exist
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({ storage });
export const uploadFile = async (req, res) => {
  try {
    const { uniqueUrl } = req.params;

    // Check if the note exists
    const note = await Note.findOne({ uniqueUrl });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // If there is an existing file, delete it
    if (note.filePath) {
      const existingFilePath = path.join(__dirname, 'uploads', note.filePath);
      if (fs.existsSync(existingFilePath)) {
        fs.unlinkSync(existingFilePath); // Remove old file
      }
    }

    // Save the new file with its original name
    const originalFileName = req.file.originalname;
    const fileName = `${Date.now()}_${originalFileName}`; // Optional: add timestamp to ensure uniqueness
    const filePath = path.join(__dirname, 'uploads', fileName);

    fs.renameSync(req.file.path, filePath); // Move the uploaded file

    // Update the database with the new file
    note.filePath = fileName;
    note.hasFile = true;
    await note.save();

    res.status(200).json({ message: 'File uploaded successfully', fileName: originalFileName });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

// // File download functionality
export const downloadFile = async (req, res) => {
  try {
    const { uniqueUrl } = req.params;

    // Find the note by its unique URL
    const note = await Note.findOne({ uniqueUrl });
    if (!note || !note.filePath) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(__dirname, 'uploads', note.filePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Extract the file extension and use it to determine the MIME type
    const extname = path.extname(note.filePath).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // Send the file with the correct MIME type and filename
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${note.filePath}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
};
// Create a new note
export const createNote = async (req, res) => {
  try {
    const { content, isProtected, password, uniqueUrl } = req.body;

    const note = new Note({
      content,
      uniqueUrl,
      isProtected,
      password: isProtected ? password : "",
    });

    await note.save();
    io.emit("noteUpdated", { uniqueUrl, content }); // Emit event to all connected clients

    res.json({ uniqueUrl });
  } catch (error) {
    res.status(500).json({ error: "Failed to create note" });
  }
};

// Update an existing note
export const updateNote = async (req, res) => {
  try {
    const { uniqueUrl } = req.params;
    const { content } = req.body;

    const note = await Note.findOneAndUpdate(
      { uniqueUrl },
      { content, updatedAt: Date.now() },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    io.emit("noteUpdated", { uniqueUrl, content: note.content });

    res.json(note);
  } catch (error) {
    res.status(500).json({ error: "Failed to update note" });
  }
};

// Fetch a note by unique URL
export const getNote = async (req, res) => {
  try {
    const { uniqueUrl } = req.params;
    const note = await Note.findOne({ uniqueUrl });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch note" });
  }
};

export const checkFileAvailability = async (req, res) => {
  try {
    const { uniqueUrl } = req.params;

    // Check if the note exists
    const note = await Note.findOne({ uniqueUrl });
    if (!note || !note.hasFile) {
      return res.status(404).json({ message: 'No file available for this URL' });
    }

    res.status(200).json({ fileAvailable: true, filePath: note.filePath });
  } catch (error) {
    console.error('Error checking file availability:', error);
    res.status(500).json({ error: 'Failed to check file availability' });
  }
};




