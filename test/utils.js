const db = require('../db/knex');
const request = require('supertest');
const app = require('../app');
const bcrypt = require('bcrypt');

async function createTestUserAndLogin({ role = 'employee' }) {
  const password = await bcrypt.hash('password', 10);
  const [user] = await db('users').insert({
    username: `Test_${role}`,
    password_hash: password,
    full_name: `Test ${role}`,
    salary: 1000000,
    is_admin: role === 'admin' ? true : false 
  }).returning('*');

  const loginRes = await request(app)
    .post('/api/login')
    .send({
      username: user.username,
      password: 'password',
    });

  return { user, token: loginRes.body.token };
}

async function createTestUser({ role = 'employee' }) {
  const password = await bcrypt.hash('password', 10);
  const [user] = await db('users').insert({
    username: `Test_${role}`,
    password_hash: password,
    full_name: `Test ${role}`,
    salary: 1000000,
    is_admin: role === 'admin' ? true : false 
  }).returning('*');

  return user;
}

async function resetTestDb() {
  await db.raw('TRUNCATE TABLE payroll_periods, users RESTART IDENTITY CASCADE');
}

async function loginAs(user) {
  const res = await request(app).post('/api/login').send({
    username: user.username,
    password: 'password',
  });
  return res.body.token;
}


module.exports = {
  createTestUserAndLogin,
  resetTestDb,
  loginAs,
  createTestUser
};
