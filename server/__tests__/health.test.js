const request = require('supertest');
const express = require('express');

describe('Health Check', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
  });

  it('should return 200 and health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
    expect(new Date(response.body.timestamp).toString()).not.toBe('Invalid Date');
  });
});
