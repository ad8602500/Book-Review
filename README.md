# Book Review System

A full-stack web application for managing book reviews, built with Node.js, Express, MongoDB, and vanilla JavaScript.

## Features

- User authentication (signup/login)
- Book management (add, view, search)
- Review system (add, edit, delete reviews)
- Search functionality with pagination
- Responsive design

## Tech Stack

- Backend: Node.js, Express.js
- Database: MongoDB
- Frontend: HTML, CSS, JavaScript
- Authentication: JWT
- Security: Helmet, bcrypt

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd book-review-system
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/book-review
JWT_SECRET=your_super_secret_key_here
```

4. Start MongoDB:
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo service mongod start
```

5. Start the server:
```bash
npm start
```

6. Open your browser and navigate to:
```
http://localhost:3000
```

## API Documentation

### Authentication

#### Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Books

#### Get All Books
```bash
curl http://localhost:3000/api/books?page=1&limit=10
```

#### Search Books
```bash
curl http://localhost:3000/api/books/search?query=harry&page=1&limit=10
```

#### Add Book
```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "title": "Harry Potter",
    "author": "J.K. Rowling",
    "genre": "Fiction",
    "description": "A magical adventure",
    "publishedYear": 1997
  }'
```

#### Get Book Details
```bash
curl http://localhost:3000/api/books/<book-id>
```

### Reviews

#### Add Review
```bash
curl -X POST http://localhost:3000/api/reviews/books/<book-id>/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "rating": 5,
    "comment": "Great book!"
  }'
```

#### Delete Review
```bash
curl -X DELETE http://localhost:3000/api/reviews/<review-id> \
  -H "Authorization: Bearer <your-token>"
```

## Database Schema

### User
```javascript
{
  username: String,    // required, unique
  email: String,       // required, unique
  password: String,    // required, hashed
  createdAt: Date,     // auto-generated
  updatedAt: Date      // auto-generated
}
```

### Book
```javascript
{
  title: String,       // required
  author: String,      // required
  genre: String,       // required, enum
  description: String, // required
  publishedYear: Number, // required
  averageRating: Number, // default: 0
  totalReviews: Number,  // default: 0
  createdAt: Date,     // auto-generated
  updatedAt: Date      // auto-generated
}
```

### Review
```javascript
{
  book: ObjectId,      // required, ref: 'Book'
  user: ObjectId,      // required, ref: 'User'
  rating: Number,      // required, 1-5
  comment: String,     // required
  createdAt: Date,     // auto-generated
  updatedAt: Date      // auto-generated
}
```

## Design Decisions

1. **Authentication**: JWT-based authentication for stateless API design
2. **Search**: Case-insensitive partial matching using MongoDB regex
3. **Pagination**: Implemented for all list endpoints to handle large datasets
4. **Security**: 
   - Password hashing with bcrypt
   - Helmet for security headers
   - Input validation and sanitization
5. **Error Handling**: Consistent error responses with development/production modes
6. **Frontend**: Vanilla JavaScript for simplicity and no build process required

## Assumptions

1. Single user can review a book only once
2. Reviews can be edited or deleted by the reviewer only
3. Book ratings are calculated as an average of all reviews
4. Search is performed on title and author fields only
5. Genre is limited to predefined categories

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request