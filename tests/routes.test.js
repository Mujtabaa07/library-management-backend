const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server'); // Adjust this path to your server file
const User = require('../models/User');
const Book = require('../models/Book');

let mongoServer;
let server;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.disconnect();
  await mongoose.connect(mongoUri);
  server = app.listen(0); // Random port for testing
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  await server.close();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Book.deleteMany({});
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

describe('User Routes', () => {
  describe('POST /api/users/signup', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/api/users/signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'reader'
        });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.name).toBe('Test User');
      expect(res.body.email).toBe('test@example.com');
      expect(res.body.role).toBe('reader');
    });

    it('should not create a user with an existing email', async () => {
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123',
        role: 'reader'
      });

      const res = await request(app)
        .post('/api/users/signup')
        .send({
          name: 'Test User',
          email: 'existing@example.com',
          password: 'password123',
          role: 'reader'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('User already exists');
    });
  });

  describe('POST /api/users/login', () => {
    it('should login an existing user', async () => {
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'reader'
      });

      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should not login with incorrect credentials', async () => {
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'reader'
      });

      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid email or password');
    });
  });
});

describe('Book Routes', () => {
  let authorToken;
  let readerToken;
  let authorId;

  beforeEach(async () => {
    const author = await User.create({
      name: 'Author User',
      email: 'author@example.com',
      password: 'password123',
      role: 'author'
    });
    authorId = author._id;

    const reader = await User.create({
      name: 'Reader User',
      email: 'reader@example.com',
      password: 'password123',
      role: 'reader'
    });

    const authorRes = await request(app)
      .post('/api/users/login')
      .send({
        email: 'author@example.com',
        password: 'password123'
      });
    authorToken = authorRes.body.token;

    const readerRes = await request(app)
      .post('/api/users/login')
      .send({
        email: 'reader@example.com',
        password: 'password123'
      });
    readerToken = readerRes.body.token;
  });

  describe('POST /api/books/create', () => {
    it('should create a new book when author is authenticated', async () => {
      const res = await request(app)
        .post('/api/books/create')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          title: 'Test Book',
          genre: 'Fiction',
          stock: 10
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe('Test Book');
      expect(res.body.genre).toBe('Fiction');
      expect(res.body.stock).toBe(10);
      expect(res.body.author).toBe(authorId.toString());
    });

    it('should not create a book when reader is authenticated', async () => {
      const res = await request(app)
        .post('/api/books/create')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          title: 'Test Book',
          genre: 'Fiction',
          stock: 10
        });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/books', () => {
    beforeEach(async () => {
      await Book.deleteMany({});
    });

    it('should retrieve all books', async () => {
      await Book.create([
        { 
          title: 'Book 1',
          author: 'Author 1',
          genre: 'Fiction',
          stock: 10
        },
        {
          title: 'Book 2',
          author: 'Author 2',
          genre: 'Fiction',
          stock: 5
        }
      ]);

      const res = await request(app).get('/api/books');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].title).toBe('Book 1');
      expect(res.body[1].title).toBe('Book 2');
    });

    it('should search books by title', async () => {
      await Book.create([
        {
          title: 'Fiction Book',
          author: 'Author 1',
          genre: 'Fiction',
          stock: 5,
          description: 'Test book 1'
        },
        {
          title: 'Science Book',
          author: 'Author 2',
          genre: 'Science',
          stock: 3,
          description: 'Test book 2'
        }
      ]);

      const res = await request(app).get('/api/books?title=Fiction');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe('Fiction Book');
    });
  });
});
