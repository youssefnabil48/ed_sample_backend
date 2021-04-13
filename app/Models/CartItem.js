'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class CartItem extends Model {
  static get primaryKey() {
    return ['cart_id', 'course_id'];
  }
}

module.exports = CartItem
