/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('attendances', function(table) {
        table.increments('id').primary(); // serial primary key
        table.integer('user_id').nullable(); // bisa NULL
        table.date('date').notNullable(); // wajib diisi
        table.integer('created_by').nullable();
        table.text('ip_address').nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        table.unique(['user_id', 'date']); // UNIQUE constraint
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('attendances');
};
