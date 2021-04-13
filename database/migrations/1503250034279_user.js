'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  up() {
    this.create('users', (table) => {
      table.increments()
      table.string('lms_id').unique()
      table.string('uuid').notNullable().unique()
      table.string('email', 254).notNullable().unique()
      table.string('username').notNullable().unique()
      table.string('password', 60).notNullable()
      table.string('phone_number').notNullable().unique()
      table.string('first_name').notNullable()
      table.string('middle_name')
      table.string('last_name').notNullable()
      table.enum('gender', ['male', 'female'])
      table.text('profile_photo')
      table.date('birth_date')
      table.string('password_reset_token')
      table.boolean('email_verified').notNullable().defaultTo(false)
      table.boolean('phone_verified').notNullable().defaultTo(false)
      table.timestamps()
    })
  }

  down() {
    this.drop('users')
  }
}

module.exports = UserSchema
