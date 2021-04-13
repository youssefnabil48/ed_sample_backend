'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Classroom extends Model {
  static get primaryKey() {
    return 'id';
  }

  students() {
    return this.belongsToMany('App/Models/Student', 'classroom_id', 'user_id', 'id', 'user_id').pivotTable('subscriptions');
  }

  instructor() {
    return this.belongsTo('App/Models/Instructor', 'instructor_id', 'user_id');
  }

  category() {
    return this.belongsTo('App/Models/Category')
  }

  courses() {
    return this.hasMany('App/Models/Course');
  }

  reviews() {
    return this.belongsToMany('App/Models/Student', 'classroom_id', 'user_id').pivotTable('reviews');
  }

  users() {
    return this.manyThrough('App/Models/Student', 'user', 'id', 'user_id');
  }
}

module.exports = Classroom
