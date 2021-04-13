'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CreditCardSchema extends Schema {
  up() {
    this.create('credit_cards', (table) => {
      table.increments()
      table.integer('user_id').unsigned().notNullable();
      table.string('masked_pan').notNullable();
      table.string('card_subtype').notNullable();
      table.string('card_token').notNullable();
      table.string('provider').notNullable();
      table.timestamps();

      table.foreign('user_id').references('user_id').inTable('students').onDelete('CASCADE');
    })
  }

  down() {
    this.drop('credit_cards')
  }
}

module.exports = CreditCardSchema
