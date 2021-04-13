'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Transaction extends Model {
  static get primaryKey() {
    return 'id';
  }

  creditcard() {
    return this.hasOne('App/Models/CreditCard', 'creditcard_id', 'id')
  }

  invoice() {
    return this.belongsTo('App/Models/Invoice', 'id', 'transaction_id')
  }
}

module.exports = Transaction
