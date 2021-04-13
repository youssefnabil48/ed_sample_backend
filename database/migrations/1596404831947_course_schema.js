'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CourseSchema extends Schema {
  up() {
    this.create('courses', (table) => {
      table.increments();
      table.integer('classroom_id').unsigned().notNullable();
      table.string('lms_id').unique()
      table.string('name').notNullable();
      table.text('description');
      table.float('price').notNullable();
      table.integer('number').unsigned().notNullable();
      table.string('code');
      table.boolean('status').notNullable().defaultTo(false)
      table.text('thumbnail');
      table.timestamps();

      table.foreign('classroom_id').references('id').inTable('classrooms').onDelete('CASCADE');
    })
  }

  down() {
    this.drop('courses')
  }
}

module.exports = CourseSchema
