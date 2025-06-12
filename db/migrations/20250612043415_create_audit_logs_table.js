/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('audit_logs', function(table) {
        table.increments('id').primary(); // serial4 NOT NULL PRIMARY KEY
        table.text('table_name').nullable(); // table_name text NULL
        table.integer('record_id').nullable(); // record_id int4 NULL
        table.text('action').nullable(); // "action" text NULL
        table.integer('user_id').nullable(); // user_id int4 NULL
        table.text('ip_address').nullable(); // ip_address text NULL
        table.text('request_id').nullable(); // request_id text NULL
        table.timestamp('timestamp').defaultTo(knex.fn.now()).nullable(); // "timestamp" timestamp DEFAULT now()
        table.jsonb('before_data').nullable(); // before_data jsonb NULL
        table.jsonb('after_data').nullable(); // after_data jsonb NULL
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('audit_logs');
};

