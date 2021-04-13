'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class WalletLogSchema extends Schema {
  up () {
    this.create('wallet_logs', (table) => {
      table.increments()
      table.float('old_amount');
      table.float('amount')
      table.float('new_amount')
      table.text('description')
      table.integer('user_id').unsigned().notNullable()
      table.integer('invoice_id').unsigned().nullable()
      table.timestamp('timestamp').default(this.fn.now())
      table.timestamps()

      table.foreign('user_id').references('id').inTable('users');
      table.foreign('invoice_id').references('id').inTable('invoices');
    })
  }

  down () {
    this.drop('wallet_logs')
  }
}

module.exports = WalletLogSchema
