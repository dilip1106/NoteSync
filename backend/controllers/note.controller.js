import { Note } from "../models/note.model.js";
import { io } from "../socket/socket.js";
import fs from "fs";
import path from "path";
import multer from "multer";
import archiver from "archiver";

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

    // Save the uploaded file and create a ZIP
    const originalFileName = req.file.originalname;
    const fileName = `${Date.now()}_${originalFileName}`;
    const filePath = path.join(__dirname, 'uploads', fileName);
    const zipFileName = `${Date.now()}_${path.basename(fileName, path.extname(fileName))}.zip`;
    const zipFilePath = path.join(__dirname, 'uploads', zipFileName);

    // Rename and move the uploaded file
    fs.renameSync(req.file.path, filePath);

    // Create a ZIP file
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);
    archive.file(filePath, { name: originalFileName });
    await archive.finalize();

    // Delete the original file after zipping
    fs.unlinkSync(filePath);

    // Update the database with the new ZIP file
    note.filePath = zipFileName;
    note.hasFile = true;
    await note.save();

    res.status(200).json({ message: 'File uploaded and zipped successfully', fileName: zipFileName });
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

    const zipFilePath = path.join(__dirname, 'uploads', note.filePath);

    if (!fs.existsSync(zipFilePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Set the correct headers for downloading
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${note.filePath}"`);

    // Stream the ZIP file
    fs.createReadStream(zipFilePath).pipe(res);
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




