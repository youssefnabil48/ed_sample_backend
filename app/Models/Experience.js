'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Experience extends Model {
  static get primaryKey() {
    return 'user_id';
  }

  static get hidden() {
    return ['user_id'];
  }

  instructor() {
    return this.hasOne('App/Models/Instructor', 'user_id', 'user_id');
  }
}

module.exports = Experience
