/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function up(knex) {
  return knex.schema.alterTable('zones', (table) => {
    table.string('public_key', 255).notNullable().defaultTo('aaa');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('renewed_at').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function down(knex) {};
