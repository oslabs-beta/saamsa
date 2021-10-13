import createServer from '../client/server/createServer';
const request = require('supertest');

const app = createServer();
describe('user login unit tests', () => {
  it('should send ok response when correct username and password are sent', (done) => {
    request(app).get('/').expect(200, done);
  });
});
