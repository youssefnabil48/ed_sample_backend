'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddCourseFlagsSchema extends Schema {
  up () {
    this.table('courses', (table) => {
      table.boolean('scores_view').defaultTo(false)
      table.boolean('buyable').defaultTo(true)
    })
  }

  down () {
    this.table('courses', (table) => {
      table.dropColumn('scores_view')
      table.dropColumn('buyable')
    })
  }
}

module.exports = AddCourseFlagsSchema
