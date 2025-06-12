const request = require('supertest');
const app = require('../app'); // sesuaikan path ke app.js atau server.js
const db = require('../db/knex');
const { createTestUserAndLogin, resetTestDb } = require('./utils');

describe('POST /api/payroll-periods', () => {
    let adminToken;
    let userToken;

    beforeAll(async () => {
        await resetTestDb(); // Reset  database 

        // Buat user biasa dan admin, lalu login untuk dapat token
        const { admin, token: tokenAdmin } = await createTestUserAndLogin({ role: 'admin' });
        const { user, token: tokenUser } = await createTestUserAndLogin({ role: 'employee' });
        adminToken = tokenAdmin;
        userToken = tokenUser;
    });

    afterAll(async () => {
        await db.destroy();
    });

    test('✅ Admin can create a payroll period successfully', async () => {
        const res = await request(app)
        .post('/api/payroll-periods')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            start_date: '2025-06-01',
            end_date: '2025-06-30',
        });

        expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('data');
            expect(res.body.data).toMatchObject({
            start_date: '2025-06-01',
            end_date: '2025-06-30',
        });
    });

    test('❌ Should return 400 if start_date or end_date is missing', async () => {
        const res = await request(app)
        .post('/api/payroll-periods')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            start_date: '2025-06-01'
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/start_date and end_date are required/i);
    });

    test('❌ Should prevent overlapping payroll period', async () => {
        // First one already inserted above (June 1–30)
        const res = await request(app)
        .post('/api/payroll-periods')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            start_date: '2025-06-15',
            end_date: '2025-07-15',
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/overlapping payroll period/i);
    });

    test('❌ Employee should not be able to access this route', async () => {
        const res = await request(app)
        .post('/api/payroll-periods')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
            start_date: '2025-07-01',
            end_date: '2025-07-31',
        });

        expect(res.statusCode).toBe(403);
    });
});
