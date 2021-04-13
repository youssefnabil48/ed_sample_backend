'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class StudentSchema extends Schema {
  up() {
    this.create('students', (table) => {
      table.integer('user_id').unsigned();
      table.string('edu_type');
      table.string('edu_field');
      table.string('edu_year');
      table.text('dream_career');
      table.string('university');
      table.string('major');
      table.text('hobby');
      table.string('school');
      table.string('ssn');
      table.string('parent1_name');
      table.string('parent1_phone');
      table.string('parent2_name');
      table.string('parent2_phone');
      table.string('fb_link');
      table.boolean('profile_login').notNullable().defaultTo(false)
      table.boolean('profile_buy').notNullable().defaultTo(false)
      table.timestamps();

      table.primary('user_id');
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    })
  }

  down() {
    this.drop('students')
  }
}

module.exports = StudentSchema
