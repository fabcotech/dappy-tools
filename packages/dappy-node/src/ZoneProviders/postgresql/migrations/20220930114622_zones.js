/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function up(knex) {
  return knex.schema.alterTable('zones', (table) => {
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function down(knex) {};
