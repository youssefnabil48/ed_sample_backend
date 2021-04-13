'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CategorySchema extends Schema {
  up() {
    this.create('categories', (table) => {
      table.increments();
      table.integer('parent_id').unsigned();
      table.string('name').notNullable();
      table.text('description');
      table.timestamps();

      table.foreign('parent_id').references('id').inTable('categories').onDelete('CASCADE');
    })
  }

  down() {
    this.drop('categories')
  }
}

module.exports = CategorySchema
