import * as child from 'child_process';
import path from 'path';
import { connection, connect, ConnectOptions } from 'mongoose';
const dbURI = 'mongodb://127.0.0.1/testingDB';
import Users from '../client/server/userModels';

describe('user login unit tests', () => {
  beforeAll(async () => {
    await connect(dbURI, {
      useNewUrlParser: true,
      // useUnifiedTopolgy: true,
    } as ConnectOptions);
    console.log('connected to testing db');
  });
  beforeEach(async () => {
    await Users.deleteMany({});
  });
  const username = 'weewee';
  const password = 'booboo';
  it('password should be hashed in database', async () => {
    await Users.create({ username: 'weewee', password: 'booboo' });
    const response = await Users.findOne({ username });
    expect(response).not.toBeNull();
    expect(response?.password).not.toBe(password);
  });
  it('only stores signed up usernames', async () => {
    const response = await Users.findOne({ username: 'fakeUsername' });
    expect(response).toBeNull();
  });
  afterAll(async () => {
    connection.close();
  });
});
