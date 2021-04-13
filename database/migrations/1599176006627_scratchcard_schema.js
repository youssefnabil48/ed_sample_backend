'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ScratchcardSchema extends Schema {
  up () {
    this.create('scratchcards', (table) => {
      table.increments()
      table.integer('user_id').unsigned()
      table.integer('course_id').unsigned().notNullable();
      table.string('code').unique().notNullable().index('code')
      table.timestamps();

      table.foreign('user_id').references('user_id').inTable('students').onDelete('CASCADE');
      table.foreign('course_id').references('id').inTable('courses').onDelete('CASCADE');
    })
  }

  down () {
    this.drop('scratchcards')
  }
}

module.exports = ScratchcardSchema
