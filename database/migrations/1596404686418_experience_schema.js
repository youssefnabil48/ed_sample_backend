'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ExperienceSchema extends Schema {
  up() {
    this.create('experiences', (table) => {
      table.integer('user_id').unsigned();
      table.string('title').notNullable();
      table.string('institution');
      table.string('location');
      table.date('start_date');
      table.date('end_date');
      table.text('description');
      table.boolean('current').defaultTo(false)
      table.timestamps();

      table.primary('user_id');
      table.foreign('user_id').references('user_id').inTable('instructors').onDelete('CASCADE');
    })
  }

  down() {
    this.drop('experiences')
  }
}

module.exports = ExperienceSchema
