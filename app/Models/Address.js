'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Address extends Model {
  static get primaryKey() {
    return 'user_id';
  }

  static get hidden() {
    return ['user_id'];
  }

  student() {
    return this.belongsTo('App/Models/Student')
  }
}

module.exports = Address
