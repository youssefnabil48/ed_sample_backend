'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AdminSchema extends Schema {
  up () {
    this.create('admins', (table) => {
      table.increments()
      table.string('uuid').notNullable().unique()
      table.string('email', 254).notNullable().unique()
      table.string('username').notNullable().unique()
      table.string('password', 60).notNullable()
      table.string('phone_number').notNullable().unique()
      table.string('first_name').notNullable()
      table.string('middle_name')
      table.string('last_name').notNullable()
      table.string('type').notNullable()
      table.enum('gender', ['male', 'female'])
      table.text('profile_photo')
      table.timestamps()
    })
  }

  down () {
    this.drop('admins')
  }
}

module.exports = AdminSchema
