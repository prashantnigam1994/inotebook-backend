const express = require('express');
const Notes = require('../models/Notes');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const fetchuser = require('../middleware/fetchuser');

// Fetch all notes of a user via endpoint /api/notes/fetchallnotes
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id })
        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// Create notes for user via endpoint /api/notes/createnote
router.post('/createnote', fetchuser, [
    body('title', 'Please Enter Title').notEmpty(),
    body('title', 'Title must be atleast 3 characters').isLength({ min: 3 }),
    body('description', 'Please Enter Description').notEmpty(),
    body('description', 'Description must be atleast 5 characters').isLength({ min: 5 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const { title, description, tag } = req.body
        const note = new Notes({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save()
        res.status(200).json({ savedNote })
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }

})

// Update notes of a user via endpoint /api/notes/updatenote
router.put('/updatenote/:id', fetchuser, async (req, res) => {

    const { title, description, tag } = req.body
    const newNote = {}
    if (title) { newNote.title = title }
    if (description) { newNote.description = description }
    if (tag) { newNote.tag = tag }

    // Find the note to be updated and update it
    let note = await Notes.findById(req.params.id)
    if (!note) {
        res.status(404).json({ error: 'Note Not Found' })
    }

    if (note.user.toString() !== req.user.id) {
        res.status(403).json({ error: 'Not Allowed' })
    }

    note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
    res.status(200).json({ success: 'The note has been updated', note })

})

// Delete notes of a user via endpoint /api/notes/deletenote
router.delete('/deletenote/:id', fetchuser, async (req, res) => {

    // Find the note to be updated and update it
    let note = await Notes.findById(req.params.id)
    if (!note) {
        res.status(404).json({ error: 'Note Not Found' })
    }

    if (note.user.toString() !== req.user.id) {
        res.status(403).json({ error: 'Not Allowed' })
    }

    note = await Notes.findByIdAndDelete(req.params.id)
    res.status(200).json({ success: 'The note has been deleted', note })

})

module.exports = router