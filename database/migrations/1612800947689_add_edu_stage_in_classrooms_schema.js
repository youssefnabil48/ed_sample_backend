'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddEduStageInClassroomsSchema extends Schema {
  up () {
    this.table('classrooms', (table) => {
      table.string('edu_stage').nullable()
    })
  }

  down () {
    this.table('classrooms', (table) => {
      table.dropColumn('edu_stage')
    })
  }
}

module.exports = AddEduStageInClassroomsSchema
