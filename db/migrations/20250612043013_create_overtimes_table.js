/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('overtimes', function(table) {
        table.increments('id').primary(); // id serial4 NOT NULL PRIMARY KEY
        table.integer('user_id').nullable(); // user_id int4 NULL
        table.date('date').notNullable(); // "date" date NOT NULL
        table.decimal('hours', 3, 1).nullable(); // hours numeric(3,1) NULL
        table.integer('created_by').nullable(); // created_by int4 NULL
        table.text('ip_address').nullable(); // ip_address text NULL
        table.timestamp('created_at').defaultTo(knex.fn.now()).nullable(); // created_at timestamp DEFAULT now()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).nullable(); // updated_at timestamp DEFAULT now()

        // Check constraint (PostgreSQL only)
        table.check('hours <= 3'); // overtimes_hours_check CHECK ((hours <= 3))
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('overtimes');
};
