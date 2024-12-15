const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const { protect, authorOnly } = require('../middleware/auth');

// Create a book (authors only)
router.post('/create', protect, authorOnly, async (req, res) => {
  try {
    const { title, genre, stock } = req.body;
    const book = await Book.create({
      title,
      author: req.user._id,
      genre,
      stock
    });

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all books or search by title, author, or genre
router.get('/', async (req, res) => {
  try {
    const { title } = req.query;
    let query = {};

    if (title) {
      query.title = { $regex: title, $options: 'i' };
    }

    const books = await Book.find(query).sort({ title: 1 }); // Add sorting
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get books by author (authors only)
router.get('/author/:id', protect, authorOnly, async (req, res) => {
  try {
    const books = await Book.find({ author: req.params.id });
    const borrowedBooks = books.filter(book => book.stock < book.initialStock);
    res.json({ books, borrowedBooks });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a book (authors only)
router.put('/update/:id', protect, authorOnly, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this book' });
    }

    book.title = req.body.title || book.title;
    book.genre = req.body.genre || book.genre;
    book.stock = req.body.stock || book.stock;

    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a book (authors only)
router.delete('/delete/:id', protect, authorOnly, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this book' });
    }

    await book.remove();
    res.json({ message: 'Book removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
