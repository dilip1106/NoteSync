import express from "express";
import {
  createNote,
  getNote,
  updateNote,
  downloadFile,
  uploadFile,
  upload,
  checkFileAvailability,
  removeFile,
  isProtected,
  checkVerified,
  addPasswordToNote,
  removePasswordFromNote,
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
router.delete('/remove-file/:uniqueUrl', removeFile);
router.get('/is-protected/:uniqueUrl',isProtected)
router.post('/verify-password/:uniqueUrl',checkVerified);
router.patch("/add-password/:uniqueUrl", addPasswordToNote);
router.patch("/remove-password/:uniqueUrl", removePasswordFromNote);
export default router;
