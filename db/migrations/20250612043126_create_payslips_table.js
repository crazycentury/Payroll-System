/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('payslips', function(table) {
        table.increments('id').primary(); // serial4 NOT NULL PRIMARY KEY
        table.integer('user_id').nullable(); // user_id int4 NULL
        table.integer('payroll_period_id').nullable(); // payroll_period_id int4 NULL
        table.integer('total_attendance_days').nullable(); // total_attendance_days int4 NULL
        table.decimal('prorated_salary', 15, 2).nullable(); // prorated_salary numeric(15,2) NULL
        table.decimal('total_overtime_hours', 5, 2).nullable(); // total_overtime_hours numeric(5,2) NULL
        table.decimal('overtime_pay', 15, 2).nullable(); // overtime_pay numeric(15,2) NULL
        table.decimal('reimbursement_total', 15, 2).nullable(); // reimbursement_total numeric(15,2) NULL
        table.decimal('total_take_home', 15, 2).nullable(); // total_take_home numeric(15,2) NULL
        table.timestamp('created_at').defaultTo(knex.fn.now()).nullable(); // created_at timestamp DEFAULT now()
        table.integer('created_by').nullable(); // created_by int4 NULL

        // Foreign key to payroll_periods
        table.foreign('payroll_period_id').references('id').inTable('payroll_periods');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('payslips');
};
