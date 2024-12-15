// tests/jest.setup.js
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

beforeAll(async () => {
  // Close existing connections
  await mongoose.disconnect();
  
  // Start memory server
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  // Connect to memory server
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000
  });
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (mongod) {
    await mongod.stop();
  }
});

beforeEach(async () => {
  await mongoose.connection.dropDatabase();
});

afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  }
});

jest.setTimeout(30000);