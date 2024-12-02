import express from "express";
import { createNote, getNote, updateNote } from "../controllers/note.controller.js";

const router = express.Router();

router.post("/",createNote)
router.get("/:uniqueUrl",getNote)
router.put("/:uniqueUrl",updateNote)

export default router;