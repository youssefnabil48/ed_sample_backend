'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CartSchema extends Schema {
  up() {
    this.create('carts', (table) => {
      table.increments();
      table.integer('student_id').unsigned().notNullable().unique();
      table.float('amount').notNullable().defaultTo(0);
      table.timestamps();

      table.foreign('student_id').references('user_id').inTable('students').onDelete('CASCADE');
    })
  }

  down() {
    this.drop('carts')
  }
}

module.exports = CartSchema
