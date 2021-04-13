'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class InvoiceItemSchema extends Schema {
  up() {
    this.create('invoice_items', (table) => {
      table.integer('invoice_id').unsigned().notNullable();
      table.integer('course_id').unsigned().notNullable();
      table.timestamps();

      table.primary(['invoice_id', 'course_id']);
      table.foreign('invoice_id').references('id').inTable('invoices').onDelete('CASCADE');
      table.foreign('course_id').references('id').inTable('courses').onDelete('CASCADE');
    })
  }

  down() {
    this.drop('invoice_items')
  }
}

module.exports = InvoiceItemSchema
