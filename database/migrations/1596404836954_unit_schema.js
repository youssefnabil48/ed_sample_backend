'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UnitSchema extends Schema {
  up() {
    this.create('units', (table) => {
      table.increments();
      table.integer('course_id').unsigned().notNullable();
      table.string('lms_id').unique()
      table.string('name').notNullable();
      table.string('url')
      table.string('type').notNullable();
      table.timestamps();

      table.foreign('course_id').references('id').inTable('courses').onDelete('CASCADE');
    })
  }

  down() {
    this.drop('units')
  }
}

module.exports = UnitSchema
