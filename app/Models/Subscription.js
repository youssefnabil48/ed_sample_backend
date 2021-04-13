'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Subscription extends Model {
  static get primaryKey() {
    return ['user_id', 'classroom_id'];
  }
}

module.exports = Subscription
