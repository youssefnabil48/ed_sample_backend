'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Student extends Model {
  static get primaryKey() {
    return 'user_id';
  }

  static get hidden() {
    return ['user_id'];
  }

  user() {
    return this.belongsTo('App/Models/User');
  }

  // One to One Relations
  address() {
    return this.hasOne('App/Models/Address', 'user_id', 'user_id');
  }

  wallet() {
    return this.hasOne('App/Models/Wallet', 'user_id', 'user_id');
  }

  cart() {
    return this.hasOne('App/Models/Cart', 'user_id', 'student_id');
  }

  // One to Many Relations
  ips() {
    return this.hasMany('App/Models/Ip', 'user_id', 'user_id');
  }

  trustedDevices() {
    return this.hasMany('App/Models/TrustedDevice', 'user_id', 'user_id');
  }

  creditcards() {
    return this.hasMany('App/Models/CreditCard', 'user_id', 'user_id');
  }

  invoices() {
    return this.hasMany('App/Models/Invoice', 'user_id', 'user_id');
  }

  // Many to Many Relations
  courses() {
    return this.belongsToMany('App/Models/Course','user_id', 'course_id','user_id', 'id').pivotTable('enroll_courses').pivotModel('App/Models/EnrollCourse');
  }

  classrooms() {
    return this.belongsToMany('App/Models/Classroom', 'user_id', 'classroom_id', 'user_id', 'id').withPivot(['type', 'created_at']).pivotTable('subscriptions').pivotModel('App/Models/Subscription');
  }

  reviews() {
    return this.belongsToMany('App/Models/Classroom', 'user_id', 'classroom_id', 'user_id', 'id').pivotTable('reviews');
  }

  transactions() {
    return this.manyThrough('App/Models/Creditcard', 'transactions');
  }
}

module.exports = Student
