import axios from 'axios';
import * as child from 'child_process';
import path from 'path';
const serverURI = 'http://localhost:3001';
import userModels from '../client/server/userModels';
describe('user login unit tests', () => {
  let serverProcess: child.ChildProcess;
  beforeAll((done) => {
    serverProcess = child.fork(
      path.resolve(__dirname, '../client/server/server.ts')
    );
    done();
  });
  const username = 'weewee';
  const password = 'booboo';
  it('user should be able to login with a valid username and password', () => {
    axios({
      method: 'post',
      url: `${serverURI}/login`,
      data: { username, password },
    }).then((response) => {
      expect(response.status).toBe(200);
    });
  });
  it('password should be hashed in database', () => {
    userModels.findOne({ username }).then((response) => {
      expect(response?.password).not.toBe(password);
    });
  });
  afterAll((done) => {
    serverProcess.kill();
    done();
  });
});
