const request = require('supertest');
const app = require('../src/app');

describe('GET /health', () => {
    it('responde con JSON con status y timestamp', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBeGreaterThanOrEqual(200);
        expect(res.status).toBeLessThanOrEqual(503);
        expect(res.body).toHaveProperty('status');
        expect(res.body).toHaveProperty('timestamp');
        expect(['ok', 'degraded']).toContain(res.body.status);
    });
});
