import axios from 'axios';

const serverURI = 'http://localhost:3000';
import userModels from '../client/server/userModels';
describe('user login unit tests', () => {
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
});
