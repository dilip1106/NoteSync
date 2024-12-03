import express from "express";
import {
  createNote,
  getNote,
  updateNote,
  downloadFile,
  uploadFile,
  upload,
  checkFileAvailability,
} from "../controllers/note.controller.js";
import multer from 'multer';

const router = express.Router();

router.post("/", createNote);
router.get("/:uniqueUrl", getNote);
router.put("/:uniqueUrl", updateNote);

// const upload = multer({ dest: 'uploads/' }); // Define the directory for storing uploaded files

router.post('/upload/:uniqueUrl', upload.single('file'), uploadFile);
router.get('/check-file/:uniqueUrl', checkFileAvailability);
router.get('/download/:uniqueUrl', downloadFile);

export default router;
