const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true }, // Changed from ObjectId to String
  description: { type: String },
  genre: { type: String, required: true, default: 'Uncategorized' },
  stock: { type: Number, required: true, default: 0 }
});

module.exports = mongoose.model('Book', bookSchema);
