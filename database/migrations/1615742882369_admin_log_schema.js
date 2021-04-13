'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AdminLogSchema extends Schema {
  up () {
    this.create('admin_logs', (table) => {
      table.increments()
      table.string('event').notNullable();
      table.string('tag').notNullable();
      table.text('description').notNullable();
      table.integer('admin_id').unsigned().notNullable()
      table.timestamps()

      table.foreign('admin_id').references('id').inTable('admins');
    })
  }

  down () {
    this.drop('admin_logs')
  }
}

module.exports = AdminLogSchema
