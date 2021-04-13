'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddSubscriptionControlToClassroomSchema extends Schema {
  up () {
    this.table('classrooms', (table) => {
      table.enum('sub_type', ['class', 'exam', 'revision']).defaultTo('class')
      table.enum('subsc_plan', ['*', 'month', 'week']).nullable().defaultTo('*')
      table.boolean('cancel_subc').defaultTo(true)
    })
  }

  down () {
    this.table('classrooms', (table) => {
      table.dropColumn('subsc_type')
      table.dropColumn('subsc_plan')
      table.dropColumn('calcel_subsc')
    })
  }
}

module.exports = AddSubscriptionControlToClassroomSchema
