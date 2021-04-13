'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TimelineSchema extends Schema {
  up () {
    this.create('timelines', (table) => {
      table.increments()
      table.string('event').notNullable();
      table.string('tag').notNullable();
      table.text('description').notNullable();
      table.integer('user_id').unsigned().notNullable()
      table.timestamp('timestamp').default(this.fn.now())
      table.timestamps()

      table.foreign('user_id').references('id').inTable('users');
    })
  }

  down () {
    this.drop('timelines')
  }
}

module.exports = TimelineSchema
