const request = require('supertest');
const app = require('../app');

describe('Test the root path', () => {
  test('It should respond with "Hello World!"', () => {
    return request(app).get('/').expect('Hello World!');
  });
});
