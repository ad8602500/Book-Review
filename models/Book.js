const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  genre: {
    type: String,
    required: true,
    enum: ['Fiction', 'Non-Fiction', 'Mystery', 'Science Fiction', 'Romance']
  },
  description: {
    type: String,
    required: true
  },
  publishedYear: {
    type: Number,
    required: true
  },
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create text index for search functionality
bookSchema.index({ title: 'text', author: 'text' });

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;