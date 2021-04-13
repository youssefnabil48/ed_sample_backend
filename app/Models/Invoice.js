'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Invoice extends Model {
  static get primaryKey() {
    return 'id';
  }

  static get dates () {
    return super.dates.concat(['created_at'])
  }

  transaction() {
    return this.hasOne('App/Models/Transaction', 'transaction_id', 'id');
  }

  student() {
    return this.belongsTo('App/Models/Student', 'user_id', 'user_id');
  }

  courses() {
    return this.belongsToMany('App/Models/Course', 'invoice_id', 'course_id').pivotTable('invoice_items').pivotModel('App/Models/InvoiceItem');
  }
}

module.exports = Invoice
