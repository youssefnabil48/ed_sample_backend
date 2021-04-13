'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class WalletSchema extends Schema {
  up() {
    this.create('wallets', (table) => {
      table.integer('user_id').unsigned();
      table.float('amount').notNullable().defaultTo(0);
      table.string('currency').notNullable().defaultTo('EGP');
      table.timestamps();

      table.primary('user_id');
      table.foreign('user_id').references('user_id').inTable('students').onDelete('CASCADE');
    })
  }

  down() {
    this.drop('wallets')
  }
}

module.exports = WalletSchema
