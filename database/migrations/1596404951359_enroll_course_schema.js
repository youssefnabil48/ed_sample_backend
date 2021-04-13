'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class EnrollCourseSchema extends Schema {
  up() {
    this.create('enroll_courses', (table) => {
      table.integer('user_id').unsigned().notNullable();
      table.integer('course_id').unsigned().notNullable();
      table.timestamps();

      table.primary(['user_id', 'course_id']);
      table.foreign('user_id').references('user_id').inTable('students').onDelete('CASCADE');
      table.foreign('course_id').references('id').inTable('courses').onDelete('CASCADE');
    })
  }

  down() {
    this.drop('enroll_courses')
  }
}

module.exports = EnrollCourseSchema
