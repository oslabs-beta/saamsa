import createServer from '../client/server/createServer';
import request from 'supertest';
import { connection, connect, ConnectOptions } from 'mongoose';
const dbURI = 'mongodb://127.0.0.1/testingDB';
import Users from '../client/server/userModels';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const app = createServer();
describe('user login/signup unit tests', () => {
  const username = 'testytest';
  const password = 'bozotheclown';
  beforeAll(async () => {
    await connect(dbURI, { useNewUrlParser: true } as ConnectOptions);
    console.log('connected to test db');
    Users.create({ username, password });
  });
  afterAll(() => {
    Users.deleteMany({});
    connection.close();
  });
  it('should send 404 page to invalid url', async () => {
    await request(app).get('/asdfasdfasdf').send().expect(404);
  });
  it('should send ok status code with valid user login information', async () => {
    const result = await request(app)
      .post('/login')
      .send({ username, password })
      .expect(200);
    expect(result.body).toBe(username);
  });
  it('should send error status code with invalid user login information', async () => {
    await request(app)
      .post('/login')
      .send({ username: 'asldkfjalskfj', password: 'aslkfjalsfkjaslkj' })
      .expect(401);
  });
  it('should send error status code when user signs up with existing username', async () => {
    const result = await Users.findOne({ username });
    await request(app).post('/signup').send({ username, password }).expect(304);
  });
  it('should succesfully sign up a user in database with pre-hashed password', async () => {
    await Users.deleteMany({});
    await request(app).post('/signup').send({ username, password }).expect(200);
    const result = await Users.findOne({ username });
    expect(result).not.toEqual({});
    expect(result?.password).not.toBe(password);
  });
});
