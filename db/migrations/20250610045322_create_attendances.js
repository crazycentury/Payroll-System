/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('attendances', function(table) {
        table.increments('id').primary(); // serial4 NOT NULL PRIMARY KEY
        table.integer('user_id').nullable(); // user_id int4 NULL
        table.date('date').notNullable(); // "date" date NOT NULL
        table.integer('created_by').nullable(); // created_by int4 NULL
        table.text('ip_address').nullable(); // ip_address text NULL
        table.timestamp('created_at').defaultTo(knex.fn.now()).nullable(); // created_at timestamp DEFAULT now()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).nullable(); // updated_at timestamp DEFAULT now()
        table.timestamp('clock_in').nullable(); // clock_in timestamp NULL
        table.timestamp('clock_out').nullable(); // clock_out timestamp NULL

        table.unique(['user_id', 'date']); // UNIQUE constraint
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('attendances');
};
