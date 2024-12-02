import {Note} from "../models/note.model.js"
import {io} from "../socket/socket.js"

export const createNote = async (req, res) => {
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
};

export const updateNote = async (req,res) =>{
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
};

export const getNote = async (req,res) => {
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
}