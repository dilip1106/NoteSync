import mongoose from "mongoose";

// Schema and Model
const noteSchema = new mongoose.Schema({
  content: { type: String, default: '' },
  uniqueUrl: { type: String, unique: true },
  isProtected: { type: Boolean, default: false },
  password: { type: String, default: '' },
  filePath: { type: String }, // Full path to the saved file
  fileName: { type: String }, // Original file name (with extension)
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
});


export const Note = mongoose.model('Note', noteSchema);
