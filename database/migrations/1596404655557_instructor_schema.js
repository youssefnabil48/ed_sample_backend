'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class InstructorSchema extends Schema {
  up() {
    this.create('instructors', (table) => {
      table.integer('user_id').unsigned();
      table.string('label').notNullable().unique()
      table.string('branch_id').notNullable().unique()
      table.string('branch_name').notNullable().unique()
      table.text('bio');
      table.string('university');
      table.string('degree');
      table.string('study_field');
      table.string('grad_year');
      table.string('fb_link');
      table.string('twitter_link');
      table.string('youtube_link');
      table.string('linkedin_link');
      table.string('website_link');
      table.timestamps();

      table.primary('user_id');
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    })
  }

  down() {
    this.drop('instructors')
  }
}

module.exports = InstructorSchema
