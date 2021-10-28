import createServer from '../server/createServer';
import request from 'supertest';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const app = createServer();
describe('kafka unit tests', () => {
  beforeAll(() => {
    open({
      filename: '/tmp/database.db',
      driver: sqlite3.Database,
    }).then((db) => {
      db.exec(
        'CREATE TABLE test_test_undefined_ (topic, partition_0, partition_1);'
      );
      db.exec(
        "INSERT INTO test_test_undefined_ (topic, partition_0, partition_1) VALUES ('lets_get_that_meat', 10, 1);"
      );
    });
  });
  afterAll(() => {
    open({
      filename: '/tmp/database.db',
      driver: sqlite3.Database,
    }).then((db) => {
      db.exec('DROP TABLE test_test_undefined_');
    });
  });
  //cannot test create tables or refresh, as those routes require a running kafka instance
  it('should fetch all table from local sql database', async () => {
    const result = await request(app)
      .post('/kafka/fetchTables')
      .send()
      .expect(200);
    expect(
      result.body.filter((el: { name: string }) => el.name === 'test_test')
        .length > 0
    ).toBe(true);
  });
  it('should fetch topics from local sql database', async () => {
    const result = await request(app)
      .post('/kafka/fetchTopics')
      .send({ bootstrap: 'test_test' })
      .expect(200);
    expect(result.body).toEqual([{ topic: 'lets_get_that_meat' }]);
  });
});
