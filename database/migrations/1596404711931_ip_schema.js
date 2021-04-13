'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class IpSchema extends Schema {
  up() {
    this.create('ips', (table) => {
      table.increments()
      table.integer('user_id').unsigned().notNullable();
      table.string('ip_address').notNullable();
      table.timestamps();

      table.foreign('user_id').references('user_id').inTable('students').onDelete('CASCADE');
    })
  }

  down() {
    this.drop('ips')
  }
}

module.exports = IpSchema
