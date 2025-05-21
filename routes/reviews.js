const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

// Get single review
router.get('/reviews/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'username');
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ message: error.message });
  }
});

// Submit a review
router.post('/books/:bookId/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const bookId = req.params.bookId;

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user already reviewed this book
    const existingReview = await Review.findOne({
      book: bookId,
      user: req.user.userId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }

    // Create review
    const review = new Review({
      book: bookId,
      user: req.user.userId,
      rating,
      comment
    });

    await review.save();

    // Update book's average rating
    const allReviews = await Review.find({ book: bookId });
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    book.averageRating = totalRating / allReviews.length;
    book.totalReviews = allReviews.length;
    await book.save();

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update review
router.put('/reviews/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    const { rating, comment } = req.body;
    review.rating = rating;
    review.comment = comment;
    await review.save();

    // Update book's average rating
    const book = await Book.findById(review.book);
    const allReviews = await Review.find({ book: review.book });
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    book.averageRating = totalRating / allReviews.length;
    await book.save();

    res.json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete review
router.delete('/reviews/:id', auth, async (req, res) => {
  try {
    // Find and delete the review in one operation
    const result = await Review.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!result) {
      return res.status(404).json({ message: 'Review not found or unauthorized' });
    }

    // Update book's average rating
    const book = await Book.findById(result.book);
    if (book) {
      const allReviews = await Review.find({ book: result.book });
      book.averageRating = allReviews.length > 0 
        ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length 
        : 0;
      book.totalReviews = allReviews.length;
      await book.save();
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error in delete review:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;