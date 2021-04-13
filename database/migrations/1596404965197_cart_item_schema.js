'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CartItemSchema extends Schema {
  up() {
    this.create('cart_items', (table) => {
      table.integer('cart_id').unsigned().notNullable();
      table.integer('course_id').unsigned().notNullable();
      table.timestamps();

      table.primary(['cart_id', 'course_id']);
      table.foreign('cart_id').references('id').inTable('carts').onDelete('CASCADE');
      table.foreign('course_id').references('id').inTable('courses').onDelete('CASCADE');
    })
  }

  down() {
    this.drop('cart_items')
  }
}

module.exports = CartItemSchema
