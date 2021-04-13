'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class VerificationSchema extends Schema {
  up() {
    this.create('verifications', (table) => {
      table.increments()
      table.integer('user_id').unsigned()
      table.string('token').notNullable().unique()
      table.enum('type', ['phone', 'email', 'device']).notNullable()
      table.timestamps()

      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE')
    })
  }

  down() {
    this.drop('verifications')
  }
}

module.exports = VerificationSchema
