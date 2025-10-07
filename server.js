const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('public'));

// In-memory storage (în producție folosești o bază de date)
const notes = new Map();

// Generate unique ID or use custom extension
function generateNoteId(customExtension = null) {
  if (customExtension && customExtension.trim() !== '') {
    // Clean custom extension
    const cleanExtension = customExtension.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (cleanExtension && !notes.has(cleanExtension)) {
      return cleanExtension;
    }
  }
  return uuidv4();
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create new note
app.post('/api/notes', (req, res) => {
  try {
    const { content, customExtension } = req.body;
    const noteId = generateNoteId(customExtension);
    
    const note = {
      id: noteId,
      content: content || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    notes.set(noteId, note);
    
    res.json({
      success: true,
      noteId: noteId,
      url: `${req.protocol}://${req.get('host')}/note/${noteId}`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get note by ID
app.get('/api/notes/:id', (req, res) => {
  try {
    const noteId = req.params.id;
    const note = notes.get(noteId);
    
    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }
    
    res.json({
      success: true,
      note: note
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update note
app.put('/api/notes/:id', (req, res) => {
  try {
    const noteId = req.params.id;
    const { content } = req.body;
    
    if (!notes.has(noteId)) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }
    
    const note = notes.get(noteId);
    note.content = content;
    note.updatedAt = new Date().toISOString();
    
    notes.set(noteId, note);
    
    res.json({
      success: true,
      note: note
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve note page
app.get('/note/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Check if custom extension is available
app.get('/api/check/:extension', (req, res) => {
  try {
    const extension = req.params.extension;
    const isAvailable = !notes.has(extension);
    
    res.json({
      success: true,
      available: isAvailable
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
