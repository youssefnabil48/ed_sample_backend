'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Unit extends Model {
  static get primaryKey() {
    return 'id';
  }

  course() {
    return this.belongsTo('App/Models/Course');
  }
}

module.exports = Unit
