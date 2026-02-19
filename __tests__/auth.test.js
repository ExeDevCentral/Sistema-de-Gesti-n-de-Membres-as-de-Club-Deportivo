const request = require('supertest');
const app = require('../src/app');

describe('POST /api/auth/login', () => {
    it('rechaza login sin body', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({});
        expect(res.status).toBe(400);
    });

    it('rechaza login con credenciales vacías', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .set('Content-Type', 'application/json')
            .send({ username: '', password: '' });
        expect(res.status).toBe(400);
    });
});
