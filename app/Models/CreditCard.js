'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class CreditCard extends Model {
  static get primaryKey() {
    return 'id';
  }

  student() {
    return this.hasOne('App/Models/Student');
  }

  transactions() {
    return this.hasMany('App/Models/Transaction', 'id', 'creditcard_id')
  }
}

module.exports = CreditCard
