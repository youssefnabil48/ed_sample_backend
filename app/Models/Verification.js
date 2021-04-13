'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Verification extends Model {
  static get primaryKey() {
    return 'user_id';
  }

  user(){
    return this.hasOne('App/Models/User');
  }
}

module.exports = Verification
