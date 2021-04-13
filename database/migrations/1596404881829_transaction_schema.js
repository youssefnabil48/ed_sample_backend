'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TransactionSchema extends Schema {
  up() {
    this.create('transactions', (table) => {
      table.increments();
      table.integer('creditcard_id').unsigned();
      table.string('transaction_ref').notNullable();
      table.string('provider');
      table.string('provider_ref');
      table.enum('method', ['PAYATFAWRY', 'CARD', 'EWALLET', 'WALLET', 'PAYATAMAN', 'PAYATMASARY', 'CASHCOLLECT']).notNullable();
      table.enum('status', ['unpaid', 'failed', 'pending', 'canceled', 'delivered', 'expired', 'refunded', 'paid', 'new']).notNullable();
      table.float('amount').notNullable();
      table.datetime('expiry_date');
      table.timestamps();

      table.foreign('creditcard_id').references('id').inTable('credit_cards');
    })
  }

  down() {
    this.drop('transactions')
  }
}

module.exports = TransactionSchema
