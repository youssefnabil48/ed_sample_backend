'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Review extends Model {
  static get primaryKey() {
    return ['classroom_id', 'user_id'];
  }
}

module.exports = Review
