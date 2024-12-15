Replace `your_mongodb_connection_string` with your actual MongoDB connection string and `your_secure_jwt_secret` with a secure random string.

## Running the Application

To start the server in development mode with hot-reloading:
```
npm run dev
```

The server will start running on `http://localhost:5000` (or the port specified in your .env file).

## API Endpoints

### User Management

- `POST /api/users/signup`: Register a new user (Reader or Author)
  - Body: `{ "name": "John Doe", "email": "john@example.com", "password": "securepassword", "role": "reader" }`

- `POST /api/users/login`: Authenticate user and get token
  - Body: `{ "email": "john@example.com", "password": "securepassword" }`

- `PUT /api/users/update/:id`: Update user details (Protected)
  - Body: `{ "name": "John Updated Doe" }`

- `DELETE /api/users/delete/:id`: Delete a user account (Protected)

- `GET /api/users/session/validate`: Validate the current session token (Protected)

### Book Management

- `POST /api/books/create`: Add a new book (Authors only, Protected)
  - Body: `{ "title": "New Book", "genre": "Fiction", "stock": 10 }`

- `GET /api/books`: Retrieve all books or search
  - Query params: `title`, `author`, `genre`

- `GET /api/books/author/:id`: Get all books by a specific author (Authors only, Protected)

- `PUT /api/books/update/:id`: Update book details (Authors only, Protected)
  - Body: `{ "title": "Updated Title", "stock": 15 }`

- `DELETE /api/books/delete/:id`: Remove a book (Authors only, Protected)

### Reader Operations

- `POST /api/reader/profile`: Create or manage Reader's profile (Readers only, Protected)
  - Body: `{ "name": "John Reader" }`

- `POST /api/reader/books/borrow`: Borrow a book (Readers only, Protected)
  - Body: `{ "bookId": "book_id_here" }`

- `POST /api/reader/books/return`: Return a borrowed book (Readers only, Protected)
  - Body: `{ "bookId": "book_id_here" }`

- `GET /api/reader/books/:id`: View all books borrowed by a specific Reader (Protected)

## Testing

The project uses Jest for testing. To run the tests, use the following command:
```
npm test
```

You can also use Postman or any API testing tool to manually test the endpoints. For protected routes, include the JWT token in the Authorization header:
Authorization: Bearer <your_token_here>

```plaintext

Example test case:

1. Sign up a new user (Author):
```

POST /api/users/signup
Body: {
"name": "Jane Author",
"email": "[jane@example.com](mailto:jane@example.com)",
"password": "securepass123",
"role": "author"
}

```plaintext

2. Login with the new user:
```

POST /api/users/login
Body: {
"email": "[jane@example.com](mailto:jane@example.com)",
"password": "securepass123"
}

```plaintext

3. Use the returned token to create a new book:
```

POST /api/books/create
Headers: Authorization: Bearer <token_from_login>
Body: {
"title": "My New Book",
"genre": "Science Fiction",
"stock": 5
}

```plaintext

4. Retrieve all books:
```

GET /api/books

```plaintext
```

## Deployment

This application is configured for easy deployment on Render. Follow these steps:

1. Push your code to a GitHub repository.
2. Sign up for a Render account at https://render.com/.
3. In the Render dashboard, click "New +" and select "Web Service".
4. Connect your GitHub repository.
5. Configure the deployment:
- Name: "library-management-system" (or your preferred name)
- Environment: Node
- Build Command: `npm install`
- Start Command: `npm start`
6. Add the environment variables (MONGO_URI and JWT_SECRET) in the Render dashboard.
7. Click "Create Web Service".

Render will automatically deploy your application and provide you with a URL.

## Contributing

Contributions to the Library Management System are welcome. Please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`.
3. Make your changes and commit them: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/your-feature-name`.
5. Submit a pull request.


