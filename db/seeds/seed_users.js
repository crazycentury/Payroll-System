const { faker } = require('@faker-js/faker');
//const faker = require('@faker-js/faker')
const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  await knex('users').del();

  const salt = await bcrypt.genSalt(10);

  // 100 Karyawan
  const employees = await Promise.all(
    Array.from({ length: 100 }).map(async (_, i) => {
      const name = faker.internet.username();
      return {
        username: name,
        password_hash: await bcrypt.hash('password123', salt),
        full_name: name,
        salary: faker.finance.amount(3000000, 10000000, 0),
        is_admin: false,
        created_at: new Date(),
        updated_at: new Date()
      };
    })
  );

  // 1 Admin
  const admin = {
    username: 'admin',
    password_hash: await bcrypt.hash('admin123', salt),
    full_name: 'Admin Payroll',
    salary: 0,
    is_admin: true,
    created_at: new Date(),
    updated_at: new Date()
  };

  await knex('users').insert([...employees, admin]);
};
