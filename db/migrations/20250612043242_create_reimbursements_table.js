/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('reimbursements', function(table) {
        table.increments('id').primary(); // serial4 NOT NULL PRIMARY KEY
        table.integer('user_id').nullable(); // user_id int4 NULL
        table.date('date').notNullable(); // "date" date NOT NULL
        table.decimal('amount', 15, 2).nullable(); // amount numeric(15,2) NULL
        table.text('description').nullable(); // description text NULL
        table.integer('created_by').nullable(); // created_by int4 NULL
        table.text('ip_address').nullable(); // ip_address text NULL
        table.timestamp('created_at').defaultTo(knex.fn.now()).nullable(); // created_at timestamp DEFAULT now()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).nullable(); // updated_at timestamp DEFAULT now()
        table.integer('updated_by').nullable(); // updated_by int4 NULL
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('reimbursements');
};
