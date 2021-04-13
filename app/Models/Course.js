'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Course extends Model {
  static get primaryKey() {
    return 'id';
  }

  students() {
    return this.belongsToMany('App/Models/Student', 'course_id', 'user_id', 'id', 'user_id').pivotTable('enroll_courses');
  }

  classroom() {
    return this.belongsTo('App/Models/Classroom');
  }

  units() {
    return this.hasMany('App/Models/Unit');
  }

  carts() {
    return this.belongsToMany('App/Models/Cart', 'course_id', 'cart_id').pivotTable('cart_items');
  }

  invoices() {
    return this.belongsToMany('App/Models/Invoice', 'course_id', 'invoice_id').pivotTable('invoice_items');
  }

  users() {
    return this.manyThrough('App/Models/Student', 'user', 'id', 'user_id');
  }
}

module.exports = Course
