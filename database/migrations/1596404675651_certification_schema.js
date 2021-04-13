'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CertificationSchema extends Schema {
  up() {
    this.create('certifications', (table) => {
      table.integer('user_id').unsigned();
      table.string('name').notNullable();
      table.date('issued_at').notNullable();
      table.timestamps()

      table.primary('user_id');
      table.foreign('user_id').references('user_id').inTable('instructors').onDelete('CASCADE');
    })
  }

  down() {
    this.drop('certifications')
  }
}

module.exports = CertificationSchema
