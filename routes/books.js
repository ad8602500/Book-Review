const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Review = require('../models/Review');
const auth = require('../middleware/auth');

// Create a new book
router.post('/', auth, async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Search books with pagination and filters
router.get('/search', async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Create case-insensitive search query
    const searchQuery = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } }
      ]
    };

    const books = await Book.find(searchQuery)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(searchQuery);

    // Format books with default values
    const formattedBooks = books.map(book => ({
      _id: book._id,
      title: book.title || '',
      author: book.author || '',
      genre: book.genre || '',
      publishedYear: book.publishedYear || 0,
      description: book.description || '',
      averageRating: book.averageRating || 0,
      totalReviews: book.totalReviews || 0
    }));

    res.json({
      books: formattedBooks,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalBooks: total
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      message: 'Error searching books',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get all books with pagination and filters
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.author) query.author = new RegExp(req.query.author, 'i');
    if (req.query.genre) query.genre = req.query.genre;

    const books = await Book.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    // Ensure books array exists and has default values for required fields
    const formattedBooks = books.map(book => ({
      _id: book._id,
      title: book.title || '',
      author: book.author || '',
      genre: book.genre || '',
      publishedYear: book.publishedYear || 0,
      description: book.description || '',
      averageRating: book.averageRating || 0,
      totalReviews: book.totalReviews || 0
    }));

    res.json({
      books: formattedBooks,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBooks: total
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ 
      message: 'Error fetching books',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get book by ID with reviews
router.get('/:id', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const reviews = await Review.find({ book: req.params.id })
      .populate('user', 'username')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalReviews = await Review.countDocuments({ book: req.params.id });

    res.json({
      book,
      reviews,
      currentPage: page,
      totalPages: Math.ceil(totalReviews / limit),
      totalReviews
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;