'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class InvoiceSchema extends Schema {
  up() {
    this.create('invoices', (table) => {
      table.increments();
      table.integer('transaction_id').unsigned();
      table.integer('user_id').unsigned().notNullable();
      table.string('invoice_ref').notNullable();
      table.datetime('invoice_date').notNullable();
      table.float('total_price').notNullable();
      table.float('price').notNullable();
      table.float('tax').notNullable().defaultTo(0);
      table.float('discount').defaultTo(0);
      table.enum('type', ['recharge', 'purchase', 'subscribe']).notNullable();
      table.enum('status', ['unpaid','failed', 'pending', 'canceled', 'delivered', 'expired', 'refunded', 'paid', 'new']);
      table.timestamps();

      table.foreign('transaction_id').references('id').inTable('transactions');
      table.foreign('user_id').references('user_id').inTable('students').onDelete('CASCADE');
    })
  }

  down() {
    this.drop('invoices')
  }
}

module.exports = InvoiceSchema
