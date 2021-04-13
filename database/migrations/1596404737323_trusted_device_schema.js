'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TrustedDeviceSchema extends Schema {
  up() {
    this.create('trusted_devices', (table) => {
      table.integer('user_id').unsigned();
      table.string('device_uuid');
      table.string('device').notNullable();
      table.timestamps();

      table.primary(['user_id', 'device_uuid']);
      table.foreign('user_id').references('user_id').inTable('students').onDelete('CASCADE');
    })
  }

  down() {
    this.drop('trusted_devices')
  }
}

module.exports = TrustedDeviceSchema
