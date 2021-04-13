'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class InvoiceItem extends Model {
  static get primaryKey() {
    return ['invoice_id', 'course_id'];
  }
}

module.exports = InvoiceItem
