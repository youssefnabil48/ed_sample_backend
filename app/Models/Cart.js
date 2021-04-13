'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Cart extends Model {
  static get primaryKey() {
    return 'id';
  }

  student() {
    return this.belongsTo('App/Models/Student', 'student_id', 'user_id');
  }

  courses() {
    return this.belongsToMany('App/Models/Course', 'cart_id', 'course_id').pivotTable('cart_items').pivotModel('App/Models/CartItem');
  }
}

module.exports = Cart
