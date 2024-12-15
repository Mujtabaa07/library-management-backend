const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Book = require('../models/Book');
const { protect } = require('../middleware/auth');

// Create or manage reader profile
router.post('/profile', protect, async (req, res) => {
  try {
    if (req.user.role !== 'reader') {
      return res.status(403).json({ message: 'Not authorized, readers only' });
    }

    const { name, email } = req.body;
    req.user.name = name || req.user.name;
    req.user.email = email || req.user.email;

    const updatedUser = await req.user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Borrow a book
router.post('/books/borrow', protect, async (req, res) => {
  try {
    if (req.user.role !== 'reader') {
      return res.status(403).json({ message: 'Not authorized, readers only' });
    }

    const { bookId } = req.body;
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.stock === 0) {
      return res.status(400).json({ message: 'Book is out of stock' });
    }

    if (req.user.borrowedBooks.length >= 5) {
      return res.status(400).json({ message: 'You have reached the maximum limit of borrowed books' });
    }

    book.stock -= 1;
    await book.save();

    req.user.borrowedBooks.push(book._id);
    await req.user.save();

    res.json({ message: 'Book borrowed successfully', book });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Return a book
router.post('/books/return', protect, async (req, res) => {
  try {
    if (req.user.role !== 'reader') {
      return res.status(403).json({ message: 'Not authorized, readers only' });
    }

    const { bookId } = req.body;
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const bookIndex = req.user.borrowedBooks.indexOf(book._id);
    if (bookIndex === -1) {
      return res.status(400).json({ message: 'You have not borrowed this book' });
    }

    book.stock += 1;
    await book.save();

    req.user.borrowedBooks.splice(bookIndex, 1);
    await req.user.save();

    res.json({ message: 'Book returned successfully', book });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// View borrowed books
router.get('/books/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'reader' || req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to view these books' });
    }

    const user = await User.findById(req.params.id).populate('borrowedBooks');
    res.json(user.borrowedBooks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

