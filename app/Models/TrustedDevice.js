'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class TrustedDevice extends Model {
  static get primaryKey() {
    return ['user_id', 'device_uuid'];
  }

  static get hidden() {
    return ['user_id'];
  }

  student() {
    return this.hasOne('App/Models/Student');
  }
}

module.exports = TrustedDevice
