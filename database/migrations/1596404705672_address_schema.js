'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddressSchema extends Schema {
  up() {
    this.create('addresses', (table) => {
      table.integer('user_id').unsigned();
      table.string('building_number');
      table.string('floor');
      table.string('apartment');
      table.string('street');
      table.string('governorate');
      table.string('city');
      table.string('country');
      table.string('postal_code');
      table.timestamps();

      table.primary('user_id');
      table.foreign('user_id').references('user_id').inTable('students').onDelete('CASCADE');
    })
  }

  down() {
    this.drop('addresses')
  }
}

module.exports = AddressSchema
