const request = require('supertest');
const app = require('../app');
const db = require('../db/knex');
const { createTestUser, loginAs, resetTestDb, createTestUserAndLogin} = require('./utils');

describe('Attendance API', () => {
    let userToken;
    let dataUser;

    beforeAll(async () => {
        await resetTestDb(); // Reset isi database test
        // user = await createTestUser({ role: 'employee' });
        // token = await loginAs(user);

        const { user, token: tokenUser } = await createTestUserAndLogin({ role: 'employee' });
        dataUser = user;
        userToken = tokenUser;
    });

    beforeEach(async () => {

        await db('attendances').del();
        await db('payroll_periods').del();

        // add 1 new periods
        await db('payroll_periods').insert({
        start_date: new Date(Date.now() - 86400000), // kemarin
        end_date: new Date(Date.now() + 86400000),   // besok
        is_processed: false,
        created_by: dataUser.id,
        created_at: new Date(),
        updated_at: new Date()
        });
    });

    afterAll(async () => {
        await db.destroy();
    });

    test('should clock in successfully', async () => {
        const res = await request(app)
        .post('/api/attendace/clock-in')
        .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Clock in recorded');
    });

    test('should not clock in again the same day', async () => {
        // First clock-in
        await request(app)
        .post('/api/attendace/clock-in')
        .set('Authorization', `Bearer ${userToken}`);

        // Second attempt
        const res = await request(app)
        .post('/api/attendace/clock-in')
        .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Already clocked in today');
    });

    test('should clock out successfully (test mode bypass)', async () => {
        // Clock-in dulu
        await request(app)
        .post('/api/attendace/clock-in')
        .set('Authorization', `Bearer ${userToken}`);

        // Clock-out dengan bypass test mode
        const res = await request(app)
        .post('/api/attendace/clock-out?test=true')
        .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Clock-out successful');
        expect(res.body.data.clock_out).toBeDefined();
    });

    test('should fail clock out without clock in', async () => {
        const res = await request(app)
        .post('/api/attendace/clock-out?test=true')
        .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('You must clock in before clocking out');
    });
});
 