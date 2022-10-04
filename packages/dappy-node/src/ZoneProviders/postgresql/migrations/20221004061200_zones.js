/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function up(knex) {
  return knex.schema.alterTable('zones', (table) => {
    table.dropPrimary();
    table.primary(['domain']);
    table.dropColumn('id');
  });
};

exports.down = function down(knex) {};
