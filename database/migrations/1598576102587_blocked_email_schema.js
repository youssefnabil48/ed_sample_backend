'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class BlockedEmailSchema extends Schema {
  up () {
    this.create('blocked_emails', (table) => {
      table.increments()
      table.string('email').notNullable().unique()
      table.timestamps()
    })
  }

  down () {
    this.drop('blocked_emails')
  }
}

module.exports = BlockedEmailSchema
